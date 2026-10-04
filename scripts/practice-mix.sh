#!/usr/bin/env bash
# Genera mezclas de práctica con Demucs (IA) usando Docker.
#
# Uso:
#   scripts/practice-mix.sh cancion.mp3            → "sin voz"
#   scripts/practice-mix.sh cancion.mp3 --guitar   → "sin voz" + "sin guitarra" + "solo batería" + "solo bajo"
#
# Requisitos: docker funcionando y ffmpeg instalado.
# La primera ejecución construye la imagen y descarga el modelo (tarda unos minutos).

set -euo pipefail

IMAGE="legato-demucs"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
CACHE_DIR="${HOME}/.cache/legato-demucs"

usage() {
  cat <<'EOF'
Genera mezclas de práctica con Demucs (IA) usando Docker.

Uso:
  scripts/practice-mix.sh <archivo-de-audio> [--guitar]

  --guitar   usa el modelo de 6 stems y genera además:
             "sin guitarra", "solo batería" y "solo bajo".

Salidas (listas para importar en Legato):
  <nombre> - sin voz.mp3
  <nombre> - sin guitarra.mp3
  <nombre> - solo batería.mp3
  <nombre> - solo bajo.mp3
EOF
}

if [ "$#" -lt 1 ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
  usage
  exit 0
fi

INPUT="$1"
shift
GUITAR=0
for arg in "$@"; do
  case "$arg" in
    --guitar) GUITAR=1 ;;
    *) echo "Opción desconocida: $arg" >&2; usage; exit 1 ;;
  esac
done

command -v docker >/dev/null 2>&1 || { echo "Falta docker. Instálalo o arráncalo." >&2; exit 1; }
command -v ffmpeg >/dev/null 2>&1 || { echo "Falta ffmpeg. Instálalo con el gestor de paquetes." >&2; exit 1; }
docker info >/dev/null 2>&1 || { echo "Docker no responde. ¿Está encendido el servicio?" >&2; exit 1; }
[ -f "$INPUT" ] || { echo "No existe el archivo: $INPUT" >&2; exit 1; }

INPUT_ABS="$(readlink -f "$INPUT")"
INPUT_DIR="$(dirname "$INPUT_ABS")"
INPUT_NAME="$(basename "$INPUT_ABS")"
BASENAME="${INPUT_NAME%.*}"
OUT_DIR="$ROOT_DIR/stems/$BASENAME"
mkdir -p "$OUT_DIR" "$CACHE_DIR"

if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "Construyendo la imagen $IMAGE (la primera vez tarda unos minutos)…"
  docker build -f "$SCRIPT_DIR/demucs.Dockerfile" -t "$IMAGE" "$SCRIPT_DIR"
fi

run_demucs() {
  # Las etiquetas :z permiten el acceso con SELinux (Fedora) sin desactivarlo.
  docker run --rm \
    --user "$(id -u):$(id -g)" \
    -e TORCH_HOME=/cache \
    -v "$CACHE_DIR":/cache:z \
    -v "$INPUT_DIR":/in:ro,z \
    -v "$OUT_DIR":/out:z \
    "$IMAGE" "$@"
}

if [ "$GUITAR" -eq 1 ]; then
  MODEL="htdemucs_6s"
else
  MODEL="htdemucs"
fi

echo "Separando «$BASENAME» con $MODEL (la primera vez descarga el modelo)…"
rm -rf "$OUT_DIR/$MODEL/$BASENAME"
if [ "$GUITAR" -eq 1 ]; then
  run_demucs -n "$MODEL" -o /out "/in/$INPUT_NAME"
else
  run_demucs -n "$MODEL" --two-stems=vocals -o /out "/in/$INPUT_NAME"
fi

STEMS_DIR="$OUT_DIR/$MODEL/$BASENAME"

to_mp3() {
  local source="$1"
  local target="$2"
  ffmpeg -y -loglevel error -i "$source" -codec:a libmp3lame -b:a 192k "$target"
  echo "  → $target"
}

mix_without() {
  local target="$1"
  shift
  local inputs=()
  local filters=""
  local index=0
  for stem in "$@"; do
    inputs+=(-i "$STEMS_DIR/$stem.wav")
    filters+="[$index]"
    index=$((index + 1))
  done
  ffmpeg -y -loglevel error "${inputs[@]}" \
    -filter_complex "${filters}amix=inputs=$index:duration=longest:normalize=0" \
    -codec:a libmp3lame -b:a 192k "$target"
  echo "  → $target"
}

echo "Creando mezclas de práctica en $OUT_DIR:"

if [ "$GUITAR" -eq 1 ]; then
  # Seis stems: se mezclan todos menos el que quieres silenciar.
  mix_without "$OUT_DIR/$BASENAME - sin voz.mp3" drums bass guitar piano other
  mix_without "$OUT_DIR/$BASENAME - sin guitarra.mp3" vocals drums bass piano other
  to_mp3 "$STEMS_DIR/drums.wav" "$OUT_DIR/$BASENAME - solo batería.mp3"
  to_mp3 "$STEMS_DIR/bass.wav" "$OUT_DIR/$BASENAME - solo bajo.mp3"
else
  # Cuatro stems con separación de voz: Demucs ya deja el acompañamiento.
  to_mp3 "$STEMS_DIR/no_vocals.wav" "$OUT_DIR/$BASENAME - sin voz.mp3"
fi

cat <<EOF

Listo. Importa los MP3 en Legato (Biblioteca → Importar música) y practica:
  · loop A–B para repetir el pasaje,
  · metrónomo encima (pestaña Práctica),
  · velocidad 0.5×–1× y transporte con ChordPro.

Stems originales (voz/batería/bajo/…): $STEMS_DIR
EOF
