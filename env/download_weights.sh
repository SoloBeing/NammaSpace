#!/usr/bin/env bash
# MASt3R weights are CC BY-NC-SA 4.0 (non-commercial).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/checkpoints"
BASE="https://download.europe.naverlabs.com/ComputerVision/MASt3R"

mkdir -p "$DEST"
for f in \
  MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric.pth \
  MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric_retrieval_trainingfree.pth \
  MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric_retrieval_codebook.pkl
do
  echo "==> $f"
  wget -c "$BASE/$f" -O "$DEST/$f"
done
