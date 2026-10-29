#!/usr/bin/env bash
# Downloads the MASt3R checkpoints (CC BY-NC-SA 4.0, non-commercial) into checkpoints/.
# Each file goes to <name>.part, is verified, then renamed, so a final path only ever
# holds a complete, verified file. Safe to interrupt and re-run.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/checkpoints"
SUMS="$ROOT/env/weights.sha256"
BASE="https://download.europe.naverlabs.com/ComputerVision/MASt3R"

# name|size in bytes|ETag. The ETag changes if Naver re-uploads a file, which would
# otherwise silently swap the model we tested against.
WEIGHTS=(
  "MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric.pth|2754910614|a4349996-61ce5970b7b3e"
  "MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric_retrieval_trainingfree.pth|8399111|802907-62353ee22bbe7"
  "MASt3R_ViTLarge_BaseDecoder_512_catmlpdpt_metric_retrieval_codebook.pkl|268435691|100000eb-62353f0200f20"
)

die() {
  echo "ERROR: $*" >&2
  exit 1
}

for tool in curl sha256sum; do
  command -v "$tool" >/dev/null || die "Missing $tool. Run: sudo apt install -y curl coreutils"
done

recorded_sha() {
  [[ -f "$SUMS" ]] || return 0
  awk -v n="$1" '$2 == n { print $1 }' "$SUMS"
}

NEW_SUMS=()

# verify <file> <name> <size>: size must match the pin; sha256 must match env/weights.sha256
# when recorded there. A hash seen for the first time is queued to be recorded.
verify() {
  local file="$1" name="$2" size="$3" actual sha expected
  actual="$(stat -c %s "$file")"
  if [[ "$actual" != "$size" ]]; then
    echo "    size mismatch: $actual bytes, expected $size" >&2
    return 1
  fi
  echo "    computing sha256..."
  sha="$(sha256sum "$file" | cut -d' ' -f1)"
  expected="$(recorded_sha "$name")"
  if [[ -z "$expected" ]]; then
    NEW_SUMS+=("$sha  $name")
  elif [[ "$sha" != "$expected" ]]; then
    echo "    sha256 mismatch: $sha, expected $expected" >&2
    return 1
  fi
}

mkdir -p "$DEST"
for entry in "${WEIGHTS[@]}"; do
  IFS='|' read -r name size etag <<<"$entry"
  final="$DEST/$name"
  part="$final.part"
  part_etag="$part.etag"
  echo "==> $name"

  if [[ -f "$final" ]]; then
    if verify "$final" "$name" "$size"; then
      echo "    OK (already downloaded)"
      continue
    fi
    echo "    existing file is bad; deleting and downloading again"
    rm -f "$final"
  fi

  headers="$(curl -sfIL --max-time 30 "$BASE/$name")" || die "Could not reach $BASE/$name"
  remote_etag="$(awk 'tolower($1) == "etag:" { e = $2 } END { print e }' <<<"$headers" | tr -d '"\r')"
  [[ "$remote_etag" == "$etag" ]] || die "Naver has replaced $name (server ETag '$remote_etag', pinned '$etag').
       Test the new file, then update its size/ETag in this script and its line in env/weights.sha256."

  # Resuming appends to the partial file, so it must come from the same upload as the server's.
  if [[ -f "$part" && "$(cat "$part_etag" 2>/dev/null || true)" != "$etag" ]]; then
    echo "    partial download is from a different upload; starting over"
    rm -f "$part"
  fi
  echo "$etag" >"$part_etag"

  if [[ ! -f "$part" || "$(stat -c %s "$part")" -lt "$size" ]]; then
    curl -fL --retry 3 --retry-delay 5 -C - -o "$part" "$BASE/$name" \
      || die "Download of $name failed. Re-run to resume."
  fi

  if verify "$part" "$name" "$size"; then
    mv -f "$part" "$final"
    rm -f "$part_etag"
    echo "    OK"
  else
    rm -f "$part" "$part_etag"
    die "Downloaded $name failed verification and was deleted. Re-run to download it again."
  fi
done

if (( ${#NEW_SUMS[@]} > 0 )); then
  printf '%s\n' "${NEW_SUMS[@]}" >>"$SUMS"
  echo
  echo "Recorded first-time checksums in env/weights.sha256."
  echo "Once 'python env/smoke_test.py' passes, commit that file so every future download is checked against it."
fi
echo "All weights verified in $DEST"
