// Mobile Library + Asset detail + Upload
const { useState: useMS, useMemo: useMM, useEffect: useME, useRef: useMR } = React;

// ─────────────────────────── LIBRARY ───────────────────────────
function MLibrary({ assets, onOpen, onUpload, onSearch }) {
  const [view, setView] = useMS(localStorage.getItem("m_lib_view") || "grid");
  const [typeF, setTypeF] = useMS("all");
  const [sort, setSort] = useMS("newest");
  const [filtersOpen, setFiltersOpen] = useMS(false);
  useME(() => localStorage.setItem("m_lib_view", view), [view]);

  const filtered = useMM(() => {
    let xs = assets.slice();
    if (typeF !== "all") xs = xs.filter(a => a.kind === typeF);
    xs.sort((a, b) => sort === "newest" ? b.uploaded - a.uploaded : sort === "oldest" ? a.uploaded - b.uploaded : sort === "name" ? a.name.localeCompare(b.name) : b.size - a.size);
    return xs;
  }, [assets, typeF, sort]);

  const photoCount = assets.filter(a => a.kind === "photo").length;
  const docCount = assets.filter(a => a.kind === "document").length;

  // group by "today/yesterday/…" for list view
  const groups = useMM(() => {
    const out = {};
    for (const a of filtered) {
      const k = fmtDateRel(a.uploaded);
      (out[k] ||= []).push(a);
    }
    return Object.entries(out);
  }, [filtered]);

  return (
    <>
      <div className="m-section-h">Library</div>
      <div className="m-section-sub">{assets.length} assets · {photoCount} photos · {docCount} documents</div>

      {/* sticky toolbar */}
      <div style={{ position: "sticky", top: 0, padding: "8px 12px 10px", background: "var(--color-paper)", zIndex: 5, display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--color-line)" }}>
        <div className="m-segs" style={{ flex: 1, overflow: "auto" }}>
          <button className={"m-seg" + (typeF === "all" ? " active" : "")} onClick={() => setTypeF("all")}>All <span className="muted">{assets.length}</span></button>
          <button className={"m-seg" + (typeF === "photo" ? " active" : "")} onClick={() => setTypeF("photo")}><Icon name="image" size={12}/>Photos</button>
          <button className={"m-seg" + (typeF === "document" ? " active" : "")} onClick={() => setTypeF("document")}><Icon name="doc" size={12}/>Docs</button>
        </div>
        <button className="icon-btn" onClick={() => setFiltersOpen(true)} aria-label="Filters" style={{ width: 36, height: 36, border: "1px solid var(--color-line)", borderRadius: 8 }}>
          <Icon name="sliders" size={16}/>
        </button>
        <button className="icon-btn" onClick={() => setView(view === "grid" ? "list" : "grid")} aria-label="View" style={{ width: 36, height: 36, border: "1px solid var(--color-line)", borderRadius: 8 }}>
          <Icon name={view === "grid" ? "list" : "grid"} size={16}/>
        </button>
      </div>

      {/* content */}
      {filtered.length === 0 ? (
        <MEmpty onUpload={onUpload}/>
      ) : view === "grid" ? (
        <div style={{ padding: 12, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {filtered.map(a => <MAssetCard key={a.id} asset={a} onOpen={() => onOpen(a.id)}/>)}
        </div>
      ) : (
        <div style={{ padding: "0 12px 20px" }}>
          {groups.map(([label, xs]) => (
            <div key={label}>
              <div className="m-section-sub" style={{ padding: "12px 4px 4px", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, fontWeight: 500 }}>{label}</div>
              <div className="m-card">
                {xs.map((a, i) => (
                  <button key={a.id} className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => onOpen(a.id)}>
                    <div className="m-thumb-sq" style={{ overflow: "hidden" }}>
                      {a.thumb ? <img src={a.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-ink-3)" }}><Icon name="doc" size={18}/></div>}
                    </div>
                    <div className="grow" style={{ minWidth: 0 }}>
                      <div className="truncate" style={{ fontWeight: 500, fontSize: 14 }}>{a.name}</div>
                      <div className="truncate muted" style={{ fontSize: 12 }}>
                        {a.kind === "document" ? (a.ocr_excerpt?.slice(0, 60) || "No OCR") : (a.labels||[]).slice(0, 3).map(l => l[0]).join(" · ") || "No labels"}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="muted" style={{ fontSize: 11 }}>{fmtBytes(a.size)}</div>
                      <Icon name="arrowR" size={14} className="chev"/>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* filters sheet */}
      <MSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter & sort">
        <div className="m-section-sub" style={{ padding: "6px 4px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Type</div>
        <div className="m-card" style={{ marginBottom: 16 }}>
          {[
            { v: "all", l: "All", c: assets.length },
            { v: "photo", l: "Photos", c: photoCount },
            { v: "document", l: "Documents", c: docCount },
          ].map((o, i, arr) => (
            <button key={o.v} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < arr.length - 1 ? "1px solid var(--color-line)" : "none" }} onClick={() => setTypeF(o.v)}>
              <span className="t">{o.l}</span>
              <span className="muted" style={{ fontSize: 12 }}>{o.c}</span>
              {typeF === o.v && <Icon name="check" size={16} style={{ color: "var(--color-accent)" }}/>}
            </button>
          ))}
        </div>
        <div className="m-section-sub" style={{ padding: "6px 4px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Sort by</div>
        <div className="m-card" style={{ marginBottom: 16 }}>
          {[
            { v: "newest", l: "Newest first" },
            { v: "oldest", l: "Oldest first" },
            { v: "name", l: "Name A–Z" },
            { v: "size", l: "Largest first" },
          ].map((o, i, arr) => (
            <button key={o.v} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < arr.length - 1 ? "1px solid var(--color-line)" : "none" }} onClick={() => setSort(o.v)}>
              <span className="t">{o.l}</span>
              {sort === o.v && <Icon name="check" size={16} style={{ color: "var(--color-accent)" }}/>}
            </button>
          ))}
        </div>
        <div className="m-section-sub" style={{ padding: "6px 4px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Date range</div>
        <div className="m-card" style={{ marginBottom: 8 }}>
          {["This week", "This month", "Last 3 months", "All time"].map((o, i, arr) => (
            <button key={o} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < arr.length - 1 ? "1px solid var(--color-line)" : "none" }}>
              <span className="t">{o}</span>
              {o === "This month" && <Icon name="check" size={16} style={{ color: "var(--color-accent)" }}/>}
            </button>
          ))}
        </div>
        <button className="m-btn m-btn-primary" style={{ marginTop: 14 }} onClick={() => setFiltersOpen(false)}>Apply</button>
      </MSheet>
    </>
  );
}

function MAssetCard({ asset, onOpen }) {
  return (
    <button className="fade-in" onClick={onOpen} style={{
      textAlign: "left", background: "var(--color-paper-2)", borderRadius: 12, overflow: "hidden",
      border: "1px solid var(--color-line)", display: "flex", flexDirection: "column",
    }}>
      <div style={{ aspectRatio: "1", background: "var(--color-paper-3)", position: "relative", overflow: "hidden" }}>
        {asset.thumb ? (
          <img src={asset.thumb} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        ) : (
          <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", color: "var(--color-ink-3)" }}>
            <Icon name="doc" size={32}/>
          </div>
        )}
        <div style={{ position: "absolute", top: 6, left: 6 }}>
          <span className="m-chip" style={{ height: 20, fontSize: 10, padding: "0 7px", background: "rgba(28,27,24,0.55)", color: "#fff", border: "none", backdropFilter: "blur(6px)" }}>
            <Icon name={asset.kind === "document" ? "doc" : "image"} size={10}/>
            {asset.kind === "document" ? "Doc" : "Photo"}
          </span>
        </div>
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{asset.name}</div>
        <div className="muted truncate" style={{ fontSize: 11, marginTop: 2 }}>
          {asset.kind === "document"
            ? (asset.ocr_excerpt?.slice(0, 36) || "No OCR")
            : (asset.labels||[]).slice(0, 2).map(l => l[0]).join(" · ") || "—"}
        </div>
      </div>
    </button>
  );
}

function MEmpty({ onUpload }) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--color-paper-2)", border: "1px solid var(--color-line)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--color-ink-3)" }}>
        <Icon name="library" size={30}/>
      </div>
      <div className="serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>Your library is empty</div>
      <div className="muted" style={{ fontSize: 13, maxWidth: 280, margin: "0 auto 20px" }}>Upload photos, scan documents, or snap whiteboards to get started.</div>
      <button className="m-btn m-btn-primary" style={{ width: "auto", display: "inline-flex", padding: "0 20px" }} onClick={onUpload}>
        <Icon name="upload" size={14}/> Upload your first asset
      </button>
    </div>
  );
}

// ─────────────────────────── ASSET DETAIL ───────────────────────────
function MAssetDetail({ asset, onBack, onDelete, onRename, onPrev, onNext }) {
  const [menuOpen, setMenuOpen] = useMS(false);
  const [editName, setEditName] = useMS(false);
  const [name, setName] = useMS(asset.name);
  useME(() => { setName(asset.name); setEditName(false); }, [asset.id]);

  if (asset.kind === "document") return <MDocDetail asset={asset} onBack={onBack} onPrev={onPrev} onNext={onNext} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} onRename={onRename} editName={editName} setEditName={setEditName} name={name} setName={setName}/>;
  return <MPhotoDetail asset={asset} onBack={onBack} onPrev={onPrev} onNext={onNext} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onDelete={onDelete} onRename={onRename} editName={editName} setEditName={setEditName} name={name} setName={setName}/>;
}

function MAssetHead({ asset, onBack, onPrev, onNext, setMenuOpen, editName, setEditName, name, setName, onRename }) {
  return (
    <div className="m-topbar" style={{ gap: 4 }}>
      <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
      <div className="grow" style={{ minWidth: 0 }}>
        {editName ? (
          <input className="m-input" autoFocus style={{ height: 32, padding: "0 8px", fontSize: 14, fontFamily: "var(--font-serif)" }}
            value={name} onChange={e => setName(e.target.value)}
            onBlur={() => { setEditName(false); if (name !== asset.name) onRename(asset.id, name); }}
            onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setName(asset.name); setEditName(false); } }}/>
        ) : (
          <button onClick={() => setEditName(true)} className="truncate" style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500, textAlign: "left", width: "100%" }}>{asset.name}</button>
        )}
      </div>
      <button className="icon-btn" onClick={onPrev} aria-label="Previous"><Icon name="arrowL" size={18}/></button>
      <button className="icon-btn" onClick={onNext} aria-label="Next"><Icon name="arrowR" size={18}/></button>
      <button className="icon-btn" onClick={() => setMenuOpen(true)} aria-label="More"><Icon name="more" size={18}/></button>
    </div>
  );
}

