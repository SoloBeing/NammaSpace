from enum import Enum

from .probe import VideoMeta


class Track(str, Enum):
    FALLBACK = "fallback"
    FAST = "fast"


def choose_track(meta: VideoMeta) -> Track:
    """Fast track needs sensor poses; everything else takes the pure-vision fallback (the default)."""
    return Track.FAST if meta.has_ar_poses else Track.FALLBACK
