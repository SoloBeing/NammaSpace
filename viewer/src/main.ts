import './ui/styles.css';
import { mountPoiEditor } from './admin/poiEditor';
import { mountScaleTool } from './admin/scaleTool';
import { FirstPersonControls } from './controls/firstPerson';
import { NavmeshGuard } from './controls/navmeshGuard';
import { flyTo } from './poi/flyTo';
import { createPins } from './poi/pins';
import { createPoiSearch } from './poi/search';
import { loadScene } from './scene/loader';
import { createSplatViewer } from './scene/splatRenderer';
import { mountSearchBar } from './ui/searchBar';

async function start(app: HTMLElement, sceneName: string, admin: boolean) {
  const bundle = await loadScene(sceneName);
  const viewer = await createSplatViewer(app, bundle);
  const guard = bundle.navmesh ? new NavmeshGuard(bundle.navmesh) : null;
  const controls = new FirstPersonControls(viewer.camera, viewer.domElement);
  createPins(viewer.scene, bundle.pois);
  mountSearchBar(app, createPoiSearch(bundle.pois), (poi) => flyTo(viewer.camera, poi));

  if (admin) {
    mountScaleTool(viewer, bundle);
    mountPoiEditor(viewer, bundle);
  }

  viewer.onFrame((dt) => {
    const position = viewer.camera.position;
    const delta = controls.desiredMove(dt);
    position.copy(guard ? guard.tryMove(position, delta) : position.clone().add(delta));
  });
}

const app = document.getElementById('app')!;
const params = new URLSearchParams(location.search);
const scene = params.get('scene');

if (!scene) {
  app.textContent = 'Add ?scene=<name> to the URL.';
} else {
  start(app, scene, params.has('admin')).catch((err) => {
    console.error(err);
    app.textContent = `Could not load scene "${scene}": ${err.message}`;
  });
}
