// Shared shell: TopBar, LeftRail, PageHeader, toast, modal, avatar menu
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// -------- Toast system --------
const ToastContext = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((t) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((ts) => [...ts, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), t.duration || 3200);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 1000 }}>
        {toasts.map((t) => (
          <div key={t.id} className="fade-in" style={{
            background: "var(--color-paper-2)", border: "1px solid var(--color-line)",
            borderLeft: `3px solid var(--color-${t.tone || "accent"})`,
            borderRadius: "var(--r-md)", padding: "10px 14px",
            fontSize: "var(--fs-sm)", boxShadow: "var(--shadow-2)",
            minWidth: 260, maxWidth: 380, color: "var(--color-ink)",
          }}>
            {t.title && <div style={{ fontWeight: 500, marginBottom: t.body ? 2 : 0 }}>{t.title}</div>}
            {t.body && <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>{t.body}</div>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
const useToast = () => React.useContext(ToastContext);

// -------- Modal --------
function Modal({ open, onClose, title, children, footer, width = 480 }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 900,
      background: "rgba(28,27,24,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fade .15s ease",
    }}>
      <div onClick={(e) => e.stopPropagation()} className="fade-in" style={{
        width, maxWidth: "100%", maxHeight: "85vh",
        background: "var(--color-paper)", borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-3)", border: "1px solid var(--color-line)",
        display: "flex", flexDirection: "column",
      }}>
        {title && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "16px 20px", borderBottom: "1px solid var(--color-line)" }}>
            <div className="serif" style={{ fontSize: "var(--fs-lg)", flex: 1 }}>{title}</div>
            <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="close" size={16}/></button>
          </div>
        )}
        <div style={{ padding: "20px", overflowY: "auto" }}>{children}</div>
        {footer && <div style={{ padding: "12px 20px", borderTop: "1px solid var(--color-line)", display: "flex", gap: 8, justifyContent: "flex-end" }}>{footer}</div>}
      </div>
    </div>
  );
}

