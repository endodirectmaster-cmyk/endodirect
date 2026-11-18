#!/usr/bin/env bash
# Lê os slides de uma videoaula e imprime, com o minuto, o texto de cada slide.
#
#   slides.sh <url-do-video> <pasta-de-trabalho>
#
# A URL pode ser um .mp4 (Storage do Supabase, vídeos dos Resumos) ou o playlist.m3u8 do
# Bunny (aulas da EMC). Saída:
#   <pasta>/tempos.txt       segundo de cada quadro guardado
#   <pasta>/s_NNN.jpg(.txt)  o quadro e o texto lido pelo tesseract
#   <pasta>/tabela.txt       "m:ss  1ª linha | 2ª linha" a cada troca de cabeçalho
#   <pasta>/slides.txt       o texto inteiro de cada slide, agrupado
#
# Requisitos: ffmpeg, tesseract-ocr com o pacote por (apt-get install -y tesseract-ocr-por).
# ⚠️ O ffmpeg daqui não passa pelo proxy: o download é sempre com curl.
# ⚠️ O CDN do Bunny responde 403 sem o Referer do site.
# ⚠️ OMP_THREAD_LIMIT=1 é obrigatório: sem ele os tesseracts em paralelo disputam o
#    processador e ficam ~1.000× mais lentos.
set -euo pipefail
URL="$1"; DIR="$2"
# Queda passageira no meio do download ("Connection reset by peer"): cada pedido tenta de novo.
CURL=(curl -sS --retry 5 --retry-all-errors --retry-delay 2)
AQUI="$(cd "$(dirname "$0")" && pwd)"
REF="https://www.endodirect.com.br/"
mkdir -p "$DIR"
VID="$DIR/video.mp4"
PART="$DIR/video.part"   # baixa aqui e só vira video.mp4 completo (um download cortado não passa por pronto)

if [[ ! -s "$VID" ]]; then
  rm -f "$PART"
  if [[ "$URL" == *.m3u8* ]]; then
    # Bunny: escolhe a variante de 720p (ou a primeira), baixa init + segmentos e concatena.
    BASE="${URL%/*}"
    "${CURL[@]}" -H "Referer: $REF" "$URL" -o "$DIR/master.m3u8"
    VAR="$(grep -v '^#' "$DIR/master.m3u8" | grep -m1 720 || grep -v '^#' "$DIR/master.m3u8" | head -1)"
    if [[ -n "$VAR" && "$VAR" == *.m3u8 ]]; then
      VBASE="$BASE/${VAR%/*}"; "${CURL[@]}" -H "Referer: $REF" "$BASE/$VAR" -o "$DIR/var.m3u8"
    else
      VBASE="$BASE"; cp "$DIR/master.m3u8" "$DIR/var.m3u8"
    fi
    : > "$PART"
    INIT="$(grep -o 'URI="[^"]*"' "$DIR/var.m3u8" | head -1 | sed 's/URI="//;s/"$//' || true)"
    if [[ -n "$INIT" ]]; then "${CURL[@]}" -H "Referer: $REF" "$VBASE/$INIT" >> "$PART"; fi
    grep -v '^#' "$DIR/var.m3u8" | while read -r seg; do
      [[ -z "$seg" ]] && continue
      "${CURL[@]}" -H "Referer: $REF" "$VBASE/$seg" >> "$PART"
    done
  else
    "${CURL[@]}" -L "$URL" -o "$PART"
  fi
  mv "$PART" "$VID"
fi

# Trocas de slide: 2 quadros por segundo e corte de cena bem baixo (slide narrado muda
# pouco de pixel; com 0.10 só o 1º quadro passava).
# CORTE_ESQ=0.6 (aulas com o professor filmado à direita, como as do Endocrinologia Essencial): a
# troca de slide é medida só na parte esquerda do quadro; sem isso, cada gesto dele contava como
# slide novo (1.931 quadros em 19 min). Sem a variável, o quadro inteiro, como sempre.
CORTE=""
if [[ -n "${CORTE_ESQ:-}" ]]; then CORTE="crop=iw*${CORTE_ESQ}:ih:0:0,"; fi
rm -f "$DIR"/s_*.jpg "$DIR"/s_*.jpg.txt
ffmpeg -nostdin -loglevel info -i "$VID" \
  -vf "fps=2,${CORTE}select='eq(n\,0)+gt(scene\,0.004)',showinfo" -vsync vfr -q:v 3 "$DIR/s_%03d.jpg" 2> "$DIR/ffmpeg.log"
grep -o 'pts_time:[0-9.]*' "$DIR/ffmpeg.log" | cut -d: -f2 > "$DIR/tempos.txt"

ls "$DIR"/s_*.jpg | OMP_THREAD_LIMIT=1 xargs -P "$(nproc)" -I{} sh -c 'tesseract "{}" "{}" -l por >/dev/null 2>&1'
python3 -I -B "$AQUI/tabela.py" "$DIR" > "$DIR/tabela.txt"
python3 -I -B "$AQUI/agrupa.py" "$DIR" > "$DIR/slides.txt"
echo "quadros: $(wc -l < "$DIR/tempos.txt")  duração: $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$VID" | cut -d. -f1)s"
