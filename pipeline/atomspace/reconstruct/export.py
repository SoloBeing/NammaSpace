import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

from ..config import ScenePaths

# OpenCV camera axes (x right, y down, looking +z) <-> OpenGL/nerfstudio (x right, y up, looking -z).
CV_TO_GL = np.diag([1.0, -1.0, -1.0, 1.0])


@dataclass
class Reconstruction:
    image_names: list[str]
    intrinsics: np.ndarray  # (N, 3, 3), pixels of the original keyframes
    cam_to_world: np.ndarray  # (N, 4, 4), OpenCV camera convention, recon space
    points: np.ndarray  # (M, 3) float32, recon space
    colors: np.ndarray  # (M, 3) uint8


def write_reconstruction(recon: Reconstruction, paths: ScenePaths) -> None:
    """Writes recon/transforms.json (nerfstudio-style, per-frame intrinsics) and recon/dense_points.ply.

    transform_matrix follows nerfstudio's OpenGL camera convention; file paths are relative to recon/.
    """
    paths.recon.mkdir(parents=True, exist_ok=True)
    frames = []
    for name, K, c2w in zip(recon.image_names, recon.intrinsics, recon.cam_to_world):
        w, h = ImageOps.exif_transpose(Image.open(paths.frames / name)).size
        frames.append({
            "file_path": f"../{paths.frames.name}/{name}",
            "transform_matrix": (c2w @ CV_TO_GL).tolist(),
            "fl_x": float(K[0, 0]),
            "fl_y": float(K[1, 1]),
            "cx": float(K[0, 2]),
            "cy": float(K[1, 2]),
            "w": w,
            "h": h,
        })
    paths.transforms.write_text(json.dumps(
        {"camera_model": "OPENCV", "ply_file_path": paths.dense_points.name, "frames": frames}, indent=2
    ))
    write_ply(paths.dense_points, recon.points, recon.colors)

    # A new reconstruction has its own arbitrary frame, so a scale reference picked in the old one is wrong.
    stale = [p for p in (paths.scale, paths.world) if p.exists()]
    for p in stale:
        p.unlink()
    if stale:
        print(f"Removed {', '.join(p.name for p in stale)}: the scale must be set again for the new reconstruction.")


def write_ply(path: Path, points: np.ndarray, colors: np.ndarray) -> None:
    """Binary little-endian PLY with float xyz and uchar rgb (what Open3D and splat trainers read)."""
    vertices = np.empty(len(points), dtype=[
        ("x", "<f4"), ("y", "<f4"), ("z", "<f4"), ("red", "u1"), ("green", "u1"), ("blue", "u1"),
    ])
    for i, axis in enumerate("xyz"):
        vertices[axis] = points[:, i]
    for i, channel in enumerate(("red", "green", "blue")):
        vertices[channel] = colors[:, i]
    header = (
        "ply\nformat binary_little_endian 1.0\n"
        f"element vertex {len(points)}\n"
        "property float x\nproperty float y\nproperty float z\n"
        "property uchar red\nproperty uchar green\nproperty uchar blue\n"
        "end_header\n"
    )
    with open(path, "wb") as f:
        f.write(header.encode("ascii"))
        f.write(vertices.tobytes())
