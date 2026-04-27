// Mobile shell: top bar, bottom tab nav, bottom sheets
const { useState: useSM, useEffect: useEM, useRef: useRM, useMemo: useMemoM } = React;

function MTopBar({ title, onBack, right, onSearch }) {
  return (
    <div className="m-topbar">
      {onBack ? (
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
      ) : (
        <div className="logo">M</div>
      )}
      <div className="grow truncate" style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>{title}</div>
      {onSearch && <button className="icon-btn" onClick={onSearch} aria-label="Search"><Icon name="search" size={18}/></button>}
      {right}
    </div>
  );
}

function MTabBar({ tab, onTab, isStaff }) {
  const tabs = [
    { id: "library", icon: "library", label: "Library" },
    { id: "upload",  icon: "upload",  label: "Upload" },
    { id: "chat",    icon: "chat",    label: "Chat", dot: true },
    { id: "profile", icon: "user",    label: "You" },
    { id: "more",    icon: "menu",    label: "More" },
  ];
  return (
    <div className="m-tabbar">
      {tabs.map(t => (
        <button key={t.id} className={"m-tab" + (tab === t.id ? " active" : "")} onClick={() => onTab(t.id)}>
          <Icon name={t.icon} size={22} strokeWidth={t.id === tab ? 2 : 1.75}/>
          <span>{t.label}</span>
          {t.dot && <span className="dot"/>}
        </button>
      ))}
    </div>
  );
}

function MSheet({ open, onClose, title, children, footer, height = "auto" }) {
  useEM(() => {
    if (!open) return;
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="m-sheet-scrim" onClick={onClose}/>
      <div className="m-sheet" style={{ height }}>
        <div className="grabber"/>
        {title && (
          <div className="m-sheet-head">
            <div className="t">{title}</div>
            <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" size={18}/></button>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 20px" }}>{children}</div>
        {footer && <div style={{ padding: "10px 16px 14px", borderTop: "1px solid var(--color-line)" }}>{footer}</div>}
      </div>
    </>
  );
}

// Toast (reuse desktop toast provider via window.ToastProvider if present)

// Account sheet
function MAccountSheet({ open, onClose, user, onNav, onLogout }) {
  return (
    <MSheet open={open} onClose={onClose}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0 16px" }}>
        <div style={{ width: 44, height: 44, borderRadius: 22, background: "var(--color-accent)", color: "var(--color-accent-fg)", display: "grid", placeItems: "center", fontWeight: 600, fontSize: 16 }}>{user.givenname[0]}{user.familyname[0]}</div>
        <div className="grow">
          <div style={{ fontWeight: 500 }}>{user.givenname} {user.familyname}</div>
          <div className="muted" style={{ fontSize: 13 }}>@{user.username} · {user.roles.join(", ")}</div>
        </div>
      </div>
      <div className="m-card" style={{ marginBottom: 10 }}>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => { onClose(); onNav("profile"); }}>
          <Icon name="user" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Profile</span><Icon name="arrowR" size={14} className="chev"/>
        </button>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => { onClose(); onNav("settings"); }}>
          <Icon name="settings" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Settings</span><Icon name="arrowR" size={14} className="chev"/>
        </button>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => { onClose(); onNav("help"); }}>
          <Icon name="help" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Help & shortcuts</span><Icon name="arrowR" size={14} className="chev"/>
        </button>
      </div>
      {user.roles.includes("staff") && (
        <div className="m-card" style={{ marginBottom: 10 }}>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => { onClose(); onNav("admin"); }}>
            <Icon name="admin" size={18} style={{ color: "var(--color-accent)" }}/> <span className="t">Admin console</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
        </div>
      )}
      <button className="m-btn m-btn-secondary" onClick={() => { onClose(); onLogout(); }} style={{ color: "var(--color-error)" }}>
        <Icon name="logout" size={16}/> Sign out
      </button>
      <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: 14 }}>v0.1 · us-east-2 · Status OK</div>
    </MSheet>
  );
}

