// Runs the husky git-hooks install, but never fails `npm install` if husky
// isn't resolvable yet (fresh clone, offline install, CI without dev deps).
try {
  // eslint-disable-next-line global-require
  require('husky').install?.();
} catch {
  // husky not installed — skip silently, hooks just won't be wired up.
}
