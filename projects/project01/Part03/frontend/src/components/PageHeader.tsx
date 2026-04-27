// PageHeader — title + optional subtitle / breadcrumbs / actions row.
//
// Ports the visual contract from `ClaudeDesignDrop/raw/MBAi-460/src/shell.jsx`
// lines 247–270. Migrations:
//
//   * Andrew's reference passed `crumbs` items with optional `onClick` for
//     navigation. Part 03 uses react-router-dom, so breadcrumb hops with a
//     `to` field render as `<Link>` elements; items without `to` render as
//     plain text (current page / non-link).
//   * The arrow separator (`Icon name="arrowR"`) does not exist in our Icon
//     map — we use `chevronRight` which is already imported.
//   * Layout uses Tailwind utilities; the design tokens map to `bg-paper`,
//     `border-line`, `text-ink`, etc.

import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Icon } from '@/components/Icon';

export interface Breadcrumb {
  label: string;
  to?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header
      data-testid="page-header"
      className="flex items-center justify-between border-b border-line px-6 py-4"
    >
      <div className="min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav
            aria-label="Breadcrumb"
            className="mb-1 flex flex-wrap items-center gap-1 text-xs text-ink-3"
            data-testid="page-header-breadcrumbs"
          >
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}:${index}`} className="flex items-center gap-1">
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="text-ink-3 transition-colors hover:text-ink"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
                  )}
                  {!isLast && (
                    <Icon name="chevronRight" size={12} className="text-ink-4" />
                  )}
                </span>
              );
            })}
          </nav>
        )}
        <h1 className="m-0 truncate font-serif text-2xl font-medium leading-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-ink-2" data-testid="page-header-subtitle">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div
          className="ml-4 flex flex-shrink-0 items-center gap-2"
          data-testid="page-header-actions"
        >
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
