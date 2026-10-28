import json

from ..config import Profile, ScenePaths
from ..gpu import gpu_stage
from ..ingest.route import Track
from . import mast3r_sfm, sensor_track
from .export import write_reconstruction


def run(paths: ScenePaths, profile: Profile) -> None:
    ingest_meta = json.loads(paths.ingest_meta.read_text())
    frames = [paths.frames / name for name in ingest_meta["keyframes"]]

    with gpu_stage("reconstruct", paths.logs):
        if ingest_meta["track"] == Track.FAST.value:
            recon = sensor_track.reconstruct(paths.raw, frames)
        else:
            recon = mast3r_sfm.reconstruct(frames, profile, cache_dir=paths.recon / "cache")

    write_reconstruction(recon, paths)
    print(f"Reconstruct: {len(recon.image_names)} cameras, {len(recon.points)} points")
