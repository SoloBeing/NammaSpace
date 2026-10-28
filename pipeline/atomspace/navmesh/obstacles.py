from dataclasses import dataclass

import numpy as np

from ..config import NavmeshConfig


@dataclass
class OccupancyGrid:
    origin_xz: tuple[float, float]
    cell_size_m: float
    observed: np.ndarray  # (H, W) bool: floor was seen here
    blocked: np.ndarray  # (H, W) bool: something between ankle and head height


def occupancy_grid(points_world: np.ndarray, cfg: NavmeshConfig) -> OccupancyGrid:
    """Projects world points (y up, floor at 0) onto the XZ plane. Points between
    `ankle_height_m` and `agent_height_m` mark cells blocked; floor points mark cells observed.
    Unobserved cells stay unwalkable so holes in the capture don't become paths.
    """
    raise NotImplementedError
