import cv2
import numpy as np
import pytest

from atomspace.ingest.blur import sharpness

pytestmark = pytest.mark.xfail(raises=NotImplementedError, reason="ingest not implemented yet")


def _checkerboard(size: int = 256, cell: int = 16) -> np.ndarray:
    y, x = np.indices((size, size)) // cell
    return (((x + y) % 2) * 255).astype(np.uint8)


def test_blurred_image_scores_lower():
    sharp = cv2.cvtColor(_checkerboard(), cv2.COLOR_GRAY2BGR)
    blurred = cv2.GaussianBlur(sharp, (21, 21), 8)
    assert sharpness(sharp) > 5 * sharpness(blurred)
