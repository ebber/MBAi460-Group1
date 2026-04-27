// Mobile Chat, Profile, Settings, Admin, Help, Auth
const { useState: useSN, useEffect: useEN, useMemo: useMN, useRef: useRN } = React;

// ─────────────────── CHAT ───────────────────
function MChat({ me, users, messages: initial }) {
  const [messages, setMessages] = useSN(initial);
  const [draft, setDraft] = useSN("");
  const [typing, setTyping] = useSN(false);
  const [peopleOpen, setPeopleOpen] = useSN(false);
  const scrollRef = useRN();

  useEN(() => { scrollRef.current?.scrollTo(0, 999999); }, [messages.length]);

  const send = () => {
    const t = draft.trim(); if (!t) return;
    const id = Date.now();
    setMessages(m => [...m, { id, from: me.userid, text: t, t: "now", state: "sent", self: true }]);
    setDraft("");
    setTyping(true);
    setTimeout(() => {
      setMessages(m => m.map(x => x.id === id ? { ...x, state: "delivered" } : x));
    }, 500);
    setTimeout(() => {
      setTyping(false);
      const replies = ["got it", "nice", "+1", "pushing the branch now", "let's sync after class"];
      setMessages(m => [...m, { id: Date.now() + 1, from: 3, text: replies[Math.floor(Math.random() * replies.length)], t: "now", state: "delivered" }]);
    }, 1600 + Math.random() * 800);
  };

  const userById = (id) => users.find(u => u.id === id) || {};

  return (
    <>
      <div className="m-topbar">
        <div className="logo">M</div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 16, fontWeight: 500 }}>Group 1 · MBAi 460</div>
          <div className="muted" style={{ fontSize: 11 }}>{users.filter(u => u.online).length} online · {users.length} members</div>
        </div>
        <button className="icon-btn" onClick={() => setPeopleOpen(true)} aria-label="Members"><Icon name="users" size={18}/></button>
      </div>

      <div ref={scrollRef} className="m-body" style={{ padding: "12px 12px 90px", display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--color-ink-3)", padding: "4px 0 10px" }}>— Today —</div>
        {messages.map((m, i) => {
          const u = userById(m.from);
          const self = m.self;
          const prev = messages[i - 1];
          const showName = !self && (!prev || prev.from !== m.from || prev.self);
          return (
            <div key={m.id} className="fade-in" style={{ display: "flex", gap: 8, justifyContent: self ? "flex-end" : "flex-start", marginTop: showName ? 8 : 0 }}>
              {!self && (
                <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--color-paper-3)", color: "var(--color-ink-2)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, alignSelf: "flex-end", flexShrink: 0, visibility: showName ? "visible" : "hidden" }}>{u.name?.[0]}</div>
              )}
              <div style={{ maxWidth: "76%" }}>
                {showName && <div className="muted" style={{ fontSize: 11, marginLeft: 2, marginBottom: 2 }}>{u.name}{u.badge ? <span className="m-chip" style={{ marginLeft: 6, height: 16, fontSize: 9, padding: "0 6px" }}>{u.badge}</span> : ""}</div>}
                <div style={{
                  padding: "8px 12px", borderRadius: 16,
                  background: self ? "var(--color-accent)" : "var(--color-paper-2)",
                  color: self ? "var(--color-accent-fg)" : "var(--color-ink)",
                  border: self ? "none" : "1px solid var(--color-line)",
                  fontSize: 14, lineHeight: 1.35,
                  borderTopRightRadius: self && prev?.self ? 6 : 16,
                  borderTopLeftRadius: !self && prev && !prev.self && prev.from === m.from ? 6 : 16,
                }}>
                  {m.text}
                </div>
                <div className="muted" style={{ fontSize: 10, marginTop: 2, textAlign: self ? "right" : "left" }}>
                  {m.t}{self && m.state === "delivered" ? " · ✓✓" : self ? " · ✓" : ""}
                </div>
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="fade-in" style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 14, background: "var(--color-paper-3)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 600, color: "var(--color-ink-2)" }}>E</div>
            <div style={{ padding: "10px 14px", borderRadius: 16, background: "var(--color-paper-2)", border: "1px solid var(--color-line)", display: "flex", gap: 3 }}>
              <TypingDot d={0}/><TypingDot d={0.2}/><TypingDot d={0.4}/>
            </div>
          </div>
        )}
      </div>

      {/* composer (over tab bar) */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 72, padding: "8px 10px 10px", background: "color-mix(in srgb, var(--color-paper) 92%, transparent)", backdropFilter: "blur(10px)", borderTop: "1px solid var(--color-line)", display: "flex", alignItems: "flex-end", gap: 8, zIndex: 19 }}>
        <button className="icon-btn" style={{ width: 36, height: 36, border: "1px solid var(--color-line)", borderRadius: 18, flexShrink: 0 }} aria-label="Attach"><Icon name="plus" size={18}/></button>
        <textarea className="m-input" placeholder="Message group…" value={draft} onChange={e => setDraft(e.target.value)} rows={1}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          style={{ height: 36, minHeight: 36, maxHeight: 100, padding: "8px 12px", resize: "none", fontSize: 14 }}/>
        <button onClick={send} disabled={!draft.trim()} className="icon-btn" style={{ width: 36, height: 36, borderRadius: 18, background: draft.trim() ? "var(--color-accent)" : "var(--color-paper-3)", color: draft.trim() ? "var(--color-accent-fg)" : "var(--color-ink-3)", flexShrink: 0 }} aria-label="Send">
          <Icon name="send" size={16}/>
        </button>
      </div>

      <MSheet open={peopleOpen} onClose={() => setPeopleOpen(false)} title="Members">
        <div className="m-card">
          {users.map((u, i) => (
            <div key={u.id} className="m-row" style={{ borderBottom: i < users.length - 1 ? "1px solid var(--color-line)" : "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: "var(--color-paper-3)", color: "var(--color-ink-2)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600, position: "relative" }}>
                {u.name[0]}
                {u.online && <span style={{ position: "absolute", right: -1, bottom: -1, width: 10, height: 10, borderRadius: 5, background: "var(--color-success)", border: "2px solid var(--color-paper)" }}/>}
              </div>
              <div className="grow">
                <div style={{ fontSize: 14, fontWeight: 500 }}>{u.name} {u.self && <span className="muted" style={{ fontWeight: 400, fontSize: 12 }}>(you)</span>}</div>
                <div className="muted" style={{ fontSize: 11 }}>{u.online ? "Online" : "Offline"}</div>
              </div>
              {u.badge && <span className="m-chip">{u.badge}</span>}
            </div>
          ))}
        </div>
      </MSheet>
    </>
  );
}

