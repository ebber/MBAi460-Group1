// Asset detail — photo (Rekognition) and document (Textract) split view
const { useState: useSA, useMemo: useMA, useEffect: useEA, useRef: useRA } = React;

function AssetDetail({ asset, onBack, onDelete, onRename, onNext, onPrev }) {
  const [editName, setEditName] = useSA(false);
  const [name, setName] = useSA(asset.name);
  useEA(() => setName(asset.name), [asset.id]);

  const isDoc = asset.kind === "document";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Crumbs + title */}
      <div style={{ padding: "18px 32px 12px", borderBottom: "1px solid var(--color-line)", display: "flex", alignItems: "center", gap: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={onBack}><Icon name="arrowL" size={14}/> Library</button>
        <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>/</span>
        <div className="grow row" style={{ gap: 8, minWidth: 0 }}>
          {editName ? (
            <input className="input" autoFocus style={{ height: 30, flex: 1, minWidth: 0, maxWidth: 560, fontSize: "var(--fs-md)", fontFamily: "var(--font-serif)" }}
              value={name} onChange={e => setName(e.target.value)}
              onBlur={() => { setEditName(false); if (name !== asset.name) onRename(asset.id, name); }}
              onKeyDown={e => { if (e.key === "Enter") e.currentTarget.blur(); if (e.key === "Escape") { setName(asset.name); setEditName(false); } }}/>
          ) : (
            <>
              <span className="serif truncate" style={{ fontSize: "var(--fs-xl)", fontWeight: 500, flex: "0 1 auto", minWidth: 0, maxWidth: "60ch" }}>{asset.name}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditName(true)} aria-label="Rename" style={{ flexShrink: 0 }}><Icon name="edit" size={13}/></button>
            </>
          )}
          <span className="pill pill-accent" style={{ textTransform: "capitalize", flexShrink: 0 }}>{asset.kind}</span>
        </div>
        <div className="row" style={{ gap: 4 }}>
          <button className="btn btn-ghost btn-sm" onClick={onPrev} aria-label="Prev"><Icon name="arrowL" size={14}/></button>
          <button className="btn btn-ghost btn-sm" onClick={onNext} aria-label="Next"><Icon name="arrowR" size={14}/></button>
          <span style={{ width: 8 }}/>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={14}/> Download</button>
          <button className="btn btn-secondary btn-sm"><Icon name="link" size={14}/> Share</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }} onClick={() => onDelete(asset.id)} aria-label="Delete"><Icon name="trash" size={14}/></button>
        </div>
      </div>

      {isDoc ? <DocDetail asset={asset}/> : <PhotoDetail asset={asset}/>}
    </div>
  );
}

