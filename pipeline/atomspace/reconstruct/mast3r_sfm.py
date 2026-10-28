from pathlib import Path

from ..config import Profile
from .export import Reconstruction


def reconstruct(frames: list[Path], profile: Profile, cache_dir: Path) -> Reconstruction:
    """Runs MASt3R-SfM on the keyframes.

    Pair graph: each frame is paired with its `profile.pair_window` temporal neighbours plus
    `profile.pair_retrieval_k` retrieval matches (retrieval checkpoint + ASMK), which keeps
    memory roughly linear in frame count. Then sparse global alignment
    (mast3r.cloud_opt.sparse_ga) solves poses, intrinsics and dense depth.

    Output is up-to-scale; metric scale is applied later from the user's reference.
    """
    raise NotImplementedError
