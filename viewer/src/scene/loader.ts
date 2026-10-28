export type Vec3 = [number, number, number];

export interface Manifest {
  format_version: 1;
  scene: string;
  created_at: string;
  track: 'fallback' | 'fast';
  keyframes: number;
  world_from_recon: number[];
  scale: {
    source: 'user' | 'sensor' | 'unscaled';
    factor: number;
    reference?: { a: Vec3; b: Vec3; distance_m: number };
  };
  files: { splat: string; navmesh: string | null; pois: string };
}

export interface Navmesh {
  format_version: 1;
  units: 'm';
  agent: { radius_m: number; height_m: number; max_climb_m: number };
  vertices: Vec3[];
  polygons: { v: number[]; n?: number[] }[];
}

export interface Poi {
  id: string;
  name: string;
  aliases?: string[];
  category?: string;
  position: Vec3;
  view?: { position: Vec3; target: Vec3 };
  source: 'manual' | 'auto';
}

export interface SceneBundle {
  baseUrl: string;
  manifest: Manifest;
  navmesh: Navmesh | null;
  pois: Poi[];
  splatUrl: string;
}

const SCENES_BASE_URL = import.meta.env.VITE_SCENES_BASE_URL ?? '/scenes';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json() as Promise<T>;
}

export async function loadScene(name: string): Promise<SceneBundle> {
  const baseUrl = `${SCENES_BASE_URL}/${encodeURIComponent(name)}/bundle`;
  const manifest = await fetchJson<Manifest>(`${baseUrl}/manifest.json`);
  const [navmesh, poisFile] = await Promise.all([
    manifest.files.navmesh ? fetchJson<Navmesh>(`${baseUrl}/${manifest.files.navmesh}`) : Promise.resolve(null),
    fetchJson<{ format_version: 1; pois: Poi[] }>(`${baseUrl}/${manifest.files.pois}`),
  ]);
  return { baseUrl, manifest, navmesh, pois: poisFile.pois, splatUrl: `${baseUrl}/${manifest.files.splat}` };
}