// -------- TopBar --------
function TopBar({ onNav, route, onOpenCmdK, onToggleTweaks, user, onLogout, onSearchInput, searchValue }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  useEffect(() => {
    const h = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  return (
    <header style={{
      height: "var(--topbar-h)", display: "flex", alignItems: "center",
      padding: "0 20px", gap: 16,
      borderBottom: "1px solid var(--color-line)",
      background: "var(--color-paper)",
      position: "sticky", top: 0, zIndex: 50,
    }}>
      <button onClick={() => onNav("/library")} className="row" style={{ gap: 10 }} aria-label="Home">
        <span style={{
          width: 26, height: 26, borderRadius: 6, background: "var(--color-accent)",
          display: "grid", placeItems: "center", color: "var(--color-accent-fg)",
          fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em",
        }}>M</span>
        <span className="serif" style={{ fontSize: 17, fontWeight: 500 }}>MBAi 460</span>
        <span className="pill" style={{ fontSize: 10, height: 18, marginLeft: 2 }}>Spring 2026</span>
      </button>

      <div style={{ flex: 1, maxWidth: 520, minWidth: 0, marginLeft: 24, position: "relative" }}>
        <button onClick={onOpenCmdK} style={{
          width: "100%", height: 34, padding: "0 10px 0 34px", textAlign: "left",
          background: "var(--color-paper-2)", border: "1px solid var(--color-line)",
          borderRadius: "var(--r-sm)", color: "var(--color-ink-3)",
          fontSize: "var(--fs-sm)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="search" size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--color-ink-3)", flexShrink: 0 }}/>
          <span className="truncate" style={{ flex: 1, minWidth: 0 }}>Search assets, labels, notes…</span>
          <span style={{ display: "flex", gap: 2, flexShrink: 0 }}>
            <kbd>⌘</kbd><kbd>K</kbd>
          </span>
        </button>
      </div>

      <div style={{ flex: "0 1 40px", minWidth: 8 }}/>

      <button className="btn btn-ghost btn-sm" onClick={onToggleTweaks} title="Tweaks panel" aria-label="Tweaks">
        <Icon name="sliders" size={16}/>
      </button>
      <button className="btn btn-ghost btn-sm" aria-label="Notifications" title="Notifications" style={{ position: "relative" }}>
        <Icon name="bell" size={16}/>
        <span style={{ position: "absolute", top: 4, right: 4, width: 6, height: 6, borderRadius: 3, background: "var(--color-accent)" }}/>
      </button>

      <div ref={menuRef} style={{ position: "relative" }}>
        <button onClick={() => setMenuOpen((x) => !x)} aria-label="Account menu" style={{
          width: 32, height: 32, borderRadius: "var(--r-full)",
          background: "var(--color-accent)", color: "var(--color-accent-fg)",
          fontWeight: 600, fontSize: 13,
        }}>
          {user.givenname[0]}{user.familyname[0]}
        </button>
        {menuOpen && (
          <div className="fade-in" style={{
            position: "absolute", top: 40, right: 0, minWidth: 220,
            background: "var(--color-paper)", border: "1px solid var(--color-line)",
            borderRadius: "var(--r-md)", boxShadow: "var(--shadow-2)", zIndex: 100, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--color-line)" }}>
              <div style={{ fontWeight: 500, fontSize: "var(--fs-sm)" }}>{user.givenname} {user.familyname}</div>
              <div className="muted" style={{ fontSize: "var(--fs-xs)" }}>@{user.username}</div>
            </div>
            <MenuItem icon="user"    onClick={() => { setMenuOpen(false); onNav("/profile"); }}>Profile</MenuItem>
            <MenuItem icon="settings" onClick={() => { setMenuOpen(false); onNav("/profile/settings"); }}>Settings</MenuItem>
            <MenuItem icon="help"    onClick={() => { setMenuOpen(false); onNav("/help"); }}>Keyboard help</MenuItem>
            <hr className="divider"/>
            <MenuItem icon="logout" tone="muted" onClick={() => { setMenuOpen(false); onLogout(); }}>Sign out</MenuItem>
            <div style={{ padding: "8px 14px", borderTop: "1px solid var(--color-line)", display: "flex", gap: 8, fontSize: 11, color: "var(--color-ink-3)" }}>
              <span>v0.1</span><span>·</span><span>Status</span><span>·</span><span>us-east-2</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
function MenuItem({ icon, children, onClick, tone }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", textAlign: "left", padding: "9px 14px",
      display: "flex", alignItems: "center", gap: 10,
      fontSize: "var(--fs-sm)", color: tone === "muted" ? "var(--color-ink-2)" : "var(--color-ink)",
    }} onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-paper-2)"}
       onMouseLeave={(e) => e.currentTarget.style.background = ""}>
      <Icon name={icon} size={15}/> {children}
    </button>
  );
}

// -------- LeftRail --------
function LeftRail({ route, onNav, isStaff, assetCount }) {
  const items = [
    { to: "/library", icon: "library", label: "Library", count: assetCount },
    { to: "/upload",  icon: "upload",  label: "Upload",  kbd: "U" },
    { to: "/chat",    icon: "chat",    label: "Chat",    dot: true },
  ];
  const aiItems = [
    { to: "/profile", icon: "user",    label: "Profile" },
  ];
  const staffItems = [
    { to: "/admin/users",  icon: "users",    label: "Users" },
    { to: "/admin/assets", icon: "database", label: "All assets" },
  ];
  const helpItems = [{ to: "/help", icon: "help", label: "Help & shortcuts", kbd: "?" }];

  return (
    <aside style={{
      width: "var(--rail-w)", flexShrink: 0,
      borderRight: "1px solid var(--color-line)",
      padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2,
      background: "var(--color-paper)",
      overflowY: "auto",
    }}>
      <RailGroup label="Workspace">
        {items.map((it) => <RailItem key={it.to} {...it} active={route.startsWith(it.to)} onClick={() => onNav(it.to)}/>)}
      </RailGroup>
      <RailGroup label="You">
        {aiItems.map((it) => <RailItem key={it.to} {...it} active={route.startsWith(it.to) && !route.startsWith("/profile/settings")} onClick={() => onNav(it.to)}/>)}
      </RailGroup>
      {isStaff && (
        <RailGroup label="Admin">
          {staffItems.map((it) => <RailItem key={it.to} {...it} active={route.startsWith(it.to)} onClick={() => onNav(it.to)}/>)}
        </RailGroup>
      )}
      <div style={{ flex: 1, minHeight: 16 }}/>
      <RailGroup>
        {helpItems.map((it) => <RailItem key={it.to} {...it} active={route === it.to} onClick={() => onNav(it.to)}/>)}
      </RailGroup>

      <div style={{ margin: "12px 4px 4px", padding: 12, borderRadius: "var(--r-md)", background: "var(--color-paper-2)", border: "1px dashed var(--color-line)", flexShrink: 0 }}>
        <div className="row" style={{ gap: 6, marginBottom: 4 }}>
          <Icon name="sparkle" size={14} style={{ color: "var(--color-accent)" }}/>
          <span style={{ fontSize: "var(--fs-xs)", fontWeight: 500 }}>Textract beta</span>
        </div>
        <div className="muted" style={{ fontSize: 11, lineHeight: 1.4 }}>
          OCR for handwritten notes and scanned docs. Turn it on per-upload.
        </div>
      </div>
    </aside>
  );
}
function RailGroup({ label, children }) {
  return (
    <div style={{ marginTop: label ? 8 : 0 }}>
      {label && <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", padding: "6px 10px 4px" }}>{label}</div>}
      {children}
    </div>
  );
}
function RailItem({ icon, label, active, onClick, kbd, count, dot }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "7px 10px", borderRadius: "var(--r-sm)",
      fontSize: "var(--fs-sm)", fontWeight: active ? 500 : 400,
      color: active ? "var(--color-ink)" : "var(--color-ink-2)",
      background: active ? "var(--color-paper-3)" : "transparent",
      width: "100%", position: "relative",
    }} onMouseEnter={(e) => !active && (e.currentTarget.style.background = "var(--color-paper-2)")}
       onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}>
      <Icon name={icon} size={17} style={{ color: active ? "var(--color-accent)" : "var(--color-ink-3)" }}/>
      <span className="grow truncate" style={{ textAlign: "left" }}>{label}</span>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: "var(--color-accent)" }}/>}
      {count != null && <span className="muted" style={{ fontSize: 11, fontVariantNumeric: "tabular-nums" }}>{count}</span>}
      {kbd && <kbd>{kbd}</kbd>}
    </button>
  );
}