function MAssetMenu({ open, onClose, asset, onDelete, onRename, setEditName }) {
  return (
    <MSheet open={open} onClose={onClose}>
      <div className="m-card" style={{ marginBottom: 10 }}>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => { onClose(); setEditName(true); }}>
          <Icon name="edit" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Rename</span>
        </button>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
          <Icon name="download" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Download original</span>
        </button>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
          <Icon name="link" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Share link</span>
        </button>
        <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
          <Icon name="copy" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Copy S3 key</span>
        </button>
      </div>
      {asset.kind === "photo" && (
        <div className="m-card" style={{ marginBottom: 10 }}>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
            <Icon name="refresh" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Re-analyze (Rekognition)</span>
          </button>
        </div>
      )}
      {asset.kind === "document" && (
        <div className="m-card" style={{ marginBottom: 10 }}>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
            <Icon name="refresh" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Re-run OCR (Textract)</span>
          </button>
        </div>
      )}
      <button className="m-btn m-btn-secondary" onClick={() => { onClose(); onDelete(asset.id); }} style={{ color: "var(--color-error)" }}>
        <Icon name="trash" size={16}/> Delete asset
      </button>
    </MSheet>
  );
}

// Photo detail
function MPhotoDetail({ asset, onBack, onPrev, onNext, menuOpen, setMenuOpen, onDelete, onRename, editName, setEditName, name, setName }) {
  const [active, setActive] = useMS(null);
  const [reanalyzing, setReanalyzing] = useMS(false);
  return (
    <>
      <MAssetHead {...{ asset, onBack, onPrev, onNext, setMenuOpen, editName, setEditName, name, setName, onRename }}/>
      {/* hero image */}
      <div style={{ background: "var(--color-paper-3)", position: "relative", aspectRatio: "4/3", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src={asset.thumb} alt={asset.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}/>
        {active && (
          <div className="fade-in" style={{ position: "absolute", left: `${10 + (active.i * 17) % 60}%`, top: `${15 + (active.i * 23) % 50}%`, width: "24%", height: "20%", border: "2px solid var(--color-accent)", background: "var(--color-accent-soft)", borderRadius: 4, pointerEvents: "none" }}>
            <span className="m-chip accent" style={{ position: "absolute", top: -22, left: 0, fontSize: 10, height: 20 }}>{active.label} · {active.conf}%</span>
          </div>
        )}
      </div>

      {/* meta row */}
      <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid var(--color-line)", fontSize: 12 }}>
        <span className="m-chip accent">Photo</span>
        <span className="muted">{fmtDate(asset.uploaded)}</span>
        <span className="muted">·</span>
        <span className="muted">{fmtBytes(asset.size)}</span>
      </div>

      {/* labels */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
          <div className="grow">
            <div className="row" style={{ gap: 6 }}>
              <Icon name="sparkle" size={14} style={{ color: "var(--color-accent)" }}/>
              <div style={{ fontWeight: 500, fontSize: 14 }}>Rekognition labels</div>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>{asset.labels?.length || 0} detected · min 70% confidence</div>
          </div>
          <button className="m-chip" onClick={() => { setReanalyzing(true); setTimeout(() => setReanalyzing(false), 1200); }}>
            <Icon name="refresh" size={11}/> {reanalyzing ? "…" : "Re-run"}
          </button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {reanalyzing ? (
            Array.from({ length: 8 }).map((_, i) => <div key={i} className="skel" style={{ width: 70 + (i % 3) * 20, height: 26, borderRadius: 13 }}/>)
          ) : (asset.labels || []).map(([l, conf], i) => (
            <button key={l} className="m-chip" onMouseEnter={() => setActive({ i, label: l, conf })} onMouseLeave={() => setActive(null)} onClick={() => setActive(active?.label === l ? null : { i, label: l, conf })} style={{ cursor: "pointer", background: active?.label === l ? "var(--color-accent-soft)" : "var(--color-paper-3)", color: active?.label === l ? "var(--color-accent)" : "var(--color-ink-2)", border: "1px solid var(--color-line)", height: 28 }}>
              {l} <span className="muted" style={{ fontWeight: 400 }}>{conf}%</span>
            </button>
          ))}
        </div>
        {active && <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>Highlighted region is illustrative — Rekognition returns labels only, not bounding boxes for general detection.</div>}
      </div>

      {/* details */}
      <div style={{ padding: "0 16px 24px" }}>
        <div className="m-section-sub" style={{ padding: "12px 4px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Details</div>
        <div className="m-card">
          <MetaRow k="Filename" v={asset.name}/>
          <MetaRow k="S3 key" v={asset.bucketkey} mono/>
          <MetaRow k="Uploaded" v={fmtDate(asset.uploaded)}/>
          <MetaRow k="Size" v={fmtBytes(asset.size)}/>
          <MetaRow k="ID" v={"#" + asset.id} last/>
        </div>
      </div>

      <MAssetMenu open={menuOpen} onClose={() => setMenuOpen(false)} asset={asset} onDelete={onDelete} onRename={onRename} setEditName={setEditName}/>
    </>
  );
}

// Doc detail
function MDocDetail({ asset, onBack, onPrev, onNext, menuOpen, setMenuOpen, onDelete, onRename, editName, setEditName, name, setName }) {
  const [tab, setTab] = useMS("text"); // text | scan
  const conf = asset.ocr_conf || 0;
  const confTone = conf >= 90 ? "success" : conf >= 75 ? "accent" : "warn";

  return (
    <>
      <MAssetHead {...{ asset, onBack, onPrev, onNext, setMenuOpen, editName, setEditName, name, setName, onRename }}/>

      {/* tabs */}
      <div style={{ padding: "8px 16px 10px", borderBottom: "1px solid var(--color-line)", display: "flex", alignItems: "center", gap: 8 }}>
        <div className="m-segs">
          <button className={"m-seg" + (tab === "text" ? " active" : "")} onClick={() => setTab("text")}>Extracted text</button>
          <button className={"m-seg" + (tab === "scan" ? " active" : "")} onClick={() => setTab("scan")}>Scan</button>
        </div>
        <div style={{ flex: 1 }}/>
        <span className={"m-chip " + confTone}>
          <Icon name="sparkle" size={10}/> {conf}% conf.
        </span>
      </div>

      {tab === "scan" ? (
        <div style={{ background: "var(--color-paper-3)", aspectRatio: "3/4", maxHeight: 420, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 0 12px" }}>
          {asset.thumb ? <img src={asset.thumb} alt={asset.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}/> : <div className="muted" style={{ fontSize: 12 }}><Icon name="doc" size={36}/></div>}
        </div>
      ) : (
        <div style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10, fontSize: 12 }}>
            <span className="m-chip accent">{asset.ocr_mode === "forms" ? "Forms + Tables" : "Text only"}</span>
            <span className="m-chip">{asset.ocr_words} words</span>
            <span className="m-chip">{asset.ocr_lines} lines</span>
          </div>
          <div style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: 12, padding: 14, fontFamily: "var(--font-serif)", fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
            {asset.ocr_excerpt}
            <div className="muted" style={{ fontSize: 12, marginTop: 14, paddingTop: 10, borderTop: "1px dashed var(--color-line)", fontFamily: "var(--font-sans)" }}>
              … {asset.ocr_words - 40} more words in extracted text. Tap "Copy text" below to copy all.
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button className="m-btn m-btn-secondary" style={{ flex: 1 }}><Icon name="copy" size={14}/> Copy text</button>
            <button className="m-btn m-btn-secondary" style={{ flex: 1 }}><Icon name="download" size={14}/> Export</button>
          </div>
        </div>
      )}

      {/* details */}
      <div style={{ padding: "0 16px 24px" }}>
        <div className="m-section-sub" style={{ padding: "12px 4px 4px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Details</div>
        <div className="m-card">
          <MetaRow k="Filename" v={asset.name}/>
          <MetaRow k="Mode" v={asset.ocr_mode === "forms" ? "Forms + Tables" : "Text only"}/>
          <MetaRow k="Confidence" v={conf + "%"}/>
          <MetaRow k="Words / lines" v={`${asset.ocr_words} / ${asset.ocr_lines}`}/>
          <MetaRow k="Uploaded" v={fmtDate(asset.uploaded)}/>
          <MetaRow k="Size" v={fmtBytes(asset.size)} last/>
        </div>
      </div>

      <MAssetMenu open={menuOpen} onClose={() => setMenuOpen(false)} asset={asset} onDelete={onDelete} onRename={onRename} setEditName={setEditName}/>
    </>
  );
}

function MetaRow({ k, v, mono, last }) {
  return (
    <div className="m-row" style={{ borderBottom: last ? "none" : "1px solid var(--color-line)", alignItems: "flex-start", padding: "10px 16px" }}>
      <div className="muted" style={{ fontSize: 12, width: 90, flexShrink: 0, paddingTop: 2 }}>{k}</div>
      <div className="grow" style={{ fontSize: 13, fontFamily: mono ? "var(--font-mono)" : undefined, wordBreak: "break-all", textAlign: "right" }}>{v}</div>
    </div>
  );
}

// ─────────────────────────── UPLOAD ───────────────────────────
function MUpload({ onDone, onBack }) {
  const [files, setFiles] = useMS([]); // [{id, name, kind, size, progress, status}]
  const [textract, setTextract] = useMS(true);
  const [mode, setMode] = useMS("forms"); // forms | text
  const [inputOpen, setInputOpen] = useMS(false);
  const fileRef = useMR();

  const pickFile = (kind) => {
    fileRef.current?.click();
  };

  const addFiles = (list) => {
    const next = list.map((f, i) => ({
      id: Date.now() + i,
      name: f.name || `IMG_${Math.floor(Math.random() * 9000 + 1000)}.jpg`,
      kind: f.kind || (f.name?.match(/\.(pdf|png|jpg|jpeg|heic)$/i) ? "photo" : "photo"),
      size: f.size || 140000 + Math.floor(Math.random() * 400000),
      progress: 0,
      status: "queued",
    }));
    setFiles(xs => [...next, ...xs]);
    // simulate progress
    next.forEach(n => {
      let p = 0;
      const iv = setInterval(() => {
        p += 6 + Math.random() * 14;
        setFiles(xs => xs.map(f => f.id === n.id ? { ...f, progress: Math.min(100, p), status: p >= 100 ? "done" : "uploading" } : f));
        if (p >= 100) clearInterval(iv);
      }, 220);
    });
  };

  const stageMock = () => addFiles([
    { name: "IMG_4128.jpg", kind: "photo" },
    { name: "IMG_4129.jpg", kind: "photo" },
    { name: "whiteboard-scan.jpg", kind: "document" },
  ]);

  const total = files.length;
  const done = files.filter(f => f.status === "done").length;
  const uploading = files.filter(f => f.status === "uploading").length;

  return (
    <>
      <div className="m-topbar">
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
        <div className="grow" style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>Upload</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* Big CTAs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <button onClick={() => pickFile("camera")} style={{
            padding: "20px 12px", borderRadius: 14, border: "1px solid var(--color-line)",
            background: "var(--color-paper-2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--color-ink)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-accent)", color: "var(--color-accent-fg)", display: "grid", placeItems: "center" }}>
              <Icon name="image" size={22}/>
            </div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Take photo</div>
            <div className="muted" style={{ fontSize: 11 }}>Camera → S3</div>
          </button>
          <button onClick={() => pickFile("scan")} style={{
            padding: "20px 12px", borderRadius: 14, border: "1px solid var(--color-line)",
            background: "var(--color-paper-2)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "var(--color-ink)",
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "var(--color-paper-3)", color: "var(--color-ink)", display: "grid", placeItems: "center" }}>
              <Icon name="doc" size={22}/>
            </div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>Scan document</div>
            <div className="muted" style={{ fontSize: 11 }}>Textract ready</div>
          </button>
        </div>

        <button onClick={stageMock} className="m-btn m-btn-secondary" style={{ marginBottom: 14 }}>
          <Icon name="upload" size={14}/> Choose from library
        </button>
        <input ref={fileRef} type="file" multiple hidden onChange={(e) => { if (e.target.files?.length) addFiles([...e.target.files]); }}/>

        {/* Textract toggle */}
        <div className="m-card" style={{ marginBottom: 14 }}>
          <div className="m-row" style={{ borderBottom: textract ? "1px solid var(--color-line)" : "none" }}>
            <div className="grow">
              <div style={{ fontWeight: 500, fontSize: 14 }}>Run OCR (Textract)</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>Extract text from documents and handwritten notes.</div>
            </div>
            <MToggle value={textract} onChange={setTextract}/>
          </div>
          {textract && (
            <div style={{ padding: "12px 16px" }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Mode</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                <button onClick={() => setMode("text")} style={{ padding: "10px 10px", borderRadius: 10, border: `1.5px solid ${mode === "text" ? "var(--color-accent)" : "var(--color-line)"}`, background: mode === "text" ? "var(--color-accent-soft)" : "var(--color-paper)", textAlign: "left" }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Text only</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Faster · $1.50 / 1k</div>
                </button>
                <button onClick={() => setMode("forms")} style={{ padding: "10px 10px", borderRadius: 10, border: `1.5px solid ${mode === "forms" ? "var(--color-accent)" : "var(--color-line)"}`, background: mode === "forms" ? "var(--color-accent-soft)" : "var(--color-paper)", textAlign: "left" }}>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>Forms + Tables</div>
                  <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Best for notes · $15 / 1k</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Queue */}
        {total > 0 && (
          <>
            <div className="m-section-sub" style={{ padding: "4px 4px 6px", display: "flex", alignItems: "center" }}>
              <div className="grow" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Queue · {done}/{total} done</div>
              {uploading > 0 && <span className="m-chip accent" style={{ height: 22, fontSize: 11 }}>{uploading} uploading</span>}
            </div>
            <div className="m-card">
              {files.map((f, i) => (
                <div key={f.id} className="m-row" style={{ alignItems: "center", gap: 10, borderBottom: i < files.length - 1 ? "1px solid var(--color-line)" : "none" }}>
                  <div className="m-thumb-sq" style={{ display: "grid", placeItems: "center", color: "var(--color-ink-3)" }}>
                    <Icon name={f.kind === "document" ? "doc" : "image"} size={18}/>
                  </div>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{f.name}</div>
                    {f.status === "done" ? (
                      <div className="row" style={{ gap: 6, marginTop: 3, fontSize: 11, color: "var(--color-success)" }}>
                        <Icon name="check2" size={12}/> Uploaded · {fmtBytes(f.size)}
                      </div>
                    ) : (
                      <div style={{ marginTop: 5 }}>
                        <div style={{ height: 3, borderRadius: 2, background: "var(--color-paper-3)", overflow: "hidden" }}>
                          <div style={{ width: `${f.progress}%`, height: "100%", background: "var(--color-accent)", transition: "width .2s" }}/>
                        </div>
                        <div className="muted" style={{ fontSize: 11, marginTop: 3 }}>{Math.round(f.progress)}% · {fmtBytes(f.size)}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {done === total && total > 0 && (
              <button className="m-btn m-btn-primary" style={{ marginTop: 14 }} onClick={onDone}>
                <Icon name="check" size={14}/> Done — back to library
              </button>
            )}
          </>
        )}
      </div>
    </>
  );
}

function MToggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 44, height: 26, borderRadius: 13, padding: 2,
      background: value ? "var(--color-accent)" : "var(--color-paper-3)",
      transition: "background .15s", position: "relative", flexShrink: 0,
      border: "1px solid " + (value ? "var(--color-accent)" : "var(--color-line)"),
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, background: "#fff",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        transform: value ? "translateX(18px)" : "none",
        transition: "transform .15s",
      }}/>
    </button>
  );
}

Object.assign(window, { MLibrary, MAssetDetail, MUpload });
