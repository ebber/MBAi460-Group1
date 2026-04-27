// LeftRail — collapsible primary-navigation sidebar.
//
// Ports the visual contract from `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
// lines 167–245. Behavioral migrations:
//
//   1. Andrew's reference passed `route` + `onNav` as props and used buttons.
//      The Part 03 app is wired with react-router-dom, so we read the active
//      route from `useLocation()` and emit `<Link>` elements directly. This
//      keeps the sidebar self-contained — App.tsx no longer needs to pipe
//      navigation state in.
//   2. Andrew's nav set was richer (Library + Upload + Chat + Profile +
//      admin tools). Per Part 03's MVP scope (Q9: chat / admin / settings
//      are Future-State workstreams), we render only the surfaces that
//      actually have routes today: Library, Upload, Search, Profile, Help.
//      Search aliases to /library for MVP — the focus=search query string
//      slot is reserved for the search UX workstream.
//   3. The sidebar collapse state lives in `useUIStore`. When collapsed
//      we shrink the rail to a 48px column and hide labels + group
//      headings (icons remain visible). The TopBar workstream owns the
//      toggle button.

import { Link, useLocation } from 'react-router-dom';

import { Icon } from '@/components/Icon';
import { useUIStore } from '@/stores/ui';

interface NavItem {
  to: string;
  icon: string;
  label: string;
  // For active-state matching: when set, the item is active if the current
  // pathname starts with this string. Defaults to `to`.
  matchPrefix?: string;
}

interface NavGroup {
  heading: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    heading: 'Workspace',
    items: [
      { to: '/library', icon: 'home', label: 'Library' },
      { to: '/upload', icon: 'upload', label: 'Upload' },
      // Search routes to /library for MVP; the focus=search affordance
      // is layered in by the search UX workstream.
      { to: '/library?focus=search', icon: 'search', label: 'Search', matchPrefix: '__never__' },
    ],
  },
  {
    heading: 'You',
    items: [{ to: '/profile', icon: 'user', label: 'Profile' }],
  },
  {
    heading: 'Help',
    items: [{ to: '/help', icon: 'help', label: 'Help' }],
  },
];

function isActive(pathname: string, item: NavItem): boolean {
  // `matchPrefix === '__never__'` lets us declare items that should never
  // claim active styling (e.g. the Search alias that shares /library's
  // pathname but represents a different intent).
  if (item.matchPrefix === '__never__') return false;
  const prefix = item.matchPrefix ?? item.to.split('?')[0] ?? item.to;
  if (pathname === prefix) return true;
  return pathname.startsWith(`${prefix}/`);
}

export function LeftRail() {
  const location = useLocation();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);

  // Width: 240px expanded, 48px collapsed. Labels hide via the `collapsed`
  // flag; icons remain so the rail is still usable as a compact launcher.
  const widthClass = collapsed ? 'w-12' : 'w-rail';

  return (
    <aside
      data-testid="left-rail"
      data-collapsed={collapsed ? 'true' : 'false'}
      aria-label="Primary"
      className={[
        widthClass,
        'flex-shrink-0',
        'bg-paper-2',
        'border-r border-line',
        'overflow-y-auto',
        'flex flex-col gap-2',
        'py-4',
        collapsed ? 'px-2' : 'px-3',
      ].join(' ')}
    >
      {groups.map((group) => (
        <div key={group.heading} className="flex flex-col">
          {!collapsed && (
            <div
              className="px-2 pb-1 pt-2 text-xs font-medium uppercase tracking-wider text-ink-3"
              data-testid={`rail-heading-${group.heading.toLowerCase()}`}
            >
              {group.heading}
            </div>
          )}
          <ul className="flex flex-col">
            {group.items.map((item) => {
              const active = isActive(location.pathname, item);
              return (
                <li key={`${group.heading}:${item.to}:${item.label}`}>
                  <Link
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    className={[
                      'flex items-center gap-3 rounded-sm transition-colors',
                      collapsed ? 'justify-center px-2 py-2' : 'px-2 py-2',
                      active
                        ? 'bg-accent-soft text-accent'
                        : 'text-ink-2 hover:bg-paper-3 hover:text-ink',
                    ].join(' ')}
                  >
                    <Icon
                      name={item.icon}
                      size={17}
                      className={active ? 'text-accent' : 'text-ink-3'}
                    />
                    {!collapsed && (
                      <span className="flex-1 truncate text-sm">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}

export default LeftRail;
