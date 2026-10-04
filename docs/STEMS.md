# Stems para practicar (Demucs + Docker)

> **Qué es:** separar una canción en voz, batería, bajo, guitarra, piano y resto con **IA (Demucs)** para practicar encima. Ejemplo: saca «sin guitarra» y toca tú la guitarra sobre la base.
>
> **Cómo funciona aquí:** un script usa **Docker** para ejecutar Demucs sin instalarte Python ni PyTorch, y luego mezcla los stems con **ffmpeg**. Todo corre en tu equipo; no se sube nada a internet.

## Requisitos

- **Docker** funcionando (`docker info` debe responder sin errores).
- **ffmpeg** instalado (`ffmpeg -version`).
- La **primera vez** construye la imagen (~varios minutos: descarga PyTorch CPU y Demucs) y la primera separación descarga el modelo de Demucs (~300 MB). Después queda en caché.

## Uso

```bash
# Solo «sin voz» (modelo de 4 stems, el más rápido):
scripts/practice-mix.sh ~/Música/mi-cancion.mp3

# Además «sin guitarra», «solo batería» y «solo bajo» (modelo de 6 stems, más lento):
scripts/practice-mix.sh ~/Música/mi-cancion.mp3 --guitar
```

Las mezclas quedan en `stems/<nombre>/` (ignorada por git) y **listas para importar en Legato**:

- `<nombre> - sin voz.mp3` → cantar encima.
- `<nombre> - sin guitarra.mp3` → practicar guitarra sobre la base.
- `<nombre> - solo batería.mp3` / `solo bajo.mp3` → estudiar el groove o la línea.

Los stems separados (wav) quedan en `stems/<nombre>/htdemucs_6s/<nombre>/` por si quieres remezclar a tu gusto.

## Practicar en Legato

1. **Biblioteca → Importar música** y elige el MP3 generado.
2. Reproduce y usa:
   - **loop A–B** para repetir un pasaje,
   - **metrónomo** en la pestaña Práctica (puedes copiar el BPM detectado),
   - **velocidad 0.5×–1×**,
   - **ChordPro manual** si tienes la hoja de acordes (pestaña Acordes, con guía de importación),
   - la **Lista** (doble enlace) para ordenar tu sesión, y **Setlist** para el ensayo.

## Notas honestas

- La calidad depende de la canción: Demucs separa muy bien voz/batería/bajo; la guitarra puede mezclarse con el piano u «otros».
- En CPU tarda aproximadamente **1–3 minutos por canción** (modelo de 4 stems) y algo más con el de 6. En un portátil con GPU no aplica: esta imagen es CPU.
- Usa **tus propios archivos**. No descargues audio de plataformas de streaming para separarlo.
- La integración dentro de la web (botón «Aislar» con servidor local) queda como mejora futura; el script entrega el flujo completo hoy.
