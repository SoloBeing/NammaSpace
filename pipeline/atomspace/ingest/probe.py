from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class VideoMeta:
    width: int
    height: int
    fps: float
    duration_s: float
    rotation_deg: int
    device_make: str | None
    device_model: str | None
    focal_length_35mm: float | None
    has_ar_poses: bool
    has_depth: bool


def probe_video(video: Path) -> VideoMeta:
    """Reads container metadata with ffprobe.

    Plain .mp4 files never carry AR poses or depth; those come from capture apps that
    export sidecar files next to the video, so has_ar_poses/has_depth check for them.
    """
    raise NotImplementedError
