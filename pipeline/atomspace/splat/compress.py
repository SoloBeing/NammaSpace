from pathlib import Path


def ply_to_splat(ply: Path, out_splat: Path) -> None:
    """Converts a 3DGS .ply to the compact .splat web format (32 bytes per Gaussian:
    position f32x3, scale f32x3, RGBA u8x4, rotation u8x4), dropping near-transparent Gaussians.
    """
    raise NotImplementedError
