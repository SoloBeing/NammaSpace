import shutil
import subprocess
from pathlib import Path


def extract_frames(video: Path, out_dir: Path, fps: float, max_side: int) -> list[Path]:
    """Extracts JPEG frames at `fps`, upright (ffmpeg applies the rotation flag) and with
    the long side capped at `max_side`. Returns paths in time order; any previous contents
    of `out_dir` are removed first.
    """
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)

    scale = (
        f"scale='if(gte(iw,ih),min({max_side},iw),-2)'"
        f":'if(gte(iw,ih),-2,min({max_side},ih))'"
    )
    cmd = [
        "ffmpeg", "-v", "error", "-i", str(video),
        "-vf", f"fps={fps},{scale}",
        "-q:v", "2",
        str(out_dir / "%05d.jpg"),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg frame extraction failed: {result.stderr.strip()}")

    frames = sorted(out_dir.glob("*.jpg"))
    if not frames:
        raise RuntimeError(f"ffmpeg produced no frames from {video}.")
    return frames
