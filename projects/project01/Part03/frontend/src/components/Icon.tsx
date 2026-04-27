// Lucide icon shim — named imports only (per UI burr-patch N-4).
//
// `import * as LucideIcons` would defeat Vite's tree-shaking and pull in
// the full lucide-react surface (~50–200 KB). Named imports for only the
// icons we use keep the bundle lean.

import {
  Search,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  User,
  LogIn,
  HelpCircle,
  Home,
  Plus,
  Filter,
  Grid as GridIcon,
  List as ListIcon,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';

const map: Record<string, LucideIcon> = {
  search: Search,
  upload: Upload,
  document: FileText,
  photo: ImageIcon,
  trash: Trash2,
  close: X,
  check: Check,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  user: User,
  login: LogIn,
  help: HelpCircle,
  home: Home,
  plus: Plus,
  filter: Filter,
  grid: GridIcon,
  list: ListIcon,
  alert: AlertCircle,
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
}

export function Icon({ name, size = 16, className }: IconProps) {
  const Component = map[name] ?? Search; // sensible fallback
  return <Component size={size} className={className} />;
}
