import json

import numpy as np

from ..config import NavmeshConfig, ScenePaths
from ..reconstruct.export import read_ply
from ..reconstruct.scale import metric_factor
from .floor import fit_floor, world_from_floor
from .obstacles import occupancy_grid
from .polygonize import build_navmesh, safe_cells, walkable_mesh


def _mean_camera_up(paths: ScenePaths) -> np.ndarray:
    # transform_matrix uses OpenGL camera axes, so column 1 is the camera's up.
    frames = json.loads(paths.transforms.read_text())["frames"]
    return np.mean([np.array(f["transform_matrix"])[:3, 1] for f in frames], axis=0)


def run(paths: ScenePaths, cfg: NavmeshConfig = NavmeshConfig()) -> None:
    metric = metric_factor(paths)
    if metric is None:
        raise RuntimeError("No metric scale yet. Set it with the viewer's scale tool or `atomspace scale`.")
    factor, _ = metric
    paths.ensure()

    points, _ = read_ply(paths.dense_points)
    points = points.astype(np.float64) * factor
    plane = fit_floor(points, _mean_camera_up(paths))
    world_from_scaled = world_from_floor(plane)
    world_from_recon = world_from_scaled @ np.diag([factor, factor, factor, 1.0])
    points_world = points @ world_from_scaled[:3, :3].T + world_from_scaled[:3, 3]

    grid = occupancy_grid(points_world, cfg)
    safe = safe_cells(grid, cfg.agent_radius_m)
    vertices, triangles = walkable_mesh(safe, grid)
    navmesh = build_navmesh(vertices, triangles, cfg)

    # Column-major so the viewer can pass it straight to THREE.Matrix4.fromArray.
    paths.world.write_text(json.dumps({"world_from_recon": world_from_recon.T.flatten().tolist()}, indent=2))
    paths.navmesh.write_text(json.dumps(navmesh))
    area_m2 = safe.sum() * grid.cell_size_m**2
    print(f"Navmesh: {len(navmesh['polygons'])} polygons, {area_m2:.1f} m2 walkable")
