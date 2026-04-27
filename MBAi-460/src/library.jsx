// Library (grid + list + search + filters)
const { useState: useSL, useMemo: useML, useEffect: useEL } = React;

function Library({ assets, onOpenAsset, onOpenUpload, density, emptyState, onOpenCmdK }) {
  const [view, setView] = useSL(localStorage.getItem("lib_view") || "grid");
  const [sort, setSort] = useSL("newest");
  const [q, setQ] = useSL("");
  const [typeF, setTypeF] = useSL("all");
  const [selected, setSelected] = useSL(new Set());

  useEL(() => localStorage.setItem("lib_view", view), [view]);

  const filtered = useML(() => {
    let xs = emptyState ? [] : assets;
    if (typeF !== "all") xs = xs.filter(a => a.kind === typeF);
    if (q) {
      const Q = q.toLowerCase();
      xs = xs.filter(a =>
        a.name.toLowerCase().includes(Q) ||
        (a.labels || []).some(l => l[0].toLowerCase().includes(Q)) ||
        (a.ocr_excerpt || "").toLowerCase().includes(Q)
      );
    }
    xs = [...xs].sort((a, b) => sort === "newest" ? b.uploaded - a.uploaded : sort === "oldest" ? a.uploaded - b.uploaded : sort === "name" ? a.name.localeCompare(b.name) : b.size - a.size);
    return xs;
  }, [assets, q, typeF, sort, emptyState]);

  const toggleSel = (id, e) => {
    const s = new Set(selected);
    if (e.shiftKey && selected.size) { /* simple: just add */ s.add(id); }
    else if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const actions = (
    <>
      <button className="btn btn-secondary btn-sm" onClick={onOpenCmdK}><Icon name="search" size={14}/> Search <kbd>⌘K</kbd></button>
      <button className="btn btn-primary" onClick={onOpenUpload}><Icon name="upload" size={14}/> Upload</button>
    </>
  );

  if (emptyState) {
    return (
      <>
        <PageHeader title="Library" subtitle="Your photos, documents, and handwritten notes." actions={actions}/>
        <EmptyLibrary onOpenUpload={onOpenUpload}/>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Library" subtitle={`${assets.length} assets · ${assets.filter(a=>a.kind==="photo").length} photos · ${assets.filter(a=>a.kind==="document").length} documents`} actions={actions}/>

      {/* Toolbar */}
      <div style={{ padding: "14px 32px", display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid var(--color-line)", flexWrap: "wrap", background: "var(--color-paper)" }}>
        <div style={{ position: "relative", flex: "0 1 300px" }}>
          <Icon name="search" size={14} style={{ position: "absolute", left: 10, top: 10, color: "var(--color-ink-3)" }}/>
          <input className="input" style={{ height: 32, paddingLeft: 30, fontSize: "var(--fs-sm)" }} placeholder="Filter assets…" value={q} onChange={e => setQ(e.target.value)}/>
        </div>

        <SegmentedControl value={typeF} onChange={setTypeF} options={[
          { v: "all", l: "All", c: assets.length },
          { v: "photo", l: "Photos", icon: "image", c: assets.filter(a=>a.kind==="photo").length },
          { v: "document", l: "Docs", icon: "doc", c: assets.filter(a=>a.kind==="document").length },
        ]}/>

        <Dropdown label={`Sort: ${sort}`} icon="sort" options={[
          { v: "newest", l: "Newest first" },
          { v: "oldest", l: "Oldest first" },
          { v: "name",   l: "Name A–Z" },
          { v: "size",   l: "Largest first" },
        ]} value={sort} onChange={setSort}/>

        <div className="pill" style={{ gap: 4 }}>
          <Icon name="filter" size={12}/> This month
        </div>

        <div style={{ flex: 1 }}/>

        {selected.size > 0 && (
          <div className="fade-in row" style={{ gap: 6, padding: "4px 8px 4px 12px", background: "var(--color-accent-soft)", borderRadius: "var(--r-sm)", fontSize: "var(--fs-xs)" }}>
            <span style={{ color: "var(--color-accent)" }}>{selected.size} selected</span>
            <button className="btn btn-ghost btn-sm"><Icon name="download" size={13}/> Zip</button>
            <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }}><Icon name="trash" size={13}/></button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())} aria-label="Clear selection"><Icon name="close" size={12}/></button>
          </div>
        )}

        <SegmentedControl value={view} onChange={setView} options={[
          { v: "grid", icon: "grid", ariaLabel: "Grid view" },
          { v: "list", icon: "list", ariaLabel: "List view" },
        ]} iconOnly/>
      </div>

      {/* Body */}
      <div style={{ padding: "24px 32px", flex: 1, overflow: "auto" }}>
        {view === "grid" ? (
          <Grid items={filtered} density={density} selected={selected} onOpenAsset={onOpenAsset} onToggleSel={toggleSel}/>
        ) : (
          <ListView items={filtered} selected={selected} onOpenAsset={onOpenAsset} onToggleSel={toggleSel}/>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <Icon name="search" size={24} style={{ color: "var(--color-ink-3)" }}/>
            <div style={{ marginTop: 10, fontSize: "var(--fs-md)" }}>No matches</div>
            <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>Try a different search or clear filters.</div>
          </div>
        )}
      </div>
    </>
  );
}

