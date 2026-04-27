// Upload, Chat, Profile, Settings, Admin, Help, CommandPalette, Tweaks

const { useState: uS, useEffect: uE, useRef: uR, useMemo: uM } = React;

// -------- UPLOAD --------
function UploadScreen({ onDone }) {
  const [items, setItems] = uS([
    { id: 1, name: "04sailing.jpg",        size: 132000, kind: "photo",    status: "done",       progress: 100, labels: 12 },
    { id: 2, name: "lecture-notes-w4.jpg", size: 411000, kind: "document", status: "analyzing",  progress: 100, note: "Textract · just text" },
    { id: 3, name: "whiteboard.jpg",       size: 522000, kind: "document", status: "uploading",  progress: 58 },
    { id: 4, name: "trail-ridge.raw",      size: 2400000, kind: "photo",   status: "waiting",    progress: 0 },
  ]);
  const [classify, setClassify] = uS("auto");
  const [ocrMode, setOcrMode] = uS("text");
  const [dragging, setDragging] = uS(false);

  uE(() => {
    const t = setInterval(() => {
      setItems(its => its.map(it => {
        if (it.status === "uploading") {
          const p = Math.min(100, it.progress + 4 + Math.random()*8);
          return { ...it, progress: p, status: p >= 100 ? "analyzing" : "uploading" };
        }
        if (it.status === "analyzing" && Math.random() > 0.85) {
          return { ...it, status: "done", labels: it.kind === "photo" ? 9 : undefined, note: it.kind === "document" ? "312 words · 87% avg" : undefined };
        }
        return it;
      }));
    }, 600);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <PageHeader title="Upload" subtitle="Drag files, pick a classification, then we'll analyze them for you."
        actions={<button className="btn btn-secondary" onClick={onDone}>Back to library</button>}/>
      <div style={{ padding: "24px 32px", overflow: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 24, maxWidth: 900 }}>
        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); }}
          style={{
            border: `1.5px dashed ${dragging ? "var(--color-accent)" : "var(--color-line-strong)"}`,
            borderRadius: "var(--r-lg)", padding: "56px 24px",
            textAlign: "center", background: dragging ? "var(--color-accent-soft)" : "var(--color-paper-2)",
            transition: "background var(--motion-fast), border-color var(--motion-fast)",
          }}>
          <div style={{ width: 48, height: 48, margin: "0 auto 14px", borderRadius: "var(--r-md)", background: "var(--color-paper)", border: "1px solid var(--color-line)", display: "grid", placeItems: "center", color: "var(--color-accent)" }}>
            <Icon name="upload" size={22}/>
          </div>
          <div className="serif" style={{ fontSize: "var(--fs-xl)", fontWeight: 500 }}>Drop files here</div>
          <div className="muted" style={{ marginTop: 4, fontSize: "var(--fs-sm)" }}>or click to browse · .jpg .png .pdf .heic · max 50 MB per file</div>
          <button className="btn btn-primary" style={{ marginTop: 18 }}><Icon name="upload" size={14}/> Browse files</button>
        </div>

        {/* Options */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div className="label">Classify as</div>
              <div className="col" style={{ gap: 6 }}>
                {[["auto", "Auto-detect", "Uses content-type + Rekognition text heuristic"], ["photo", "Photo", "Run Rekognition DetectLabels"], ["document", "Document", "Run Textract for OCR"]].map(([v, l, d]) => (
                  <label key={v} className="row" style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: `1px solid ${classify === v ? "var(--color-accent)" : "var(--color-line)"}`, background: classify === v ? "var(--color-accent-soft)" : "var(--color-paper)", cursor: "pointer", gap: 10 }}>
                    <input type="radio" checked={classify === v} onChange={() => setClassify(v)} style={{ accentColor: "var(--color-accent)" }}/>
                    <div className="grow"><div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{l}</div><div className="muted" style={{ fontSize: 11 }}>{d}</div></div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="label">OCR mode (documents only)</div>
              <div className="col" style={{ gap: 6 }}>
                {[["text", "Just text", "DetectDocumentText · cheaper · fast"], ["forms", "Forms + tables", "AnalyzeDocument · extracts structure"]].map(([v, l, d]) => (
                  <label key={v} className="row" style={{ padding: "8px 10px", borderRadius: "var(--r-sm)", border: `1px solid ${ocrMode === v ? "var(--color-accent)" : "var(--color-line)"}`, background: ocrMode === v ? "var(--color-accent-soft)" : "var(--color-paper)", cursor: "pointer", gap: 10 }}>
                    <input type="radio" checked={ocrMode === v} onChange={() => setOcrMode(v)} style={{ accentColor: "var(--color-accent)" }}/>
                    <div className="grow"><div style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>{l}</div><div className="muted" style={{ fontSize: 11 }}>{d}</div></div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Queue */}
        <div>
          <div className="row" style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Queue</h3>
            <span className="pill" style={{ height: 20, fontSize: 11 }}>{items.length}</span>
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            {items.map((it, i) => (
              <div key={it.id} style={{ display: "grid", gridTemplateColumns: "28px 1fr 160px 110px 80px", gap: 12, alignItems: "center", padding: "10px 16px", borderBottom: i < items.length - 1 ? "1px solid var(--color-line)" : "none", fontSize: "var(--fs-sm)" }}>
                <StatusIcon s={it.status}/>
                <div><div style={{ fontWeight: 500 }}>{it.name}</div><div className="muted" style={{ fontSize: 11 }}>{fmtBytes(it.size)} · {it.kind}</div></div>
                <div>
                  {it.status === "uploading" ? (
                    <div style={{ height: 4, background: "var(--color-paper-3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ width: `${it.progress}%`, height: "100%", background: "var(--color-accent)", transition: "width .3s" }}/>
                    </div>
                  ) : it.status === "analyzing" ? (
                    <span className="muted" style={{ fontSize: 11 }}>{it.kind === "photo" ? "Rekognition…" : "Textract…"}</span>
                  ) : it.status === "done" ? (
                    <span className="muted" style={{ fontSize: 11 }}>{it.labels ? `${it.labels} labels` : it.note}</span>
                  ) : <span className="muted" style={{ fontSize: 11 }}>waiting</span>}
                </div>
                <span className="muted" style={{ fontSize: 11 }}>{
                  it.status === "uploading" ? `${Math.round(it.progress)}%` :
                  it.status === "done" ? "done" : it.status
                }</span>
                <button className="btn btn-ghost btn-sm"><Icon name="more" size={14}/></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
function StatusIcon({ s }) {
  const map = {
    done: { icon: "check2", c: "var(--color-success)" },
    uploading: { icon: "arrowU", c: "var(--color-accent)", spin: true },
    analyzing: { icon: "sparkle", c: "var(--color-accent)", spin: true },
    waiting: { icon: "pause", c: "var(--color-ink-3)" },
  }[s] || { icon: "close", c: "var(--color-error)" };
  return <Icon name={map.icon} size={15} style={{ color: map.c, animation: map.spin ? "spin 1.4s linear infinite" : "none" }}/>;
}

// -------- CHAT --------
function ChatScreen({ user }) {
  const [msgs, setMsgs] = uS(window.MOCK.MESSAGES);
  const [text, setText] = uS("");
  const [sseConnected, setSseConnected] = uS(true);
  const scroller = uR();
  uE(() => { scroller.current && (scroller.current.scrollTop = scroller.current.scrollHeight); }, [msgs]);

  const send = () => {
    if (!text.trim()) return;
    const id = Date.now();
    setMsgs(m => [...m, { id, from: user.userid, text: text.trim(), t: "now", state: "sending", self: true }]);
    setText("");
    setTimeout(() => setMsgs(m => m.map(x => x.id === id ? { ...x, state: "sent" } : x)), 500);
    setTimeout(() => setMsgs(m => m.map(x => x.id === id ? { ...x, state: "delivered" } : x)), 1600);
  };

  const userById = Object.fromEntries(window.MOCK.CHAT_USERS.map(u => [u.id, u]));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", flex: 1, minHeight: 0 }}>
      {/* Participants */}
      <aside style={{ borderRight: "1px solid var(--color-line)", background: "var(--color-paper)", overflowY: "auto", padding: 16 }}>
        <div className="row" style={{ marginBottom: 12 }}>
          <h3 style={{ fontSize: "var(--fs-md)", fontWeight: 500, margin: 0 }}>Participants</h3>
          <span className="pill" style={{ fontSize: 10, height: 18 }}>{window.MOCK.CHAT_USERS.length}</span>
        </div>
        {window.MOCK.CHAT_USERS.map(u => (
          <div key={u.id} className="row" style={{ padding: "7px 8px", borderRadius: "var(--r-sm)", gap: 10, fontSize: "var(--fs-sm)" }}>
            <span style={{ position: "relative", width: 26, height: 26, borderRadius: "var(--r-full)", background: "var(--color-paper-3)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--color-ink-2)" }}>
              {u.name[0]}
              <span style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: 5, border: "2px solid var(--color-paper)", background: u.online ? "var(--color-success)" : "var(--color-ink-3)" }}/>
            </span>
            <span className="grow truncate" style={{ fontWeight: u.self ? 500 : 400 }}>{u.name} {u.self && <span className="muted" style={{ fontWeight: 400 }}>(you)</span>}</span>
            {u.badge && <span className="pill" style={{ fontSize: 10, height: 17 }}>{u.badge}</span>}
          </div>
        ))}
        <hr className="divider" style={{ margin: "12px 0" }}/>
        <div className="muted" style={{ fontSize: "var(--fs-xs)", padding: "0 8px" }}>
          <div className="row" style={{ gap: 6, marginBottom: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: sseConnected ? "var(--color-success)" : "var(--color-warn)" }}/>
            SSE · GET /chat/stream
          </div>
          Exponential backoff on drop. Replays since last seen id.
        </div>
      </aside>

      {/* Messages */}
      <div style={{ display: "flex", flexDirection: "column", minHeight: 0, background: "var(--color-paper)" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid var(--color-line)", display: "flex", alignItems: "center", gap: 10 }}>
          <span className="serif" style={{ fontSize: "var(--fs-lg)", fontWeight: 500 }}># general</span>
          <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>· Group 1 · Spring 2026</span>
          <div className="grow"/>
          <button className="btn btn-ghost btn-sm"><Icon name="settings" size={13}/></button>
        </div>
        <div ref={scroller} style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {msgs.map((m, i) => {
            const u = userById[m.from] || { name: "Unknown" };
            const prev = msgs[i-1];
            const grouped = prev && prev.from === m.from && !m.self;
            return (
              <div key={m.id} className="row fade-in" style={{ alignItems: "flex-start", gap: 10, marginTop: grouped ? 0 : 10, flexDirection: m.self ? "row-reverse" : "row" }}>
                {!m.self && (
                  <span style={{ width: 28, height: 28, borderRadius: "var(--r-full)", background: "var(--color-paper-3)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--color-ink-2)", visibility: grouped ? "hidden" : "visible", flexShrink: 0 }}>
                    {u.name[0]}
                  </span>
                )}
                <div style={{ maxWidth: "68%" }}>
                  {!grouped && !m.self && <div className="row" style={{ gap: 6, marginBottom: 2 }}><span style={{ fontSize: "var(--fs-xs)", fontWeight: 500 }}>{u.name}</span><span className="muted" style={{ fontSize: 10 }}>{m.t}</span></div>}
                  <div style={{
                    padding: "8px 12px", borderRadius: "var(--r-md)",
                    background: m.self ? "var(--color-accent)" : "var(--color-paper-2)",
                    color: m.self ? "var(--color-accent-fg)" : "var(--color-ink)",
                    border: m.self ? "none" : "1px solid var(--color-line)",
                    fontSize: "var(--fs-sm)",
                  }}>{m.text}</div>
                  {m.self && <div className="row" style={{ gap: 4, justifyContent: "flex-end", marginTop: 3, fontSize: 10, color: "var(--color-ink-3)" }}>
                    <Icon name={m.state === "delivered" ? "check2" : m.state === "sent" ? "check" : "refresh"} size={11} style={m.state === "sending" ? { animation: "spin 1s linear infinite" } : {}}/>
                    {m.state}
                  </div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: "12px 24px 16px", borderTop: "1px solid var(--color-line)" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: "var(--r-md)", padding: 8 }}>
            <textarea className="input" placeholder="Type a message…" rows={1}
              style={{ border: "none", background: "transparent", height: "auto", minHeight: 26, resize: "none", padding: "4px 8px" }}
              value={text} onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}/>
            <button className="btn btn-primary btn-sm" onClick={send} disabled={!text.trim()}><Icon name="send" size={13}/> Send</button>
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>Enter to send · Shift+Enter for newline · Webhook → SSE shim delivers asynchronously</div>
        </div>
      </div>
    </div>
  );
}

// -------- PROFILE --------
function ProfileScreen({ user, assets, onNav }) {
  const photos = assets.filter(a => a.kind === "photo").length;
  const docs = assets.filter(a => a.kind === "document").length;
  const totalSize = assets.reduce((s, a) => s + a.size, 0);
  const lastUpload = Math.max(...assets.map(a => a.uploaded));
  return (
    <>
      <PageHeader title="Profile" actions={<button className="btn btn-secondary" onClick={() => onNav("/profile/settings")}><Icon name="settings" size={14}/> Settings</button>}/>
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, maxWidth: 960 }}>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          <div style={{ width: 80, height: 80, borderRadius: "var(--r-full)", background: "var(--color-accent)", color: "var(--color-accent-fg)", margin: "0 auto 12px", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 600 }}>
            {user.givenname[0]}{user.familyname[0]}
          </div>
          <div className="serif" style={{ fontSize: "var(--fs-xl)", fontWeight: 500 }}>{user.givenname} {user.familyname}</div>
          <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>@{user.username}</div>
          <div style={{ marginTop: 8 }}><span className="pill pill-accent">staff</span></div>
          <hr className="divider" style={{ margin: "16px 0" }}/>
          <div style={{ fontSize: "var(--fs-xs)", color: "var(--color-ink-2)", textAlign: "left" }}>
            <MetaRow k="User ID" v={<span className="mono">{user.userid}</span>}/>
            <MetaRow k="Joined" v={fmtDate(user.created)}/>
            <MetaRow k="Region" v="us-east-2"/>
          </div>
        </div>
        <div className="col" style={{ gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            <Stat label="Total assets" v={assets.length}/>
            <Stat label="Photos" v={photos}/>
            <Stat label="Documents" v={docs}/>
            <Stat label="Storage" v={fmtBytes(totalSize)}/>
          </div>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Recent activity</h3>
            <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2, marginBottom: 14 }}>Last upload {fmtDateRel(lastUpload)}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {assets.slice(0, 5).map(a => (
                <div key={a.id} className="row" style={{ gap: 10, fontSize: "var(--fs-sm)" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 4, background: "var(--color-paper-3)", overflow: "hidden", flexShrink: 0 }}>
                    {a.thumb ? <img src={a.thumb} style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--color-ink-3)" }}><Icon name="doc" size={13}/></div>}
                  </div>
                  <span className="grow truncate">{a.name}</span>
                  <span className="muted" style={{ fontSize: 11 }}>{fmtDateRel(a.uploaded)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function Stat({ label, v }) {
  return (
    <div className="card" style={{ padding: 14 }}>
      <div className="muted" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</div>
      <div className="serif" style={{ fontSize: "var(--fs-xl)", fontWeight: 500, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{v}</div>
    </div>
  );
}

// -------- SETTINGS --------
function SettingsScreen({ user, onBack }) {
  return (
    <>
      <PageHeader title="Settings" crumbs={[{ label: "Profile", onClick: onBack }, { label: "Settings" }]}/>
      <div style={{ padding: "24px 32px", maxWidth: 640, display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Change password</h3>
          <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2, marginBottom: 14 }}>Requires current password.</div>
          <div style={{ display: "grid", gap: 10 }}>
            <div><label className="label">Current password</label><input className="input" type="password"/></div>
            <div><label className="label">New password</label><input className="input" type="password"/></div>
            <div><label className="label">Confirm new password</label><input className="input" type="password"/></div>
          </div>
          <div className="row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
            <button className="btn btn-primary btn-sm"><Icon name="key" size={13}/> Update password</button>
          </div>
        </section>
        <section className="card" style={{ padding: 20 }}>
          <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500 }}>Display name</h3>
          <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2, marginBottom: 14 }}>Shown on uploads and in chat.</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div><label className="label">Given name</label><input className="input" defaultValue={user.givenname}/></div>
            <div><label className="label">Family name</label><input className="input" defaultValue={user.familyname}/></div>
          </div>
          <div className="row" style={{ marginTop: 14, justifyContent: "flex-end" }}>
            <button className="btn btn-secondary btn-sm">Save</button>
          </div>
        </section>
        <section className="card" style={{ padding: 20, borderColor: "rgba(184, 69, 69, 0.3)" }}>
          <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500, color: "var(--color-error)" }}>Delete account</h3>
          <div className="muted" style={{ fontSize: "var(--fs-xs)", marginTop: 2, marginBottom: 14 }}>Removes your user, all assets, and chat registration. Cannot be undone.</div>
          <button className="btn btn-danger btn-sm"><Icon name="trash" size={13}/> Delete my account…</button>
        </section>
      </div>
    </>
  );
}

// -------- ADMIN USERS --------
function AdminUsers() {
  return (
    <>
      <PageHeader title="Users" subtitle="All accounts across the deployment. Staff-only."
        crumbs={[{ label: "Admin" }, { label: "Users" }]}
        actions={<><button className="btn btn-secondary btn-sm"><Icon name="download" size={13}/> Export CSV</button></>}/>
      <div style={{ padding: "20px 32px", overflow: "auto" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "60px 1.2fr 1fr 1fr 100px 120px 40px", gap: 12, padding: "10px 16px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--color-ink-3)", fontWeight: 500, borderBottom: "1px solid var(--color-line)", background: "var(--color-paper-3)" }}>
            <span>ID</span><span>Username</span><span>Given</span><span>Family</span><span style={{ textAlign: "right" }}>Assets</span><span>Last upload</span><span/>
          </div>
          {window.MOCK.USERS_TABLE.map((u, i) => (
            <div key={u.id} style={{ display: "grid", gridTemplateColumns: "60px 1.2fr 1fr 1fr 100px 120px 40px", gap: 12, padding: "12px 16px", alignItems: "center", fontSize: "var(--fs-sm)", borderBottom: i < window.MOCK.USERS_TABLE.length - 1 ? "1px solid var(--color-line)" : "none" }}>
              <span className="mono muted" style={{ fontSize: 11 }}>{u.id}</span>
              <span className="row" style={{ gap: 8 }}>
                <span style={{ width: 24, height: 24, borderRadius: "var(--r-full)", background: "var(--color-paper-3)", display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600, color: "var(--color-ink-2)" }}>{u.given[0]}</span>
                <span>@{u.username}</span>
              </span>
              <span>{u.given}</span>
              <span>{u.family}</span>
              <span className="mono" style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{u.assets}</span>
              <span className="muted" style={{ fontSize: "var(--fs-xs)" }}>{u.last}</span>
              <button className="btn btn-ghost btn-sm"><Icon name="more" size={14}/></button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// -------- HELP --------
function HelpScreen() {
  const groups = [
    { h: "Global", items: [["⌘ K", "Open search"], ["/", "Focus inline search"], ["?", "This help"], ["Esc", "Close overlay"]] },
    { h: "Library", items: [["U", "Upload modal"], ["G", "Grid view"], ["L", "List view"], ["J / K", "Next / previous row"], ["X", "Toggle selection"]] },
    { h: "Asset", items: [["←  →", "Navigate between assets"], ["R", "Re-run analysis"], ["D", "Download"], ["⌫", "Delete (with confirm)"]] },
    { h: "Chat", items: [["Enter", "Send message"], ["Shift+Enter", "Newline"]] },
  ];
  return (
    <>
      <PageHeader title="Help & shortcuts" subtitle="Every action has a key. Press ? anywhere to bring this up."/>
      <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 960 }}>
        {groups.map(g => (
          <div key={g.h} className="card" style={{ padding: 18 }}>
            <h3 style={{ margin: 0, fontSize: "var(--fs-md)", fontWeight: 500, marginBottom: 10 }}>{g.h}</h3>
            {g.items.map(([k, l]) => (
              <div key={k} className="row" style={{ padding: "6px 0", borderBottom: "1px dashed var(--color-line)", fontSize: "var(--fs-sm)" }}>
                <span className="grow">{l}</span>
                <span className="row" style={{ gap: 2 }}>{k.split(" ").map((kk, i) => <kbd key={i}>{kk}</kbd>)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// -------- COMMAND PALETTE --------
function CommandPalette({ open, onClose, onNav, onOpenAsset, assets }) {
  const [q, setQ] = uS("");
  const [sel, setSel] = uS(0);
  uE(() => { if (open) { setQ(""); setSel(0); } }, [open]);

  const actions = [
    { t: "Upload", k: "action", ico: "upload", go: () => onNav("/upload") },
    { t: "Chat", k: "action", ico: "chat", go: () => onNav("/chat") },
    { t: "Profile", k: "action", ico: "user", go: () => onNav("/profile") },
    { t: "All users (admin)", k: "action", ico: "users", go: () => onNav("/admin/users") },
    { t: "Help & shortcuts", k: "action", ico: "help", go: () => onNav("/help") },
  ];
  const items = uM(() => {
    if (!q) return [...actions.slice(0, 3), ...assets.slice(0, 6).map(a => ({ t: a.name, k: "asset", a, ico: a.kind === "document" ? "doc" : "image" }))];
    const Q = q.toLowerCase();
    const assetMatches = assets.filter(a => a.name.toLowerCase().includes(Q) || (a.labels || []).some(l => l[0].toLowerCase().includes(Q)) || (a.ocr_excerpt || "").toLowerCase().includes(Q)).slice(0, 10).map(a => ({ t: a.name, k: "asset", a, ico: a.kind === "document" ? "doc" : "image", hint: a.kind === "document" ? a.ocr_excerpt?.slice(0, 60) : (a.labels||[]).slice(0,3).map(l=>l[0]).join(" · ") }));
    const actMatches = actions.filter(a => a.t.toLowerCase().includes(Q));
    return [...actMatches, ...assetMatches];
  }, [q, assets]);

  uE(() => {
    if (!open) return;
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") { e.preventDefault(); setSel(s => Math.min(items.length - 1, s + 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setSel(s => Math.max(0, s - 1)); }
      if (e.key === "Enter") {
        const it = items[sel];
        if (!it) return;
        if (it.k === "asset") onOpenAsset(it.a.id);
        else it.go();
        onClose();
      }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, items, sel, onClose, onOpenAsset]);

  if (!open) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(28,27,24,0.3)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "12vh" }}>
      <div onClick={e => e.stopPropagation()} className="fade-in" style={{ width: 560, maxWidth: "calc(100vw - 40px)", background: "var(--color-paper)", borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-3)", border: "1px solid var(--color-line)", overflow: "hidden" }}>
        <div className="row" style={{ padding: "4px 12px", borderBottom: "1px solid var(--color-line)" }}>
          <Icon name="search" size={16} style={{ color: "var(--color-ink-3)" }}/>
          <input autoFocus placeholder="Search assets, labels, text, actions…" value={q} onChange={e => { setQ(e.target.value); setSel(0); }}
            style={{ flex: 1, height: 42, background: "transparent", border: "none", outline: "none", fontSize: "var(--fs-md)" }}/>
          <kbd>Esc</kbd>
        </div>
        <div style={{ maxHeight: 440, overflowY: "auto", padding: 6 }}>
          {items.length === 0 && <div style={{ padding: 24, textAlign: "center" }} className="muted">No matches for "{q}"</div>}
          {items.map((it, i) => (
            <button key={i} onMouseEnter={() => setSel(i)}
              onClick={() => { if (it.k === "asset") onOpenAsset(it.a.id); else it.go(); onClose(); }}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: "var(--r-sm)", textAlign: "left",
                background: sel === i ? "var(--color-accent-soft)" : "transparent",
                fontSize: "var(--fs-sm)",
              }}>
              <Icon name={it.ico} size={16} style={{ color: sel === i ? "var(--color-accent)" : "var(--color-ink-3)" }}/>
              <div className="col grow" style={{ minWidth: 0 }}>
                <span className="truncate">{it.t}</span>
                {it.hint && <span className="muted truncate" style={{ fontSize: 11 }}>{it.hint}</span>}
              </div>
              <span className="muted" style={{ fontSize: 11 }}>{it.k}</span>
              {sel === i && <Icon name="return" size={13} style={{ color: "var(--color-ink-3)" }}/>}
            </button>
          ))}
        </div>
        <div className="row muted" style={{ padding: "8px 12px", borderTop: "1px solid var(--color-line)", fontSize: 11, gap: 12, background: "var(--color-paper-2)" }}>
          <span className="row" style={{ gap: 4 }}><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
          <span className="row" style={{ gap: 4 }}><kbd>Enter</kbd> Open</span>
          <span className="row" style={{ gap: 4 }}><kbd>Esc</kbd> Close</span>
          <div className="grow"/>
          <span>MBAi 460 · {items.length} results</span>
        </div>
      </div>
    </div>
  );
}

// -------- TWEAKS PANEL --------
function TweaksPanel({ open, onClose, tweaks, setTweaks }) {
  if (!open) return null;
  return (
    <div className="fade-in" style={{
      position: "fixed", right: 20, bottom: 20, width: 300, zIndex: 700,
      background: "var(--color-paper)", border: "1px solid var(--color-line)",
      borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-3)", overflow: "hidden",
    }}>
      <div className="row" style={{ padding: "10px 14px", borderBottom: "1px solid var(--color-line)", background: "var(--color-paper-2)" }}>
        <Icon name="sliders" size={14} style={{ color: "var(--color-accent)" }}/>
        <span style={{ fontSize: "var(--fs-sm)", fontWeight: 500 }}>Tweaks</span>
        <div className="grow"/>
        <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close"><Icon name="close" size={13}/></button>
      </div>
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14 }}>
        <TRow label="Theme">
          <SegmentedControl value={tweaks.theme} onChange={v => setTweaks({ ...tweaks, theme: v })} options={[{ v: "light", icon: "sun", l: "Light" }, { v: "dark", icon: "moon", l: "Dark" }]}/>
        </TRow>
        <TRow label="Accent">
          <div className="row" style={{ gap: 6 }}>
            {[["#CC785C", "Coral"], ["#6B8E7A", "Sage"], ["#7B6BAF", "Violet"], ["#D4A157", "Amber"], ["#5A8DB6", "Slate blue"]].map(([c, n]) => (
              <button key={c} onClick={() => setTweaks({ ...tweaks, accent: c })}
                title={n}
                style={{ width: 22, height: 22, borderRadius: "var(--r-full)", background: c, border: tweaks.accent === c ? "2px solid var(--color-ink)" : "1px solid var(--color-line)", outline: tweaks.accent === c ? "2px solid var(--color-paper)" : "none", outlineOffset: -4 }}/>
            ))}
          </div>
        </TRow>
        <TRow label="Density">
          <SegmentedControl value={tweaks.density} onChange={v => setTweaks({ ...tweaks, density: v })} options={[{ v: "dense", l: "Dense" }, { v: "comfy", l: "Comfy" }, { v: "airy", l: "Airy" }]}/>
        </TRow>
        <TRow label="Mock data seed">
          <div className="row" style={{ gap: 6 }}>
            <input className="input" style={{ height: 28, fontSize: "var(--fs-xs)" }} value={tweaks.seed} onChange={e => setTweaks({ ...tweaks, seed: e.target.value })}/>
            <button className="btn btn-ghost btn-sm" onClick={() => setTweaks({ ...tweaks, seed: Math.random().toString(36).slice(2, 7) })}><Icon name="refresh" size={12}/></button>
          </div>
        </TRow>
        <TRow label="Empty state">
          <label className="row" style={{ gap: 6, fontSize: "var(--fs-xs)" }}>
            <input type="checkbox" checked={tweaks.empty} onChange={e => setTweaks({ ...tweaks, empty: e.target.checked })} style={{ accentColor: "var(--color-accent)" }}/>
            Show empty library
          </label>
        </TRow>
        <div className="muted" style={{ fontSize: 11, borderTop: "1px dashed var(--color-line)", paddingTop: 10 }}>
          Prototype knobs. Not part of the shipping app.
        </div>
      </div>
    </div>
  );
}
function TRow({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "var(--color-ink-3)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

Object.assign(window, { UploadScreen, ChatScreen, ProfileScreen, SettingsScreen, AdminUsers, HelpScreen, CommandPalette, TweaksPanel });
