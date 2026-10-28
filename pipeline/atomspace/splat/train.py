from pathlib import Path

from ..config import Profile


def train(frames_dir: Path, transforms: Path, init_points: Path, out_ply: Path, profile: Profile) -> None:
    """Trains 3D Gaussians with gsplat, seeded from MASt3R's dense points.

    Memory limits from the profile: images downscaled by `splat_downscale`, densification
    stops growing at `splat_max_gaussians`, rasterization in packed mode.
    Output is a standard 3DGS .ply in recon space.
    """
    raise NotImplementedError