// Fullscreen search / cmd-k equivalent
function MSearchCover({ open, onClose, assets, onOpenAsset, onNavScreen }) {
  const [q, setQ] = useSM("");
  const inputRef = useRM();
  useEM(() => { if (open) setTimeout(() => inputRef.current?.focus(), 80); }, [open]);
  useEM(() => { if (!open) setQ(""); }, [open]);

  const recents = ["sailing", "whiteboard", "textract", "reading-list"];
  const screens = [
    { id: "library", label: "Library", icon: "library" },
    { id: "upload",  label: "Upload",  icon: "upload" },
    { id: "chat",    label: "Group chat", icon: "chat" },
    { id: "profile", label: "My profile", icon: "user" },
    { id: "settings", label: "Settings", icon: "settings" },
    { id: "help",    label: "Help & shortcuts", icon: "help" },
  ];

  const filteredAssets = useMemoM(() => {
    if (!q) return assets.slice(0, 6);
    const Q = q.toLowerCase();
    return assets.filter(a => a.name.toLowerCase().includes(Q) || (a.labels||[]).some(l => l[0].toLowerCase().includes(Q)) || (a.ocr_excerpt||"").toLowerCase().includes(Q)).slice(0, 10);
  }, [q, assets]);
  const filteredScreens = useMemoM(() => {
    if (!q) return [];
    const Q = q.toLowerCase();
    return screens.filter(s => s.label.toLowerCase().includes(Q));
  }, [q]);

  if (!open) return null;
  return (
    <div className="m-cover">
      <div style={{ padding: "10px 10px 10px 4px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--color-line)" }}>
        <button className="back-btn" onClick={onClose} aria-label="Cancel"><Icon name="arrowL" size={20}/></button>
        <div style={{ position: "relative", flex: 1 }}>
          <Icon name="search" size={16} style={{ position: "absolute", left: 12, top: 14, color: "var(--color-ink-3)" }}/>
          <input ref={inputRef} className="m-input" style={{ paddingLeft: 36 }} placeholder="Search assets, labels, OCR…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "12px 12px 24px" }}>
        {!q && (
          <>
            <div className="m-section-sub" style={{ padding: "4px 4px 8px", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, fontWeight: 500 }}>Recent</div>
            <div className="row" style={{ gap: 6, flexWrap: "wrap", padding: "0 4px 14px" }}>
              {recents.map(r => <button key={r} className="m-chip" onClick={() => setQ(r)}>{r}</button>)}
            </div>
          </>
        )}
        {filteredScreens.length > 0 && (
          <>
            <div className="m-section-sub" style={{ padding: "4px 4px 8px", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, fontWeight: 500 }}>Screens</div>
            <div className="m-card" style={{ marginBottom: 12 }}>
              {filteredScreens.map((s, i) => (
                <button key={s.id} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < filteredScreens.length - 1 ? "1px solid var(--color-line)" : "none" }}
                  onClick={() => { onClose(); onNavScreen(s.id); }}>
                  <Icon name={s.icon} size={18} style={{ color: "var(--color-ink-3)" }}/>
                  <span className="t">{s.label}</span>
                  <Icon name="return" size={14} className="chev"/>
                </button>
              ))}
            </div>
          </>
        )}
        <div className="m-section-sub" style={{ padding: "4px 4px 8px", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, fontWeight: 500 }}>
          {q ? `${filteredAssets.length} asset match${filteredAssets.length === 1 ? "" : "es"}` : "Recent assets"}
        </div>
        <div className="m-card">
          {filteredAssets.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--color-ink-3)", fontSize: 13 }}>No matches</div>
          ) : filteredAssets.map((a, i) => (
            <button key={a.id} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < filteredAssets.length - 1 ? "1px solid var(--color-line)" : "none" }}
              onClick={() => { onClose(); onOpenAsset(a.id); }}>
              <div className="m-thumb-sq" style={{ overflow: "hidden" }}>
                {a.thumb ? <img src={a.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-ink-3)" }}><Icon name="doc" size={18}/></div>}
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>{a.name}</div>
                <div className="truncate muted" style={{ fontSize: 12 }}>
                  {a.kind === "document" ? (a.ocr_excerpt?.slice(0, 40) || "—") : (a.labels||[]).slice(0, 3).map(l => l[0]).join(" · ")}
                </div>
              </div>
              <Icon name="arrowR" size={14} className="chev"/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MTopBar, MTabBar, MSheet, MAccountSheet, MSearchCover });