// -------- PageHeader --------
function PageHeader({ title, subtitle, actions, crumbs }) {
  return (
    <div style={{ padding: "28px 32px 16px", borderBottom: "1px solid var(--color-line)" }}>
      {crumbs && (
        <div className="row muted" style={{ fontSize: "var(--fs-xs)", marginBottom: 6, gap: 4 }}>
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {c.onClick ? <button onClick={c.onClick} className="muted" style={{ fontSize: "inherit" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-ink)"} onMouseLeave={e => e.currentTarget.style.color = ""}>{c.label}</button> : <span>{c.label}</span>}
              {i < crumbs.length - 1 && <Icon name="arrowR" size={12}/>}
            </React.Fragment>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
        <div className="grow">
          <h1 className="serif" style={{ fontSize: "var(--fs-2xl)", lineHeight: 1.15, margin: 0, fontWeight: 500 }}>{title}</h1>
          {subtitle && <div className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 4 }}>{subtitle}</div>}
        </div>
        <div className="row" style={{ gap: 8 }}>{actions}</div>
      </div>
    </div>
  );
}

// -------- Shared utils --------
const fmtBytes = (n) => n > 1024*1024 ? (n/1048576).toFixed(1) + " MB" : n > 1024 ? Math.round(n/1024) + " KB" : n + " B";
const fmtDate = (t) => new Date(t).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const fmtDateRel = (t) => {
  const d = (Date.now() - t) / 86400_000;
  if (d < 1) return "today";
  if (d < 2) return "yesterday";
  if (d < 7) return Math.floor(d) + "d ago";
  return new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

Object.assign(window, { ToastProvider, useToast, Modal, TopBar, LeftRail, PageHeader, fmtBytes, fmtDate, fmtDateRel });
