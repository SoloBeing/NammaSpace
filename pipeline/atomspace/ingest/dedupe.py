from pathlib import Path


def select_keyframes(frames: list[Path], min_motion: float, max_keyframes: int) -> list[Path]:
    """Keeps a frame only once the view has changed enough since the last kept frame.

    `min_motion` is the fraction of the image that must have shifted (e.g. via optical flow).
    If more than `max_keyframes` survive, they are subsampled evenly so coverage stays uniform.
    """
    raise NotImplementedError
