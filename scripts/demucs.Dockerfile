FROM python:3.12-slim

# ffmpeg para leer/escribir audio y torch CPU (mucho más liviano que la rueda CUDA).
RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu \
  && pip install --no-cache-dir numpy demucs

WORKDIR /data

ENTRYPOINT ["python", "-m", "demucs"]
