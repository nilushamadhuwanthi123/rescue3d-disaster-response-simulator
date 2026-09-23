import { NavLink, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { Button } from './ui/Button';

const NAV_LINK_CLASS =
  'rounded-md px-3 py-2 text-sm font-medium text-text-muted hover:text-text-primary aria-[current=page]:bg-surface-raised aria-[current=page]:text-jade';

export function AppShell(): JSX.Element {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const preference = useThemeStore((s) => s.preference);
  const setPreference = useThemeStore((s) => s.setPreference);

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text-primary">
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold tracking-wide text-jade">RESCUE3D</span>
          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={NAV_LINK_CLASS}>
              Dashboard
            </NavLink>
            <NavLink to="/incidents" className={NAV_LINK_CLASS}>
              Incidents
            </NavLink>
            <NavLink to="/analytics" className={NAV_LINK_CLASS}>
              Analytics
            </NavLink>
            <NavLink to="/design-system" className={NAV_LINK_CLASS}>
              Design System
            </NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <select
            aria-label="Theme"
            value={preference}
            onChange={(e) => setPreference(e.target.value as 'dark' | 'light' | 'system')}
            className="rounded-md border border-border bg-surface-raised px-2 py-1 text-xs text-text-primary"
          >
            <option value="system">System</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
          {user ? (
            <>
              <span className="text-xs text-text-muted">{user.name}</span>
              <Button variant="ghost" onClick={() => logout()}>
                Sign out
              </Button>
            </>
          ) : null}
        </div>
      </header>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
