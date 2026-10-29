import cv2
import numpy as np

from atomspace.ingest.blur import filter_sharp, sharpness


def _checkerboard(size: int = 256, cell: int = 16) -> np.ndarray:
    y, x = np.indices((size, size)) // cell
    return (((x + y) % 2) * 255).astype(np.uint8)


def _texture(seed: int, contrast: float) -> np.ndarray:
    rng = np.random.default_rng(seed)
    noise = cv2.GaussianBlur(rng.normal(0, 1, (360, 640)), (0, 0), 2)
    return np.clip(128 + contrast * noise / noise.std(), 0, 255).astype(np.uint8)


def test_blurred_image_scores_lower():
    sharp = cv2.cvtColor(_checkerboard(), cv2.COLOR_GRAY2BGR)
    blurred = cv2.GaussianBlur(sharp, (21, 21), 8)
    assert sharpness(sharp) > 5 * sharpness(blurred)


def test_drops_motion_blurred_frame(tmp_path):
    frames = []
    for i in range(9):
        img = _texture(i, contrast=40)
        if i == 4:
            img = cv2.blur(img, (25, 1))
        p = tmp_path / f"{i:05d}.jpg"
        cv2.imwrite(str(p), img)
        frames.append(p)
    kept = filter_sharp(frames, min_relative=0.6, window=15)
    assert frames[4] not in kept
    assert len(kept) == 8


def test_keeps_sharp_low_texture_frames(tmp_path):
    frames = []
    for i in range(9):
        p = tmp_path / f"{i:05d}.jpg"
        cv2.imwrite(str(p), _texture(i, contrast=3))
        frames.append(p)
    assert filter_sharp(frames, min_relative=0.6, window=15) == frames
