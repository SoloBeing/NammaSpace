from pathlib import Path


def extract_frames(video: Path, out_dir: Path, fps: float) -> list[Path]:
    """Extracts frames at `fps` with ffmpeg, honoring the rotation flag. Returns paths in time order."""
    raise NotImplementedError
