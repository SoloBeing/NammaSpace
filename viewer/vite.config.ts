import { createReadStream, statSync } from 'node:fs';
import { extname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin } from 'vite';

const SCENES_DIR = fileURLToPath(new URL('../scenes', import.meta.url));
const CONTENT_TYPES: Record<string, string> = {
  '.json': 'application/json',
  '.splat': 'application/octet-stream',
};

// Dev only: serves scenes/<name>/bundle/* at /scenes/<name>/bundle/*. Nothing outside bundle/ is exposed.
function serveSceneBundles(): Plugin {
  return {
    name: 'atomspace-scene-bundles',
    configureServer(server) {
      server.middlewares.use('/scenes', (req, res, next) => {
        const urlPath = decodeURIComponent((req.url ?? '').split('?')[0]);
        const file = resolve(SCENES_DIR, '.' + urlPath);
        const parts = relative(SCENES_DIR, file).split(sep);
        if (parts.includes('..') || parts.length < 3 || parts[1] !== 'bundle') return next();
        try {
          if (!statSync(file).isFile()) return next();
        } catch {
          return next();
        }
        res.setHeader('Content-Type', CONTENT_TYPES[extname(file)] ?? 'application/octet-stream');
        createReadStream(file).pipe(res);
      });
    },
  };
}

export default defineConfig({
  plugins: [serveSceneBundles()],
});
