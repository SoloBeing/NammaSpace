from ..config import Profile, ScenePaths
from ..gpu import gpu_stage
from .compress import ply_to_splat
from .train import train


def run(paths: ScenePaths, profile: Profile) -> None:
    with gpu_stage("splat", paths.logs):
        train(paths.frames, paths.transforms, paths.dense_points, paths.splat_ply, profile)
    ply_to_splat(paths.splat_ply, paths.splat)
    print(f"Splat: {paths.splat} ({paths.splat.stat().st_size / 1e6:.1f} MB)")
