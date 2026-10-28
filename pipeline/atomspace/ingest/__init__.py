import json
import shutil
from dataclasses import asdict
from pathlib import Path

from ..config import IngestConfig, ScenePaths
from .blur import filter_sharp
from .dedupe import select_keyframes
from .probe import probe_video
from .route import choose_track
from .slice import extract_frames


def run(video: Path, paths: ScenePaths, max_keyframes: int, cfg: IngestConfig = IngestConfig()) -> None:
    paths.ensure()
    stored = paths.raw / f"input{video.suffix.lower()}"
    if video.resolve() != stored.resolve():
        shutil.copy2(video, stored)

    meta = probe_video(stored)
    track = choose_track(meta)

    candidates_dir = paths.frames / "candidates"
    candidates = extract_frames(stored, candidates_dir, cfg.extract_fps)
    sharp = filter_sharp(candidates, cfg.min_sharpness)
    keyframes = select_keyframes(sharp, cfg.min_motion, max_keyframes)
    for frame in keyframes:
        shutil.copy2(frame, paths.frames / frame.name)
    shutil.rmtree(candidates_dir)

    paths.ingest_meta.write_text(
        json.dumps(
            {
                "video": stored.name,
                "meta": asdict(meta),
                "track": track.value,
                "candidates": len(candidates),
                "sharp": len(sharp),
                "keyframes": [f.name for f in keyframes],
            },
            indent=2,
        )
    )
    print(f"Ingest: {len(candidates)} frames -> {len(sharp)} sharp -> {len(keyframes)} keyframes ({track.value} track)")
