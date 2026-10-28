from pathlib import Path

import numpy as np


def sharpness(image: np.ndarray) -> float:
    """Variance of the Laplacian on the grayscale image. Higher means sharper."""
    raise NotImplementedError


def filter_sharp(frames: list[Path], min_sharpness: float) -> list[Path]:
    raise NotImplementedError
