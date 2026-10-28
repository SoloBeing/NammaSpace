from dataclasses import dataclass

import numpy as np

from ..config import ScenePaths


@dataclass
class Reconstruction:
    image_names: list[str]
    intrinsics: np.ndarray  # (N, 3, 3), pixels of the original keyframes
    cam_to_world: np.ndarray  # (N, 4, 4), OpenCV camera convention, recon space
    points: np.ndarray  # (M, 3) float32, recon space
    colors: np.ndarray  # (M, 3) uint8


def write_reconstruction(recon: Reconstruction, paths: ScenePaths) -> None:
    """Writes recon/transforms.json (nerfstudio-style, per-frame intrinsics) and recon/dense_points.ply."""
    raise NotImplementedError