function SegmentedControl({ value, onChange, options, iconOnly }) {
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: "var(--r-sm)" }}>
      {options.map((o) => {
        const act = o.v === value;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} aria-label={o.ariaLabel}
            style={{
              height: 26, padding: iconOnly ? "0 8px" : "0 10px",
              display: "inline-flex", alignItems: "center", gap: 6,
              borderRadius: 4, fontSize: "var(--fs-xs)", fontWeight: 500,
              background: act ? "var(--color-paper)" : "transparent",
              color: act ? "var(--color-ink)" : "var(--color-ink-3)",
              boxShadow: act ? "var(--shadow-1)" : "none",
              border: "1px solid " + (act ? "var(--color-line)" : "transparent"),
            }}>
            {o.icon && <Icon name={o.icon} size={13}/>}
            {!iconOnly && o.l}
            {o.c != null && <span style={{ color: "var(--color-ink-3)", fontVariantNumeric: "tabular-nums" }}>{o.c}</span>}
          </button>
        );
      })}
    </div>
  );
}

function Dropdown({ label, icon, options, value, onChange }) {
  const [open, setOpen] = useSL(false);
  const ref = React.useRef();
  React.useEffect(() => {
    const h = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const cur = options.find(o => o.v === value);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(x => !x)}>
        {icon && <Icon name={icon} size={13}/>} {cur ? cur.l : label} <Icon name="arrowD" size={12}/>
      </button>
      {open && (
        <div className="fade-in" style={{ position: "absolute", top: 34, right: 0, minWidth: 180, background: "var(--color-paper)", border: "1px solid var(--color-line)", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-2)", zIndex: 50, padding: 4 }}>
          {options.map(o => (
            <button key={o.v} onClick={() => { onChange(o.v); setOpen(false); }} style={{
              width: "100%", textAlign: "left", padding: "7px 10px", fontSize: "var(--fs-sm)",
              display: "flex", alignItems: "center", gap: 8, borderRadius: "var(--r-xs)",
              background: o.v === value ? "var(--color-paper-2)" : "transparent",
            }} onMouseEnter={e => e.currentTarget.style.background = "var(--color-paper-2)"} onMouseLeave={e => e.currentTarget.style.background = o.v === value ? "var(--color-paper-2)" : "transparent"}>
              <span className="grow">{o.l}</span>
              {o.v === value && <Icon name="check" size={13} style={{ color: "var(--color-accent)" }}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Grid({ items, density, selected, onOpenAsset, onToggleSel }) {
  const cols = density === "dense" ? "repeat(auto-fill, minmax(160px, 1fr))" : density === "airy" ? "repeat(auto-fill, minmax(280px, 1fr))" : "repeat(auto-fill, minmax(220px, 1fr))";
  return (
    <div style={{ display: "grid", gridTemplateColumns: cols, gap: density === "dense" ? 12 : 16 }}>
      {items.map(a => <AssetCard key={a.id} a={a} selected={selected.has(a.id)} onOpen={() => onOpenAsset(a.id)} onSel={(e) => onToggleSel(a.id, e)} compact={density === "dense"}/>)}
    </div>
  );
}

function AssetCard({ a, selected, onOpen, onSel, compact }) {
  const [hover, setHover] = useSL(false);
  const isDoc = a.kind === "document";
  return (
    <div onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className="fade-in"
      style={{
        background: "var(--color-paper-2)", border: "1px solid var(--color-line)",
        borderRadius: "var(--r-md)", overflow: "hidden", cursor: "pointer",
        transition: "transform var(--motion-fast) var(--ease), box-shadow var(--motion-fast) var(--ease), border-color var(--motion-fast) var(--ease)",
        transform: hover ? "translateY(-2px)" : "none",
        boxShadow: hover ? "var(--shadow-2)" : "none",
        borderColor: selected ? "var(--color-accent)" : hover ? "var(--color-line-strong)" : "var(--color-line)",
        outline: selected ? "1px solid var(--color-accent)" : "none",
      }}>
      <div style={{
        aspectRatio: "4 / 3", position: "relative",
        background: isDoc ? "var(--color-paper-3)" : "var(--color-paper-4)",
        overflow: "hidden",
      }}>
        {a.thumb ? (
          <img src={a.thumb} alt={a.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} loading="lazy"/>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-ink-3)" }}>
            <Icon name={isDoc ? "doc" : "image"} size={32}/>
          </div>
        )}

        {/* kind badge */}
        <div style={{ position: "absolute", top: 8, left: 8, display: "flex", gap: 4 }}>
          <span className="pill" style={{ background: "rgba(28,27,24,0.72)", color: "#F0EEE6", border: "none", backdropFilter: "blur(6px)" }}>
            <Icon name={isDoc ? "doc" : "image"} size={10}/> {isDoc ? "doc" : "photo"}
          </span>
          {isDoc && a.ocr_status === "done" && (
            <span className="pill" style={{ background: "rgba(204,120,92,0.92)", color: "#fff", border: "none" }}>OCR</span>
          )}
        </div>

        {/* checkbox */}
        <button onClick={(e) => { e.stopPropagation(); onSel(e); }} style={{
          position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: 4,
          background: selected ? "var(--color-accent)" : "rgba(28,27,24,0.4)",
          border: selected ? "none" : "1px solid rgba(240,238,230,0.6)",
          color: "#fff", display: hover || selected ? "grid" : "none", placeItems: "center",
          backdropFilter: "blur(6px)",
        }} aria-label="Select">
          {selected && <Icon name="check" size={14}/>}
        </button>
      </div>

      <div style={{ padding: compact ? "8px 10px 10px" : "10px 12px 12px" }}>
        <div className="truncate" style={{ fontSize: "var(--fs-sm)", fontWeight: 500, marginBottom: 3 }}>{a.name}</div>
        <div className="row muted" style={{ fontSize: "var(--fs-xs)", gap: 6, marginBottom: 6 }}>
          <span>{fmtDateRel(a.uploaded)}</span>
          <span>·</span>
          <span>{fmtBytes(a.size)}</span>
        </div>
        {!compact && (
          <div className="row" style={{ gap: 4, flexWrap: "wrap" }}>
            {isDoc && a.ocr_excerpt ? (
              <div className="muted" style={{ fontSize: "var(--fs-xs)", lineHeight: 1.35, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                <span style={{ color: "var(--color-ink)" }}>"</span>{a.ocr_excerpt.slice(0, 90)}…<span style={{ color: "var(--color-ink)" }}>"</span>
              </div>
            ) : (
              <>
                {(a.labels || []).slice(0, 3).map(([l, c]) => (
                  <span key={l} className="pill" style={{ height: 20, fontSize: 11, background: "var(--color-paper-3)" }}>{l}</span>
                ))}
                {(a.labels || []).length > 3 && <span className="pill" style={{ height: 20, fontSize: 11, color: "var(--color-ink-3)" }}>+{a.labels.length - 3}</span>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ListView({ items, selected, onOpenAsset, onToggleSel }) {
  return (
    <div style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: "var(--r-md)", overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "30px 1.5fr 90px 90px 1fr 110px 34px", gap: 12, padding: "9px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-ink-3)", fontWeight: 500, borderBottom: "1px solid var(--color-line)", background: "var(--color-paper-3)" }}>
        <span></span><span>Name</span><span>Type</span><span style={{ textAlign: "right" }}>Size</span><span>Labels / text</span><span>Uploaded</span><span></span>
      </div>
      {items.map((a, i) => (
        <div key={a.id} onClick={() => onOpenAsset(a.id)}
          style={{
            display: "grid", gridTemplateColumns: "30px 1.5fr 90px 90px 1fr 110px 34px", gap: 12,
            padding: "10px 16px", alignItems: "center",
            fontSize: "var(--fs-sm)", cursor: "pointer",
            borderBottom: i < items.length - 1 ? "1px solid var(--color-line)" : "none",
            background: selected.has(a.id) ? "var(--color-accent-soft)" : "transparent",
            borderLeft: selected.has(a.id) ? "2px solid var(--color-accent)" : "2px solid transparent",
          }}
          onMouseEnter={(e) => !selected.has(a.id) && (e.currentTarget.style.background = "var(--color-paper-3)")}
          onMouseLeave={(e) => !selected.has(a.id) && (e.currentTarget.style.background = "transparent")}>
          <button onClick={(e) => { e.stopPropagation(); onToggleSel(a.id, e); }}
            style={{ width: 18, height: 18, borderRadius: 4, border: "1px solid " + (selected.has(a.id) ? "var(--color-accent)" : "var(--color-line-strong)"), background: selected.has(a.id) ? "var(--color-accent)" : "transparent", color: "#fff", display: "grid", placeItems: "center" }}>
            {selected.has(a.id) && <Icon name="check" size={11}/>}
          </button>
          <div className="row" style={{ gap: 10, minWidth: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 4, background: "var(--color-paper-3)", overflow: "hidden", display: "grid", placeItems: "center", flexShrink: 0 }}>
              {a.thumb ? <img src={a.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <Icon name="doc" size={14} style={{ color: "var(--color-ink-3)" }}/>}
            </div>
            <span className="truncate">{a.name}</span>
          </div>
          <span className="row muted" style={{ gap: 4, fontSize: "var(--fs-xs)" }}><Icon name={a.kind === "document" ? "doc" : "image"} size={12}/> {a.kind}</span>
          <span className="mono muted" style={{ fontSize: "var(--fs-xs)", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtBytes(a.size)}</span>
          <div className="truncate muted" style={{ fontSize: "var(--fs-xs)" }}>
            {a.kind === "document" ? (a.ocr_excerpt?.slice(0, 80) || "—") : (a.labels || []).slice(0, 4).map(l => l[0]).join(" · ")}
          </div>
          <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{fmtDateRel(a.uploaded)}</span>
          <button className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}><Icon name="more" size={15}/></button>
        </div>
      ))}
    </div>
  );
}

function EmptyLibrary({ onOpenUpload }) {
  return (
    <div style={{ padding: "80px 20px", textAlign: "center" }}>
      <div style={{ width: 120, height: 120, margin: "0 auto 20px", position: "relative" }}>
        <svg viewBox="0 0 120 120" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" style={{ opacity: 0.35 }}>
          <rect x="18" y="30" width="56" height="72" rx="4"/>
          <rect x="38" y="18" width="56" height="72" rx="4" fill="var(--color-paper-2)"/>
          <circle cx="54" cy="40" r="5"/>
          <path d="M 42 72 L 60 58 L 80 74 L 90 68"/>
        </svg>
      </div>
      <h2 className="serif" style={{ fontSize: "var(--fs-xl)", margin: 0, fontWeight: 500 }}>No assets yet</h2>
      <p className="muted" style={{ fontSize: "var(--fs-sm)", marginTop: 6, maxWidth: 380, marginInline: "auto" }}>
        Upload a photo for Rekognition labels, or a scanned note to extract text with Textract.
      </p>
      <div style={{ marginTop: 20 }}>
        <button className="btn btn-primary btn-lg" onClick={onOpenUpload}><Icon name="upload" size={15}/> Upload your first asset</button>
      </div>
    </div>
  );
}

window.Library = Library;
