/**
 * Browser stub for Node's `fs`.
 *
 * `httpsnippet` bundles its own copy of `form-data`, which does
 * `require("fs")` at module scope even though the file-stream code paths are
 * never reached when we hand it a plain HAR object. Turbopack resolves the
 * whole module graph, so the bare `require` fails the client build.
 *
 * Aliased for browser builds only via `turbopack.resolveAlias` in
 * next.config.ts, so server code that genuinely uses `fs` is untouched.
 */
const notAvailable = (name: string) => () => {
  throw new Error(`fs.${name} is not available in the browser`);
};

export const createReadStream = notAvailable("createReadStream");
export const readFileSync = notAvailable("readFileSync");
export const statSync = notAvailable("statSync");
export const stat = notAvailable("stat");

export default { createReadStream, readFileSync, statSync, stat };
