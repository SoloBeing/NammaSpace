# Architecture

## Goal

Replace static floor plans with a link that opens a walkable, photorealistic 3D copy of the building. Users explore in first person, search for a room or item, and fly straight to it. The long-term goal is Google Maps–style walking directions indoors, shown through the phone camera.

## v1 scope

| In v1 | Deferred to v2 |
|---|---|
| Video ingestion with blur and duplicate filtering | A* pathfinding + floor route ribbon |
| MASt3R-SfM reconstruction (poses + dense points) | VPS indexer (`vps_index.bin`) |
| 3D Gaussian splat for visuals | In-person AR HUD |
| Navmesh for collision | AI auto-tagging of POIs |
| Free-roam viewer with dead-stop collision | |
| Manual POI tagging + fuzzy search + fly-to | |

## Pipeline

```
[0] CAPTURE        smartphone video, 2K–4K, locked exposure, slow sweep, ~70% overlap
        │ .mp4
        ▼
[1] INGEST         probe metadata → choose track → slice frames → drop blurry → drop near-duplicates
        │ frames/*.jpg (≤ profile.max_keyframes) + ingest.json
        ▼
[2] RECONSTRUCT    fallback (default): MASt3R-SfM, sparse pair graph (window + retrieval)
        │          fast track: ARKit/ARCore poses + LiDAR depth from capture sidecars
        │ recon/transforms.json + recon/dense_points.ply   (recon space, up-to-scale on fallback)
        ├───────────────────────────────┐
        ▼                               ▼
[3] SPLAT                         [4] SCALE (user)
    gsplat, seeded from               two points + real distance → recon/scale.json
    dense points                        │
        │ bundle/scene.splat            ▼
        │                         [5] NAVMESH
        │                             floor RANSAC (camera up picks the floor) → align
        │                             +Y up → occupancy grid (ankle → head height) →
        │                             eroded by 0.4 m agent radius → outlines → triangles
        │                               │ bundle/navmesh.json + recon/world.json
        └───────────────┬───────────────┘
                        ▼
[6] BUNDLE         manifest.json + empty pois.json if new; everything validated against schemas/
                        │
                        ▼
[7] VIEWER         Three.js + gaussian-splats-3d
                   WASD free-roam · navmesh dead stop · POI pins · search · fly-to
                   admin (?admin): scale tool, POI editor
```

## Coordinate spaces

- **Recon space:** whatever MASt3R produced. Arbitrary orientation, arbitrary scale on the fallback track. The splat stays in this space.
- **World space:** meters, +Y up, floor at y = 0. Navmesh and POIs live here.
- **`manifest.world_from_recon`:** a 4x4 matrix (column-major) holding the scale factor and floor alignment. The viewer applies it to the splat so everything lines up. Changing the scale never requires retraining the splat.

## Metric scale

MASt3R output is only near-metric, so scale comes from the user: click two points with a known real distance (a door is about 2 m) in the viewer's scale tool, or pass them to `atomspace scale`. Until then the scene is `unscaled`, has no navmesh, and can still be viewed (`bundle` stands it upright around the first camera, so the scale tool has a usable view). On the fast track, sensor poses are already metric (`source: "sensor"`).

## Collision

There's no physics engine. Each frame the controls propose a move, and `NavmeshGuard.tryMove` checks whether the new position is still on the navmesh. If it isn't, the camera doesn't move at all: a dead stop, with no sliding along walls. On the navmesh, the camera is snapped to floor height + 1.6 m.

## GPU profiles

Processing works on any NVIDIA RTX 20-series or newer card with 8 GB+ VRAM. `gpu.resolve_profile()` picks limits by detected VRAM:

| Profile | Keyframes | Pair window / retrieval | Splat resolution | Max Gaussians |
|---|---|---|---|---|
| `vram_8gb` | 150 | 5 / 10 | 1/2 | 1.5M |
| `vram_12gb` | 250 | 8 / 15 | 1/2 | 3M |
| `vram_24gb` | 400 | 10 / 20 | full | 6M |

GPU stages write duration and peak VRAM to `scenes/<name>/logs/` so the limits can be tuned on real scenes. The test machine is an RTX 5050 laptop (8 GB, Blackwell `sm_120`) under WSL2.

## Decisions

| Decision | Reason |
|---|---|
| MASt3R-SfM instead of COLMAP or plain DUSt3R | Handles blank interior walls; DUSt3R alone doesn't scale past ~30 frames |
| User-supplied metric scale | Simple and reliable; no dependency on phone sensors |
| Pure-vision track is the default | Works with any phone; sensor track is a speedup when data exists |
| Dead-stop collision instead of wall sliding | Predictable, trivial to implement, no physics engine |
| Profiles by VRAM, not by GPU model | Any 8 GB+ Turing-or-newer card works; bigger cards get better quality |
| WSL2, no Docker | CUDA extensions build cleanly with gcc; no Docker GPU setup on Windows |
| Navmesh polygons store neighbours | A* can be added in v2 without rebuilding existing scenes |