function TypingDot({ d }) {
  return <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--color-ink-3)", animation: `mBlink 1.2s ${d}s infinite` }}/>;
}

// ─────────────────── PROFILE ───────────────────
function MProfile({ user, assets, onNav, onLogout }) {
  const stats = {
    assets: assets.length,
    photos: assets.filter(a => a.kind === "photo").length,
    docs: assets.filter(a => a.kind === "document").length,
    bytes: assets.reduce((s, a) => s + a.size, 0),
  };
  const joined = new Date(user.created).toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <>
      <div className="m-topbar">
        <div className="logo">M</div>
        <div className="grow" style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>Profile</div>
        <button className="icon-btn" onClick={() => onNav("settings")} aria-label="Settings"><Icon name="settings" size={18}/></button>
      </div>

      {/* hero */}
      <div style={{ padding: "20px 16px 8px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 64, height: 64, borderRadius: 32, background: "var(--color-accent)", color: "var(--color-accent-fg)", display: "grid", placeItems: "center", fontSize: 22, fontWeight: 600, fontFamily: "var(--font-serif)" }}>
          {user.givenname[0]}{user.familyname[0]}
        </div>
        <div className="grow" style={{ minWidth: 0 }}>
          <div className="serif" style={{ fontSize: 22, fontWeight: 500 }}>{user.givenname} {user.familyname}</div>
          <div className="muted" style={{ fontSize: 13 }}>@{user.username}</div>
          <div className="row" style={{ gap: 4, marginTop: 4 }}>
            {user.roles.map(r => <span key={r} className="m-chip accent" style={{ textTransform: "capitalize" }}>{r}</span>)}
            <span className="m-chip">Joined {joined}</span>
          </div>
        </div>
      </div>

      {/* stats */}
      <div style={{ padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        <StatCell n={stats.assets} l="Assets"/>
        <StatCell n={stats.photos} l="Photos"/>
        <StatCell n={stats.docs} l="Docs"/>
        <StatCell n={fmtBytes(stats.bytes)} l="Storage"/>
      </div>

      {/* activity */}
      <div style={{ padding: "4px 16px 8px" }}>
        <div className="m-section-sub" style={{ padding: "6px 4px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>Recent uploads</div>
        <div className="m-card">
          {assets.slice(0, 4).map((a, i, arr) => (
            <button key={a.id} className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: i < arr.length - 1 ? "1px solid var(--color-line)" : "none" }} onClick={() => onNav("asset:" + a.id)}>
              <div className="m-thumb-sq" style={{ overflow: "hidden" }}>
                {a.thumb ? <img src={a.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--color-ink-3)" }}><Icon name="doc" size={16}/></div>}
              </div>
              <div className="grow" style={{ minWidth: 0 }}>
                <div className="truncate" style={{ fontSize: 14, fontWeight: 500 }}>{a.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{fmtDateRel(a.uploaded)} · {fmtBytes(a.size)}</div>
              </div>
              <Icon name="arrowR" size={14} className="chev"/>
            </button>
          ))}
        </div>
      </div>

      {/* actions */}
      <div style={{ padding: "8px 16px 24px" }}>
        <div className="m-card">
          <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => onNav("settings")}>
            <Icon name="settings" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Settings & appearance</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => onNav("settings#password")}>
            <Icon name="key" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Change password</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }} onClick={() => onNav("help")}>
            <Icon name="help" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Help & shortcuts</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
          <button className="m-row" style={{ width: "100%", textAlign: "left", color: "var(--color-error)" }} onClick={onLogout}>
            <Icon name="logout" size={18}/> <span className="t">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
}
function StatCell({ n, l }) {
  return (
    <div style={{ background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
      <div className="serif" style={{ fontSize: 18, fontWeight: 500, fontVariantNumeric: "tabular-nums" }}>{n}</div>
      <div className="muted" style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", marginTop: 2 }}>{l}</div>
    </div>
  );
}

// ─────────────────── SETTINGS ───────────────────
function MSettings({ onBack, theme, onTheme }) {
  const [notif, setNotif] = useSN(true);
  const [emails, setEmails] = useSN(false);
  const [textractDefault, setTextractDefault] = useSN(true);
  const [density, setDensity] = useSN("comfortable");
  return (
    <>
      <div className="m-topbar">
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
        <div className="grow" style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>Settings</div>
      </div>

      <div style={{ padding: "12px 16px 24px" }}>
        <SectionH>Appearance</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="m-row">
            <Icon name={theme === "dark" ? "moon" : "sun"} size={18} style={{ color: "var(--color-ink-3)" }}/>
            <span className="t">Theme</span>
            <div className="m-segs">
              <button className={"m-seg" + (theme === "light" ? " active" : "")} onClick={() => onTheme("light")}>Light</button>
              <button className={"m-seg" + (theme === "dark" ? " active" : "")} onClick={() => onTheme("dark")}>Dark</button>
            </div>
          </div>
          <div className="m-row" style={{ borderBottom: "none" }}>
            <Icon name="sliders" size={18} style={{ color: "var(--color-ink-3)" }}/>
            <span className="t">Density</span>
            <div className="m-segs">
              <button className={"m-seg" + (density === "compact" ? " active" : "")} onClick={() => setDensity("compact")}>Compact</button>
              <button className={"m-seg" + (density === "comfortable" ? " active" : "")} onClick={() => setDensity("comfortable")}>Comfortable</button>
            </div>
          </div>
        </div>

        <SectionH>Notifications</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="m-row">
            <Icon name="bell" size={18} style={{ color: "var(--color-ink-3)" }}/>
            <div className="grow">
              <div style={{ fontSize: 14 }}>Push notifications</div>
              <div className="muted" style={{ fontSize: 11 }}>Group chat, uploads, admin alerts</div>
            </div>
            <MToggle value={notif} onChange={setNotif}/>
          </div>
          <div className="m-row" style={{ borderBottom: "none" }}>
            <Icon name="globe" size={18} style={{ color: "var(--color-ink-3)" }}/>
            <div className="grow">
              <div style={{ fontSize: 14 }}>Email digests</div>
              <div className="muted" style={{ fontSize: 11 }}>Weekly summary every Monday</div>
            </div>
            <MToggle value={emails} onChange={setEmails}/>
          </div>
        </div>

        <SectionH>Uploads</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="m-row" style={{ borderBottom: "none" }}>
            <Icon name="sparkle" size={18} style={{ color: "var(--color-accent)" }}/>
            <div className="grow">
              <div style={{ fontSize: 14 }}>Run OCR by default</div>
              <div className="muted" style={{ fontSize: 11 }}>Textract on new documents</div>
            </div>
            <MToggle value={textractDefault} onChange={setTextractDefault}/>
          </div>
        </div>

        <SectionH>Security</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
            <Icon name="key" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Change password</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
          <button className="m-row" style={{ width: "100%", textAlign: "left" }}>
            <Icon name="sparkle" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Active sessions</span>
            <span className="m-chip" style={{ fontSize: 11 }}>2</span>
            <Icon name="arrowR" size={14} className="chev"/>
          </button>
          <button className="m-row" style={{ width: "100%", textAlign: "left", borderBottom: "none" }}>
            <Icon name="download" size={18} style={{ color: "var(--color-ink-3)" }}/> <span className="t">Export my data</span><Icon name="arrowR" size={14} className="chev"/>
          </button>
        </div>

        <SectionH>About</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <div className="m-row"><span className="t muted">Version</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>0.1.0-alpha</span></div>
          <div className="m-row"><span className="t muted">Region</span><span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>us-east-2</span></div>
          <div className="m-row" style={{ borderBottom: "none" }}><span className="t muted">Status</span><span className="m-chip success">All systems OK</span></div>
        </div>
      </div>
    </>
  );
}
function SectionH({ children }) {
  return <div className="m-section-sub" style={{ padding: "6px 4px 8px", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: 500 }}>{children}</div>;
}

// ─────────────────── ADMIN ───────────────────
function MAdmin({ onBack, users, assets }) {
  const [tab, setTab] = useSN("users");
  return (
    <>
      <div className="m-topbar">
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
        <div className="grow">
          <div style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>Admin console</div>
          <div className="muted" style={{ fontSize: 11 }}>Staff only · MBAi 460</div>
        </div>
        <span className="m-chip accent" style={{ height: 22, fontSize: 11 }}><Icon name="admin" size={11}/> staff</span>
      </div>

      <div style={{ padding: "12px 16px 4px" }}>
        <div className="m-segs" style={{ width: "100%", display: "flex" }}>
          <button className={"m-seg" + (tab === "users" ? " active" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => setTab("users")}>Users · {users.length}</button>
          <button className={"m-seg" + (tab === "assets" ? " active" : "")} style={{ flex: 1, justifyContent: "center" }} onClick={() => setTab("assets")}>Assets · {assets.length}</button>
        </div>
      </div>

      {tab === "users" ? (
        <div style={{ padding: "12px 16px 24px" }}>
          <div className="m-card">
            {users.map((u, i) => (
              <div key={u.id} className="m-row" style={{ borderBottom: i < users.length - 1 ? "1px solid var(--color-line)" : "none" }}>
                <div style={{ width: 36, height: 36, borderRadius: 18, background: "var(--color-paper-3)", color: "var(--color-ink-2)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>{u.given[0]}{u.family[0]}</div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }} className="truncate">{u.given} {u.family}</div>
                  <div className="muted truncate" style={{ fontSize: 11 }}>@{u.username} · {u.assets} assets · {u.last}</div>
                </div>
                <button className="icon-btn" aria-label="More"><Icon name="more" size={16}/></button>
              </div>
            ))}
          </div>
          <button className="m-btn m-btn-primary" style={{ marginTop: 14 }}><Icon name="plus" size={14}/> Invite user</button>
        </div>
      ) : (
        <div style={{ padding: "12px 16px 24px" }}>
          <div className="m-card">
            {assets.slice(0, 10).map((a, i, arr) => (
              <div key={a.id} className="m-row" style={{ borderBottom: i < arr.length - 1 ? "1px solid var(--color-line)" : "none" }}>
                <div className="m-thumb-sq" style={{ overflow: "hidden" }}>
                  {a.thumb ? <img src={a.thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}/> : <div style={{ display: "grid", placeItems: "center", height: "100%", color: "var(--color-ink-3)" }}><Icon name="doc" size={16}/></div>}
                </div>
                <div className="grow" style={{ minWidth: 0 }}>
                  <div className="truncate" style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</div>
                  <div className="muted" style={{ fontSize: 11 }}>#{a.id} · {fmtBytes(a.size)} · {fmtDateRel(a.uploaded)}</div>
                </div>
                <button className="icon-btn" aria-label="More"><Icon name="more" size={16}/></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────── HELP ───────────────────
function MHelp({ onBack }) {
  return (
    <>
      <div className="m-topbar">
        <button className="back-btn" onClick={onBack} aria-label="Back"><Icon name="arrowL" size={20}/></button>
        <div className="grow" style={{ fontFamily: "var(--font-serif)", fontSize: 17, fontWeight: 500 }}>Help</div>
      </div>
      <div style={{ padding: "16px" }}>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--color-line)" }}>
            <div className="row" style={{ gap: 8 }}>
              <Icon name="sparkle" size={16} style={{ color: "var(--color-accent)" }}/>
              <div className="serif" style={{ fontSize: 17, fontWeight: 500 }}>Getting started</div>
            </div>
            <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5 }}>
              MBAi 460 lets you capture, organize, and analyze photos and documents. Upload from camera or file picker; Rekognition labels your photos, Textract reads your documents.
            </div>
          </div>
          <button className="m-row"><Icon name="play" size={16} style={{ color: "var(--color-ink-3)" }}/><span className="t">Watch 2-min intro</span><Icon name="arrowR" size={14} className="chev"/></button>
        </div>

        <SectionH>Gestures</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <HelpRow ic="arrowL" k="Swipe right" v="Back in any screen"/>
          <HelpRow ic="arrowU" k="Pull down" v="Refresh Library"/>
          <HelpRow ic="eye"    k="Long-press asset" v="Quick actions"/>
          <HelpRow ic="search" k="Top-bar search" v="Jump to any asset or screen" last/>
        </div>

        <SectionH>Under the hood</SectionH>
        <div className="m-card" style={{ marginBottom: 16 }}>
          <HelpRow ic="database" k="Storage" v="Amazon S3 (us-east-2)"/>
          <HelpRow ic="image"    k="Photo labels" v="AWS Rekognition"/>
          <HelpRow ic="doc"      k="Document OCR" v="AWS Textract"/>
          <HelpRow ic="users"    k="Identity" v="photoapp users table" last/>
        </div>

        <SectionH>Contact</SectionH>
        <div className="m-card">
          <button className="m-row"><Icon name="chat" size={18} style={{ color: "var(--color-ink-3)" }}/><span className="t">Ask in group chat</span><Icon name="arrowR" size={14} className="chev"/></button>
          <button className="m-row" style={{ borderBottom: "none" }}><Icon name="globe" size={18} style={{ color: "var(--color-ink-3)" }}/><span className="t">Course site</span><Icon name="arrowR" size={14} className="chev"/></button>
        </div>
      </div>
    </>
  );
}
function HelpRow({ ic, k, v, last }) {
  return (
    <div className="m-row" style={{ borderBottom: last ? "none" : "1px solid var(--color-line)" }}>
      <Icon name={ic} size={16} style={{ color: "var(--color-ink-3)" }}/>
      <div className="grow">
        <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
        <div className="muted" style={{ fontSize: 12 }}>{v}</div>
      </div>
    </div>
  );
}

// ─────────────────── AUTH ───────────────────
function MAuth({ mode, onLogin, onSwitchMode }) {
  const [u, setU] = useSN("pooja");
  const [p, setP] = useSN("••••••••");
  const [showPw, setShowPw] = useSN(false);
  const [err, setErr] = useSN(null);
  const [busy, setBusy] = useSN(false);

  const submit = (e) => {
    e.preventDefault(); setErr(null);
    if (!u || !p) return;
    setBusy(true);
    setTimeout(() => {
      if (p === "wrong") { setErr("Incorrect username or password."); setBusy(false); return; }
      setBusy(false); onLogin();
    }, 500);
  };

  return (
    <div style={{ padding: "40px 20px 20px", display: "flex", flexDirection: "column", height: "100%", background: "var(--color-paper)" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", backgroundImage: "radial-gradient(var(--color-paper-3) 1px, transparent 1px)", backgroundSize: "22px 22px", opacity: 0.5, maskImage: "radial-gradient(ellipse 70% 55% at 50% 40%, #000, transparent)" }}/>

      <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: 9, background: "var(--color-accent)", color: "var(--color-accent-fg)", display: "grid", placeItems: "center", fontFamily: "var(--font-serif)", fontSize: 20, fontWeight: 600 }}>M</span>
          <span className="serif" style={{ fontSize: 28, fontWeight: 500 }}>MBAi 460</span>
        </div>
        <div className="muted" style={{ fontSize: 12 }}>Cloud PhotoApp · Spring 2026</div>
      </div>

      <form onSubmit={submit} className="fade-in" style={{ position: "relative", padding: "24px 20px", background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: 16 }}>
        <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, marginBottom: 18 }}>{mode === "register" ? "Create account" : "Sign in"}</h1>
        {err && <div style={{ marginBottom: 14, padding: "8px 12px", fontSize: 12, background: "rgba(184,69,69,0.08)", color: "var(--color-error)", borderRadius: 8, border: "1px solid rgba(184,69,69,0.2)" }}>{err}</div>}

        {mode === "register" && (
          <>
            <label className="label">Full name</label>
            <input className="m-input" placeholder="Jane Doe" style={{ marginBottom: 14 }}/>
          </>
        )}
        <label className="label">Username</label>
        <input className="m-input" value={u} onChange={e => setU(e.target.value)} autoCapitalize="none" autoCorrect="off" style={{ marginBottom: 14 }}/>
        <label className="label">Password</label>
        <div style={{ position: "relative", marginBottom: 16 }}>
          <input className="m-input" type={showPw ? "text" : "password"} value={p} onChange={e => setP(e.target.value)} style={{ paddingRight: 44 }}/>
          <button type="button" onClick={() => setShowPw(s => !s)} className="icon-btn" style={{ position: "absolute", right: 4, top: 4, height: 36, width: 36 }} aria-label="Toggle">
            <Icon name={showPw ? "eyeOff" : "eye"} size={16}/>
          </button>
        </div>
        <button type="submit" disabled={busy} className="m-btn m-btn-primary">{busy ? "Signing in…" : mode === "register" ? "Create account" : "Sign in"}</button>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13 }} className="muted">
          {mode === "login" ? (
            <>New here? <button type="button" onClick={() => onSwitchMode("register")} style={{ color: "var(--color-accent)", fontWeight: 500 }}>Create account</button></>
          ) : (
            <>Already have an account? <button type="button" onClick={() => onSwitchMode("login")} style={{ color: "var(--color-accent)", fontWeight: 500 }}>Sign in</button></>
          )}
        </div>
      </form>

      <div className="muted" style={{ fontSize: 11, textAlign: "center", marginTop: "auto", paddingTop: 20 }}>By continuing, you agree to the MBAi 460 course use agreement.</div>
    </div>
  );
}

Object.assign(window, { MChat, MProfile, MSettings, MAdmin, MHelp, MAuth });
