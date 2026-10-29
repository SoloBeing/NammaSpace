import cv2
import numpy as np

from atomspace.ingest.dedupe import select_keyframes


def _write_frames(tmp_path, shifts):
    rng = np.random.default_rng(0)
    noise = cv2.GaussianBlur(rng.normal(0, 1, (240, 960)), (0, 0), 3)
    base = np.clip(128 + 50 * noise / noise.std(), 0, 255).astype(np.uint8)
    paths = []
    for i, dx in enumerate(shifts):
        p = tmp_path / f"{i:04d}.jpg"
        cv2.imwrite(str(p), base[:, dx : dx + 320])
        paths.append(p)
    return paths


def test_standing_still_keeps_one_frame(tmp_path):
    frames = _write_frames(tmp_path, [0] * 20)
    assert len(select_keyframes(frames, min_motion=0.15, max_keyframes=150)) == 1


def test_steady_motion_keeps_several_frames(tmp_path):
    frames = _write_frames(tmp_path, range(0, 300, 10))
    kept = select_keyframes(frames, min_motion=0.15, max_keyframes=150)
    assert 4 <= len(kept) <= 8


def test_respects_keyframe_cap(tmp_path):
    frames = _write_frames(tmp_path, range(0, 300, 10))
    kept = select_keyframes(frames, min_motion=0.0, max_keyframes=5)
    assert len(kept) == 5
    assert kept[0] == frames[0] and kept[-1] == frames[-1]
