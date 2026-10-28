# AtomSpace

Turns a smartphone video of an indoor space into a photorealistic 3D web scene you can walk through in first person, with walls and furniture you can't pass through and a search bar that flies you to named places.

```
.mp4 ──► frames ──► MASt3R-SfM ──► 3D Gaussian splat ──┐
                         │                             ├──► scene bundle ──► web viewer
                         └──────► navmesh ─────────────┘
```

Built for a hackathon. v1 covers capture through POI search; pathfinding and phone-camera AR navigation are planned for v2. See [docs/architecture.md](docs/architecture.md).

## Requirements

- **Processing:** an NVIDIA GPU from the RTX 20 series or newer with 8 GB+ VRAM, running WSL2 or Linux. Setup is in [env/README.md](env/README.md).
- **Viewer:** Node 20+, any modern browser.

## Usage

```bash
# on the GPU machine
conda activate atomspace
atomspace run office scenes_in/office.mp4      # ingest → reconstruct → splat → bundle

# set metric scale (two points + their real distance), then build the navmesh
atomspace scale office --a 0.1 0.0 2.3 --b 0.1 1.1 2.3 --distance 2.0
atomspace navmesh office && atomspace bundle office

# viewer (any machine)
cd viewer && npm install && npm run dev
# open http://localhost:5173/?scene=office        (add &admin for the scale and POI tools)
```

Each stage can be rerun on its own: `atomspace {ingest,reconstruct,splat,scale,navmesh,bundle} <scene>`.

## License note

MASt3R weights are CC BY-NC-SA 4.0 (non-commercial).