function PhotoDetail({ asset }) {
  const [active, setActive] = useSA(null);
  const [analyzing, setAnalyzing] = useSA(false);

  const reanalyze = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1400);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", flex: 1, minHeight: 0, overflow: "hidden" }}>
      {/* image pane */}
      <div style={{ background: "var(--color-paper-3)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, borderRight: "1px solid var(--color-line)", overflow: "hidden" }}>
        <div style={{ position: "relative", maxWidth: "100%", maxHeight: "100%" }}>
          <img src={asset.thumb} alt={asset.name} style={{ maxWidth: "100%", maxHeight: "calc(100vh - 200px)", objectFit: "contain", borderRadius: "var(--r-md)", boxShadow: "var(--shadow-3)", display: "block" }}/>
          {active && (
            <div className="fade-in" style={{
              position: "absolute", left: `${10 + (active.i * 17) % 60}%`, top: `${15 + (active.i * 23) % 50}%`,
              width: "22%", height: "18%", border: "2px solid var(--color-accent)",
              background: "var(--color-accent-soft)", borderRadius: 4,
              pointerEvents: "none",
            }}>
              <span className="pill pill-accent" style={{ position: "absolute", top: -24, left: 0, fontSize: 11 }}>{active.label} · {active.conf}%</span>
            </div>
          )}
        </div>
      </div>

      {/* side panel */}
      <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 20, background: "var(--color-paper)" }}>
        {/* Rekognition labels */}
        <section>
          <div className="row" style={{ marginBottom: 10 }}>
            <div className="grow">
              <div className="row" style={{ gap: 6 }}>
                <Icon name="sparkle" size={14} style={{ color: "var(--color-accent)" }}/>
                <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Labels</h3>
                <span className="pill" style={{ fontSize: 10, height: 18 }}>{asset.labels.length}</span>
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>Amazon Rekognition · DetectLabels</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={reanalyze} disabled={analyzing}>
              <Icon name="refresh" size={12} style={analyzing ? { animation: "spin 1s linear infinite" } : {}}/> {analyzing ? "Analyzing…" : "Re-run"}
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {asset.labels.map(([l, c], i) => (
              <button key={l} onMouseEnter={() => setActive({ label: l, conf: c, i })} onMouseLeave={() => setActive(null)}
                style={{
                  display: "grid", gridTemplateColumns: "8px 1fr 42px", gap: 10, alignItems: "center",
                  padding: "7px 10px", borderRadius: "var(--r-sm)", textAlign: "left",
                  background: active?.label === l ? "var(--color-accent-soft)" : "transparent",
                  transition: "background var(--motion-fast)",
                }}
                onMouseEnterCapture={(e) => active?.label !== l && (e.currentTarget.style.background = "var(--color-paper-2)")}
                onMouseLeaveCapture={(e) => active?.label !== l && (e.currentTarget.style.background = "transparent")}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: c >= 90 ? "var(--color-success)" : c >= 75 ? "var(--color-accent)" : "var(--color-warn)" }}/>
                <span style={{ fontSize: "var(--fs-sm)" }}>{l}</span>
                <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
                  <div style={{ width: 36, height: 3, background: "var(--color-paper-3)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${c}%`, height: "100%", background: c >= 90 ? "var(--color-success)" : c >= 75 ? "var(--color-accent)" : "var(--color-warn)" }}/>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "var(--color-ink-2)", fontVariantNumeric: "tabular-nums", minWidth: 22, textAlign: "right" }}>{c}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <hr className="divider"/>

        <section>
          <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500, marginBottom: 10 }}>Metadata</h3>
          <MetaRow k="Asset ID" v={<span className="mono">{asset.id}</span>}/>
          <MetaRow k="Uploaded" v={fmtDate(asset.uploaded)}/>
          <MetaRow k="Type" v="image/jpeg"/>
          <MetaRow k="Size" v={fmtBytes(asset.size)}/>
          <MetaRow k="Bucket" v={<span className="mono truncate" style={{ maxWidth: 180, display: "inline-block", verticalAlign: "bottom" }}>photoapp-6b</span>}/>
          <MetaRow k="Key" v={<span className="mono truncate" style={{ maxWidth: 180, display: "inline-block", verticalAlign: "bottom", fontSize: 11 }}>{asset.bucketkey.split("/").pop()}</span>}/>
          <MetaRow k="Region" v={<span>us-east-2</span>}/>
          <MetaRow k="Owner" v={<span>@pooja</span>}/>
        </section>

        <hr className="divider"/>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm"><Icon name="copy" size={12}/> Copy link</button>
          <button className="btn btn-secondary btn-sm"><Icon name="tag" size={12}/> Add tag</button>
          <button className="btn btn-ghost btn-sm" style={{ color: "var(--color-error)" }}><Icon name="trash" size={12}/> Delete…</button>
        </div>
      </div>
    </div>
  );
}

function MetaRow({ k, v }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: 12, padding: "6px 0", fontSize: "var(--fs-xs)", borderBottom: "1px dashed var(--color-line)" }}>
      <span className="muted">{k}</span>
      <span style={{ color: "var(--color-ink)", fontSize: "var(--fs-sm)" }}>{v}</span>
    </div>
  );
}

