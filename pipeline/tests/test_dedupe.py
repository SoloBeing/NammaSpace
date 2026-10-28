import cv2
import numpy as np
import pytest

from atomspace.ingest.dedupe import select_keyframes

pytestmark = pytest.mark.xfail(raises=NotImplementedError, reason="ingest not implemented yet")


def _write_frames(tmp_path, shifts):
    rng = np.random.default_rng(0)
    base = rng.integers(0, 255, (240, 640, 3), dtype=np.uint8)
    paths = []
    for i, dx in enumerate(shifts):
        p = tmp_path / f"{i:04d}.jpg"
        cv2.imwrite(str(p), np.roll(base, dx, axis=1)[:, :320])
        paths.append(p)
    return paths


def test_standing_still_keeps_one_frame(tmp_path):
    frames = _write_frames(tmp_path, [0] * 20)
    assert len(select_keyframes(frames, min_motion=0.15, max_keyframes=150)) == 1


def test_steady_motion_keeps_several_frames(tmp_path):
    frames = _write_frames(tmp_path, range(0, 300, 10))
    kept = select_keyframes(frames, min_motion=0.15, max_keyframes=150)
    assert 3 <= len(kept) < len(frames)


def test_respects_keyframe_cap(tmp_path):
    frames = _write_frames(tmp_path, range(0, 300, 10))
    assert len(select_keyframes(frames, min_motion=0.0, max_keyframes=5)) == 5
