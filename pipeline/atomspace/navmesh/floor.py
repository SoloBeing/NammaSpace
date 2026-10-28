from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class FloorPlane:
    """Plane n·p + offset = 0, with `normal` a unit vector pointing up into the room."""

    normal: np.ndarray
    offset: float


def fit_floor(points: np.ndarray) -> FloorPlane:
    """RANSAC over large planes; the floor is the large plane with most points above it."""
    raise NotImplementedError


def world_from_floor(plane: FloorPlane) -> np.ndarray:
    """4x4 rigid transform mapping the floor normal to +Y and the floor onto y = 0."""
    raise NotImplementedError
