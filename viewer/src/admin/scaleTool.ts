import type { SceneBundle } from '../scene/loader';
import type { SplatViewer } from '../scene/splatRenderer';

/**
 * Admin: click two points on the splat, type their real distance in meters.
 * Converts the clicks back to recon space (inverse of world_from_recon) and produces
 * the matching `atomspace scale <scene> --a ... --b ... --distance ...` command.
 */
export function mountScaleTool(viewer: SplatViewer, bundle: SceneBundle): void {
  throw new Error('mountScaleTool not implemented');
}
