# File structure

```
AtomSpace/
├── README.md
├── .gitignore                    # ignores weights, scene working data, build artifacts
├── .gitattributes                # Git LFS for *.splat/*.ply/*.mp4/*.mov; LF endings for *.sh
├── .gitmodules                   # pins third_party/mast3r
│
├── env/                          # GPU machine setup (WSL2 / Linux)
│   ├── README.md                 # step-by-step setup + common failures
│   ├── environment.yml           # conda: python 3.11, CUDA 12.8 toolkit, ffmpeg, faiss, cython
│   ├── requirements-gpu.txt      # torch/torchvision from the cu128 index (Turing → Blackwell)
│   ├── setup_wsl.sh              # checks GPU (≥ sm_75, ≥ 8 GB), builds ASMK, curope, gsplat for the detected arch
│   ├── download_weights.sh       # MASt3R + retrieval checkpoints → checkpoints/
│   └── smoke_test.py             # GPU/arch/profile check, gsplat forward+backward, MASt3R inference
│
├── third_party/
│   └── mast3r/                   # git submodule (includes dust3r)
│
├── checkpoints/                  # model weights, gitignored
│
├── pipeline/                     # Python: video → scene bundle
│   ├── pyproject.toml            # `atomspace` CLI entry point
│   ├── atomspace/
│   │   ├── cli.py                # run | ingest | reconstruct | splat | scale | navmesh | bundle
│   │   ├── config.py             # VRAM profiles, stage settings, ScenePaths (every file location)
│   │   ├── gpu.py                # VRAM detection, profile selection, gpu_stage() logging
│   │   ├── bundle.py             # writes manifest.json, validates bundle against schemas/
│   │   ├── ingest/
│   │   │   ├── probe.py          # ffprobe metadata + sensor sidecar detection
│   │   │   ├── route.py          # fallback (default) vs fast track
│   │   │   ├── slice.py          # ffmpeg frame extraction
│   │   │   ├── blur.py           # Laplacian-variance sharpness filter
│   │   │   └── dedupe.py         # motion-based keyframe selection, capped by profile
│   │   ├── reconstruct/
│   │   │   ├── mast3r_sfm.py     # MASt3R-SfM with sparse pair graph
│   │   │   ├── sensor_track.py   # fast track: ARKit/ARCore poses + LiDAR depth
│   │   │   ├── export.py         # Reconstruction → transforms.json + dense_points.ply
│   │   │   └── scale.py          # user scale reference → recon-to-meters factor
│   │   ├── splat/
│   │   │   ├── train.py          # gsplat training within profile limits
│   │   │   └── compress.py       # 3DGS .ply → web .splat
│   │   └── navmesh/
│   │       ├── floor.py          # RANSAC floor + align to +Y up
│   │       ├── obstacles.py      # occupancy grid between ankle and head height
│   │       └── polygonize.py     # 0.4 m erosion → outlines → triangles → navmesh dict
│   └── tests/                    # blur, dedupe, ingest, reconstruct, floor, navmesh
│
├── viewer/                       # Three.js web client (runs on any machine)
│   ├── package.json              # three, @mkkellogg/gaussian-splats-3d, fuse.js, vite
│   ├── vite.config.ts            # dev server also serves scenes/<name>/bundle/*
│   ├── tsconfig.json
│   ├── index.html
│   └── src/
│       ├── main.ts               # ?scene=<name> loads a bundle; &admin enables admin tools
│       ├── vite-env.d.ts         # VITE_SCENES_BASE_URL (CDN base in production)
│       ├── scene/
│       │   ├── loader.ts         # fetches manifest, navmesh, pois; bundle types
│       │   └── splatRenderer.ts  # splat viewer placed by world_from_recon
│       ├── controls/
│       │   ├── firstPerson.ts    # WASD + mouse look, proposes moves
│       │   └── navmeshGuard.ts   # lookahead dead stop + floor snap
│       ├── poi/
│       │   ├── search.ts         # fuzzy search (name, aliases, category)
│       │   ├── flyTo.ts          # camera flight to a POI
│       │   └── pins.ts           # 3D pins with labels
│       ├── admin/
│       │   ├── scaleTool.ts      # two points + distance → `atomspace scale` command
│       │   └── poiEditor.ts      # place, name and save POIs
│       └── ui/
│           ├── searchBar.ts
│           └── styles.css
│
├── scenes/<name>/                # one folder per captured space
│   ├── ingest.json               # video metadata, track, keyframe list      (gitignored)
│   ├── raw/                      # input video                               (gitignored)
│   ├── frames/                   # keyframes                                 (gitignored)
│   ├── recon/                    # transforms.json, dense_points.ply, splat.ply,
│   │                             # scale.json, world.json                    (gitignored)
│   ├── logs/                     # per-stage duration + peak VRAM            (gitignored)
│   └── bundle/                   # what the viewer loads
│       ├── manifest.json
│       ├── scene.splat
│       ├── navmesh.json          # absent until metric scale is set
│       └── pois.json
│
├── schemas/                      # contract between pipeline and viewer
│   ├── manifest.schema.json
│   ├── navmesh.schema.json
│   └── pois.schema.json
│
└── docs/
    ├── architecture.md
    └── file_structure.md
```
