import numpy as np
import pytest

from atomspace.navmesh.floor import fit_floor, world_from_floor

pytestmark = pytest.mark.xfail(raises=NotImplementedError, reason="navmesh not implemented yet")


def _room(rng) -> np.ndarray:
    floor = np.c_[rng.uniform(-3, 3, 5000), np.zeros(5000), rng.uniform(-3, 3, 5000)]
    table = np.c_[rng.uniform(0, 1, 800), rng.uniform(0, 0.75, 800), rng.uniform(0, 1, 800)]
    ceiling = np.c_[rng.uniform(-3, 3, 3000), np.full(3000, 2.6), rng.uniform(-3, 3, 3000)]
    return np.vstack([floor, table, ceiling])


def _random_rigid(rng) -> np.ndarray:
    q, _ = np.linalg.qr(rng.normal(size=(3, 3)))
    if np.linalg.det(q) < 0:
        q[:, 0] *= -1
    t = np.eye(4)
    t[:3, :3], t[:3, 3] = q, rng.normal(size=3)
    return t


def test_floor_is_found_under_tilted_room():
    rng = np.random.default_rng(0)
    pose = _random_rigid(rng)
    points = _room(rng) @ pose[:3, :3].T + pose[:3, 3]

    aligned = world_from_floor(fit_floor(points))
    restored = points @ aligned[:3, :3].T + aligned[:3, 3]

    floor_y = restored[:5000, 1]
    ceiling_y = restored[-3000:, 1]
    assert np.abs(floor_y).max() < 0.02
    assert np.allclose(ceiling_y, 2.6, atol=0.02)