// ---- Document / Textract detail (hero) ----
function DocDetail({ asset }) {
  const [active, setActive] = useSA(null); // active block index
  const [copied, setCopied] = useSA(false);
  const [analyzing, setAnalyzing] = useSA(false);

  // Build synthetic OCR blocks for rich interactive demo
  const blocks = useMA(() => {
    if (asset.id === 1041) {
      // lecture-notes-w04.jpg — cloud-native
      return [
        { text: "Week 4 — Cloud-native architectures", conf: 96, box: [8, 8, 62, 7], hd: true },
        { text: "1. Stateless services", conf: 94, box: [10, 20, 44, 5] },
        { text: "2. Managed datastores", conf: 91, box: [10, 27, 48, 5] },
        { text: "3. Observability primitives", conf: 88, box: [10, 34, 55, 5] },
        { text: "(metrics / logs / traces)", conf: 72, box: [14, 40, 52, 4], low: true },
        { text: "Why cream over white?", conf: 83, box: [10, 50, 52, 5] },
        { text: "→ less glare on long reads", conf: 68, box: [14, 57, 55, 5], low: true },
        { text: "→ feels intentional, not default", conf: 64, box: [14, 64, 62, 5], low: true },
        { text: "TODO: spike Textract on Fri", conf: 79, box: [10, 76, 58, 5] },
      ];
    }
    if (asset.id === 1038) {
      return [
        { text: "Group 1 — sync 04/15", conf: 92, box: [8, 6, 50, 6], hd: true },
        { text: "Andrew · Pooja · Emanuele · Li", conf: 85, box: [10, 16, 62, 5] },
        { text: "Next: photoapp API wrapper", conf: 78, box: [10, 28, 56, 5] },
        { text: "Textract spike — by Fri", conf: 71, box: [10, 36, 48, 5], low: true },
        { text: "UI v0.1 — Andrew, due Mon", conf: 83, box: [10, 46, 54, 5] },
        { text: "Demo rehearsal — Tue 4pm", conf: 76, box: [10, 54, 54, 5] },
        { text: "⚠ confirm bucket region (us-east-2)", conf: 58, box: [10, 68, 68, 5], low: true },
      ];
    }
    if (asset.id === 1035) {
      return [
        { text: "MBAi 460 — Spring 2026 Reading List", conf: 99, box: [6, 5, 70, 6], hd: true },
        { text: "Unit 3 — Serverless architectures", conf: 98, box: [8, 18, 60, 5] },
        { text: "Unit 4 — Object storage patterns", conf: 98, box: [8, 28, 62, 5] },
        { text: "Unit 5 — AI / ML as a service", conf: 97, box: [8, 38, 55, 5] },
        { text: "Unit 6 — Auth and session design", conf: 98, box: [8, 48, 60, 5] },
      ];
    }
    return [
      { text: "Whole Foods Market — Evanston IL", conf: 93, box: [8, 5, 62, 5], hd: true },
      { text: "2026-04-14  18:32", conf: 95, box: [8, 16, 42, 5] },
      { text: "Organic bananas   1.99", conf: 87, box: [8, 30, 56, 4] },
      { text: "Oat milk           4.49", conf: 89, box: [8, 36, 56, 4] },
      { text: "Bread              5.99", conf: 92, box: [8, 42, 56, 4] },
      { text: "Tax                3.12", conf: 94, box: [8, 52, 56, 4] },
      { text: "TOTAL            $47.18", conf: 98, box: [8, 60, 56, 5], hd: true },
    ];
  }, [asset.id]);

  const avg = Math.round(blocks.reduce((s, b) => s + b.conf, 0) / blocks.length);
  const fullText = blocks.map(b => b.text).join("\n");

  const copy = () => {
    navigator.clipboard?.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(420px, 1fr)", flex: 1, minHeight: 0 }}>
      {/* Scan pane */}
      <div style={{ background: "var(--color-paper-3)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, borderRight: "1px solid var(--color-line)", overflow: "hidden" }}>
        <div style={{ position: "relative", width: "100%", maxWidth: 520, aspectRatio: "3 / 4", borderRadius: "var(--r-md)", overflow: "hidden", boxShadow: "var(--shadow-3)", background: "#fdfcf7" }}>
          {asset.thumb ? (
            <img src={asset.thumb} alt={asset.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}/>
          ) : (
            <SyntheticDocBg blocks={blocks}/>
          )}
          {/* Overlay bounding boxes */}
          {blocks.map((b, i) => (
            <div key={i}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
              style={{
                position: "absolute",
                left: `${b.box[0]}%`, top: `${b.box[1]}%`,
                width: `${b.box[2]}%`, height: `${b.box[3]}%`,
                border: "1.5px solid " + (active === i ? "var(--color-accent)" : "transparent"),
                background: active === i ? "var(--color-accent-soft)" : "transparent",
                borderRadius: 3, cursor: "pointer",
                transition: "all var(--motion-fast) var(--ease)",
              }}
              title={`${b.conf}% confidence`}/>
          ))}

          <div style={{ position: "absolute", bottom: 10, left: 10, display: "flex", gap: 6 }}>
            <span className="pill" style={{ background: "rgba(28,27,24,0.72)", color: "#F0EEE6", border: "none" }}>
              <Icon name="sparkle" size={10}/> Textract · {asset.ocr_mode === "forms" ? "AnalyzeDocument" : "DetectDocumentText"}
            </span>
          </div>
        </div>
      </div>

      {/* Text pane */}
      <div style={{ overflowY: "auto", display: "flex", flexDirection: "column", background: "var(--color-paper)" }}>
        <div style={{ padding: "20px 28px 12px", borderBottom: "1px solid var(--color-line)", display: "flex", alignItems: "center", gap: 8 }}>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
              <Icon name="sparkle" size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }}/>
              <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Extracted text</h3>
              <span className="pill pill-accent" style={{ height: 20, fontSize: 11, flexShrink: 0 }}>avg {avg}%</span>
            </div>
            <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
              {blocks.length} blocks · {fullText.split(/\s+/).length} words · {asset.ocr_mode === "forms" ? "Forms + tables" : "Just text"}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={copy}>
            <Icon name={copied ? "check" : "copy"} size={13}/> {copied ? "Copied" : "Copy"}
          </button>
          <button className="btn btn-secondary btn-sm"><Icon name="download" size={13}/> .md</button>
        </div>

        <div style={{ padding: "20px 28px", flex: 1, overflowY: "auto" }}>
          <div className="serif" style={{ fontSize: "var(--fs-md)", lineHeight: 1.7 }}>
            {blocks.map((b, i) => (
              <div key={i} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}
                style={{
                  padding: "4px 8px", margin: "0 -8px",
                  borderRadius: 4, cursor: "pointer",
                  background: active === i ? "var(--color-accent-soft)" : "transparent",
                  fontWeight: b.hd ? 600 : 400,
                  fontSize: b.hd ? "var(--fs-lg)" : "var(--fs-md)",
                  borderBottom: b.low ? "2px wavy rgba(176, 107, 31, 0.55)" : "none",
                  textDecoration: b.low ? "underline wavy rgba(176, 107, 31, 0.55)" : "none",
                  textDecorationThickness: 1.5,
                  textUnderlineOffset: 4,
                  transition: "background var(--motion-fast) var(--ease)",
                }}>
                <span>{b.text}</span>
                <span style={{
                  marginLeft: 8, fontSize: 10, fontFamily: "var(--font-mono)",
                  color: b.conf < 75 ? "var(--color-warn)" : "var(--color-ink-3)",
                  opacity: active === i ? 1 : 0, transition: "opacity var(--motion-fast)",
                }}>{b.conf}%</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: 12, background: "var(--color-paper-2)", borderRadius: "var(--r-sm)", border: "1px solid var(--color-line)", fontSize: "var(--fs-xs)", color: "var(--color-ink-2)" }}>
            <div className="row" style={{ gap: 6, marginBottom: 4, color: "var(--color-warn)" }}>
              <Icon name="alert" size={13}/> <strong>Low-confidence lines</strong>
            </div>
            Lines below 75% are underlined in amber. Hover to see per-block confidence, or click through to Textract's raw JSON.
          </div>
        </div>

        <div style={{ padding: "12px 28px", borderTop: "1px solid var(--color-line)", display: "flex", gap: 8, background: "var(--color-paper-2)" }}>
          <button className="btn btn-secondary btn-sm" onClick={() => { setAnalyzing(true); setTimeout(() => setAnalyzing(false), 1400); }} disabled={analyzing}>
            <Icon name="refresh" size={12} style={analyzing ? { animation: "spin 1s linear infinite" } : {}}/> {analyzing ? "Re-running…" : "Re-run OCR"}
          </button>
          <Dropdown label={asset.ocr_mode === "forms" ? "Forms + tables" : "Just text"} value={asset.ocr_mode || "text"} onChange={() => {}} options={[
            { v: "text", l: "Just text (cheaper)" },
            { v: "forms", l: "Forms + tables" },
          ]}/>
          <div className="grow"/>
          <span className="muted" style={{ fontSize: 11, alignSelf: "center" }}>Job id: <span className="mono">txt_0f81b3a</span></span>
        </div>
      </div>
    </div>
  );
}

function SyntheticDocBg({ blocks }) {
  return (
    <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(180deg, #fdfcf7 0%, #faf7f0 100%)" }}>
      {/* faint ruled lines */}
      <div aria-hidden style={{ position: "absolute", inset: "8%", backgroundImage: "linear-gradient(var(--color-paper-4) 1px, transparent 1px)", backgroundSize: "100% 28px", opacity: 0.35 }}/>
      {blocks.map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: `${b.box[0]}%`, top: `${b.box[1] + 0.6}%`, maxWidth: `${b.box[2]}%`,
          fontFamily: "var(--font-serif)", fontSize: b.hd ? 18 : 13, color: "#2a2822",
          fontWeight: b.hd ? 600 : 400, fontStyle: b.low ? "italic" : "normal",
          lineHeight: 1.25,
        }}>{b.text}</div>
      ))}
    </div>
  );
}

window.AssetDetail = AssetDetail;
