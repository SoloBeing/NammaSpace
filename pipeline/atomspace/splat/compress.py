from pathlib import Path

import numpy as np

SH_C0 = 0.28209479177387814  # zeroth spherical harmonic, turns f_dc into RGB
MIN_ALPHA = 5 / 255  # the viewer drops anything fainter when loading
# Largest axis / middle axis. Surfaces are flat discs, near 1; far above that is a needle that only
# looked right from the training views and shows as a streak from anywhere else.
MAX_NEEDLE_RATIO = 6.0

SPLAT_DTYPE = np.dtype([("position", "<f4", 3), ("scale", "<f4", 3), ("rgba", "u1", 4), ("rotation", "u1", 4)])


def _read_gaussians(ply: Path) -> np.ndarray:
    header, body = ply.read_bytes().split(b"end_header\n", 1)
    lines = header.decode("ascii").splitlines()
    if "format binary_little_endian 1.0" not in lines:
        raise ValueError(f"{ply.name} is not a binary little-endian PLY")
    properties = [line.split() for line in lines if line.startswith("property")]
    if any(kind != "float" for _, kind, _ in properties):
        raise ValueError(f"{ply.name} has non-float properties, so it isn't a 3DGS file")
    return np.frombuffer(body, dtype=[(name, "<f4") for _, _, name in properties])


def ply_to_splat(ply: Path, out_splat: Path) -> None:
    """Converts a 3DGS .ply to the compact .splat web format (32 bytes per Gaussian:
    position f32x3, scale f32x3, RGBA u8x4, rotation u8x4), dropping near-transparent and
    needle-shaped Gaussians.
    """
    g = _read_gaussians(ply)
    column = lambda *names: np.stack([g[name] for name in names], axis=1).astype(np.float64)
    alpha = 1 / (1 + np.exp(-g["opacity"].astype(np.float64)))

    positions = column("x", "y", "z")
    rotations = column("rot_0", "rot_1", "rot_2", "rot_3")
    scales = np.exp(column("scale_0", "scale_1", "scale_2"))
    colors = 0.5 + SH_C0 * column("f_dc_0", "f_dc_1", "f_dc_2")

    lengths = np.linalg.norm(rotations, axis=1, keepdims=True)
    finite = np.isfinite(np.c_[positions, rotations, scales, colors]).all(axis=1) & (lengths[:, 0] > 0)
    ordered = np.sort(np.where(np.isfinite(scales), scales, 0), axis=1)
    needle = ordered[:, 2] > MAX_NEEDLE_RATIO * ordered[:, 1]
    keep = finite & (alpha >= MIN_ALPHA) & ~needle
    if not keep.any():
        raise ValueError(f"{ply.name} has no visible Gaussians.")

    out = np.empty(int(keep.sum()), dtype=SPLAT_DTYPE)
    out["position"] = positions[keep]
    out["scale"] = scales[keep]
    out["rgba"] = np.clip(np.c_[colors[keep], alpha[keep]] * 255, 0, 255).round().astype(np.uint8)
    out["rotation"] = np.clip(rotations[keep] / lengths[keep] * 128 + 128, 0, 255).round().astype(np.uint8)
    out_splat.parent.mkdir(parents=True, exist_ok=True)
    out_splat.write_bytes(out.tobytes())
