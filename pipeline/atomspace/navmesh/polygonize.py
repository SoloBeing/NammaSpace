import numpy as np

from .obstacles import OccupancyGrid


def walkable_mesh(grid: OccupancyGrid) -> tuple[np.ndarray, np.ndarray]:
    """Turns observed-and-unblocked cells into a triangle mesh at y = 0.

    Returns (vertices (V, 3), triangles (T, 3)) — the input geometry Recast expects.
    """
    raise NotImplementedError
