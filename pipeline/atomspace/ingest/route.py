from enum import Enum

from .probe import VideoMeta


class Track(str, Enum):
    FALLBACK = "fallback"
    FAST = "fast"


def choose_track(meta: VideoMeta) -> Track:
    """Always the pure-vision default for now. The sensor fast track is built after the
    default track works end to end; it will switch on meta.has_ar_poses.
    """
    return Track.FALLBACK
