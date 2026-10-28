import numpy as np

from ..config import NavmeshConfig


def build_navmesh(vertices: np.ndarray, triangles: np.ndarray, cfg: NavmeshConfig) -> dict:
    """Runs Recast on the walkable mesh, eroding by `agent_radius_m` so the camera keeps
    that buffer from walls and furniture. Returns a dict matching schemas/navmesh.schema.json,
    including polygon neighbours so A* can be added in v2 without rebuilding scenes.
    """
    raise NotImplementedError
