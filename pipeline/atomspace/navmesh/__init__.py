import json

import numpy as np

from ..config import NavmeshConfig, ScenePaths
from ..reconstruct.scale import metric_factor
from .floor import fit_floor, world_from_floor
from .obstacles import occupancy_grid
from .polygonize import walkable_mesh
from .recast import build_navmesh


def run(paths: ScenePaths, cfg: NavmeshConfig = NavmeshConfig()) -> None:
    metric = metric_factor(paths)
    if metric is None:
        raise RuntimeError("No metric scale yet. Set it with the viewer's scale tool or `atomspace scale`.")
    factor, _ = metric

    import open3d as o3d

    points = np.asarray(o3d.io.read_point_cloud(str(paths.dense_points)).points) * factor
    plane = fit_floor(points)
    world_from_scaled = world_from_floor(plane)
    world_from_recon = world_from_scaled @ np.diag([factor, factor, factor, 1.0])
    points_world = points @ world_from_scaled[:3, :3].T + world_from_scaled[:3, 3]

    grid = occupancy_grid(points_world, cfg)
    vertices, triangles = walkable_mesh(grid)
    navmesh = build_navmesh(vertices, triangles, cfg)

    # Column-major so the viewer can pass it straight to THREE.Matrix4.fromArray.
    paths.world.write_text(json.dumps({"world_from_recon": world_from_recon.T.flatten().tolist()}, indent=2))
    paths.navmesh.write_text(json.dumps(navmesh))
    print(f"Navmesh: {len(navmesh['polygons'])} polygons")
