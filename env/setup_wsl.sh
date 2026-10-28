#!/usr/bin/env bash
# One-time setup of the GPU environment inside WSL2 Ubuntu (or native Linux).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_NAME="atomspace"
BUILD_DIR="$ROOT/third_party/_build"

echo "==> Checking GPU"
if ! command -v nvidia-smi >/dev/null; then
  echo "nvidia-smi not found. Install the latest NVIDIA driver on Windows; WSL2 picks it up automatically." >&2
  exit 1
fi

GPU_NAME="$(nvidia-smi --query-gpu=name --format=csv,noheader | head -n1)"
CAP="$(nvidia-smi --query-gpu=compute_cap --format=csv,noheader | head -n1 | tr -d ' ')"
MEM_MIB="$(nvidia-smi --query-gpu=memory.total --format=csv,noheader,nounits | head -n1 | tr -d ' ')"
CAP_INT="${CAP/./}"
echo "    $GPU_NAME | compute capability $CAP | ${MEM_MIB} MiB"

if (( CAP_INT < 75 )); then
  echo "Compute capability $CAP is too old. Minimum is 7.5 (RTX 20 series / Turing)." >&2
  exit 1
fi
if (( MEM_MIB < 7600 )); then
  echo "Only ${MEM_MIB} MiB VRAM. Minimum supported is 8 GB." >&2
  exit 1
fi
export TORCH_CUDA_ARCH_LIST="$CAP"

echo "==> Checking build tools"
if ! command -v gcc >/dev/null || ! command -v git >/dev/null; then
  echo "Missing gcc/git. Run: sudo apt update && sudo apt install -y build-essential git wget" >&2
  exit 1
fi

echo "==> Creating conda env '$ENV_NAME'"
# shellcheck disable=SC1091
source "$(conda info --base)/etc/profile.d/conda.sh"
if conda env list | awk '{print $1}' | grep -qx "$ENV_NAME"; then
  conda env update -n "$ENV_NAME" -f "$ROOT/env/environment.yml"
else
  conda env create -n "$ENV_NAME" -f "$ROOT/env/environment.yml"
fi
conda activate "$ENV_NAME"
export CUDA_HOME="$CONDA_PREFIX"

echo "==> Installing PyTorch (cu128)"
pip install -r "$ROOT/env/requirements-gpu.txt"

echo "==> Fetching MASt3R submodule"
git -C "$ROOT" submodule update --init --recursive
pip install -r "$ROOT/third_party/mast3r/requirements.txt"
pip install -r "$ROOT/third_party/mast3r/dust3r/requirements.txt"

echo "==> Building ASMK (retrieval for MASt3R-SfM pair selection)"
mkdir -p "$BUILD_DIR"
if [ ! -d "$BUILD_DIR/asmk" ]; then
  git clone https://github.com/jenicek/asmk "$BUILD_DIR/asmk"
fi
(cd "$BUILD_DIR/asmk/cython" && cythonize ./*.pyx)
pip install "$BUILD_DIR/asmk"

echo "==> Building curope for sm_${CAP_INT} (optional speedup)"
if ! (cd "$ROOT/third_party/mast3r/dust3r/croco/models/curope" && python setup.py build_ext --inplace); then
  echo "    curope build failed; MASt3R will fall back to the slower PyTorch RoPE." >&2
fi

echo "==> Building gsplat for sm_${CAP_INT}"
pip install --no-build-isolation "git+https://github.com/nerfstudio-project/gsplat.git"

echo "==> Installing AtomSpace pipeline"
pip install -e "$ROOT/pipeline[dev]"

echo
echo "Done. Next:"
echo "  bash env/download_weights.sh"
echo "  conda activate $ENV_NAME && python env/smoke_test.py"
