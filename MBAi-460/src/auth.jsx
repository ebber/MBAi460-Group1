// Login + Register screens
const { useState: useStateA, useEffect: useEffectA } = React;

function LoginScreen({ onLogin, onNav, onOpenForgot }) {
  const [u, setU] = useStateA("pooja");
  const [p, setP] = useStateA("••••••••");
  const [dur, setDur] = useStateA("");
  const [showPw, setShowPw] = useStateA(false);
  const [busy, setBusy] = useStateA(false);
  const [err, setErr] = useStateA(null);

  const submit = (e) => {
    e?.preventDefault();
    setErr(null);
    if (!u || !p) return;
    setBusy(true);
    setTimeout(() => {
      if (p === "wrong") { setBusy(false); setErr("Incorrect username or password."); return; }
      setBusy(false);
      onLogin();
    }, 700);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--color-paper)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px", position: "relative",
    }}>
      {/* soft texture dots */}
      <div aria-hidden style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(var(--color-paper-3) 1px, transparent 1px)",
        backgroundSize: "24px 24px", opacity: 0.5, maskImage: "radial-gradient(ellipse 80% 60% at 50% 50%, #000, transparent)",
      }}/>
      <div style={{ textAlign: "center", marginBottom: 28, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 10 }}>
          <span style={{
            width: 40, height: 40, borderRadius: 9, background: "var(--color-accent)",
            display: "grid", placeItems: "center", color: "var(--color-accent-fg)",
            fontFamily: "var(--font-serif)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em",
          }}>M</span>
          <span className="serif" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em" }}>MBAi 460</span>
        </div>
        <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>Cloud PhotoApp · Spring 2026</div>
      </div>

      <form onSubmit={submit} className="fade-in" style={{
        width: "100%", maxWidth: 400, padding: "28px 28px 24px",
        background: "var(--color-paper-2)", border: "1px solid var(--color-line)",
        borderRadius: "var(--r-lg)", boxShadow: "var(--shadow-1)",
        position: "relative",
      }}>
        <h1 style={{ margin: 0, fontSize: "var(--fs-lg)", fontWeight: 500, marginBottom: 20 }}>Sign in</h1>

        {err && (
          <div className="fade-in" style={{
            marginBottom: 14, padding: "8px 12px", fontSize: "var(--fs-xs)",
            background: "rgba(184, 69, 69, 0.08)", color: "var(--color-error)",
            borderRadius: "var(--r-sm)", border: "1px solid rgba(184, 69, 69, 0.2)",
            display: "flex", alignItems: "center", gap: 8,
          }}><Icon name="alert" size={13}/> {err}</div>
        )}

        <div style={{ marginBottom: 14 }}>
          <label className="label">Username</label>
          <input className="input" autoFocus autoComplete="username" value={u} onChange={(e) => setU(e.target.value)}/>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Password</span>
            <button type="button" onClick={onOpenForgot} style={{ fontSize: "var(--fs-xs)", color: "var(--color-ink-3)" }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent)"} onMouseLeave={e => e.currentTarget.style.color = ""}>Forgot?</button>
          </label>
          <div style={{ position: "relative" }}>
            <input className="input" type={showPw ? "text" : "password"} autoComplete="current-password"
              style={{ paddingRight: 38 }}
              value={p} onChange={(e) => setP(e.target.value)}/>
            <button type="button" onClick={() => setShowPw((x) => !x)}
              style={{ position: "absolute", right: 10, top: 10, color: "var(--color-ink-3)" }}
              aria-label={showPw ? "Hide password" : "Show password"}>
              <Icon name={showPw ? "eyeOff" : "eye"} size={15}/>
            </button>
          </div>
        </div>

        <details style={{ marginBottom: 18 }}>
          <summary style={{ fontSize: "var(--fs-xs)", color: "var(--color-ink-3)", cursor: "pointer", listStyle: "none", userSelect: "none" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><Icon name="arrowD" size={10}/> Advanced</span>
          </summary>
          <div style={{ marginTop: 10 }}>
            <label className="label">Session length (min)</label>
            <input className="input" type="number" min={1} max={1440} placeholder="Server default" value={dur} onChange={(e) => setDur(e.target.value)}/>
            <div className="helper">1–1440. Blank uses the server default.</div>
          </div>
        </details>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={busy || !u || !p}>
          {busy ? <><span className="skel" style={{ width: 14, height: 14, borderRadius: 7 }}/> Signing in…</> : "Sign in"}
        </button>

        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--color-line)", fontSize: "var(--fs-sm)", textAlign: "center" }}>
          <span className="muted">New here? </span>
          <button type="button" onClick={() => onNav("/register")} style={{ color: "var(--color-accent)", fontWeight: 500 }}>Create an account →</button>
        </div>
      </form>

      <div className="row" style={{ gap: 14, marginTop: 20, fontSize: 11, color: "var(--color-ink-3)" }}>
        <span>v0.1</span><span>·</span><span>Status</span><span>·</span>
        <button onClick={() => onNav("/help")} style={{ fontSize: 11, color: "inherit" }}>Help</button>
      </div>
    </div>
  );
}

function RegisterScreen({ onLogin, onNav }) {
  const [f, setF] = useStateA({ u: "", p: "", cp: "", g: "", fam: "" });
  const set = (k, v) => setF((x) => ({ ...x, [k]: v }));
  const pwChecks = {
    len:   f.p.length >= 8,
    digit: /\d/.test(f.p),
    sym:   /[^\w\s]/.test(f.p),
  };
  const canSubmit = pwChecks.len && pwChecks.digit && pwChecks.sym && f.u && f.g && f.p === f.cp;
  const [busy, setBusy] = useStateA(false);

  const submit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setBusy(true);
    setTimeout(() => onLogin(), 900);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-paper)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div className="row" style={{ gap: 12, justifyContent: "center", marginBottom: 8 }}>
          <span style={{ width: 36, height: 36, borderRadius: 8, background: "var(--color-accent)", display: "grid", placeItems: "center", color: "var(--color-accent-fg)", fontFamily: "var(--font-serif)", fontSize: 19, fontWeight: 600 }}>M</span>
          <span className="serif" style={{ fontSize: 30, fontWeight: 500 }}>MBAi 460</span>
        </div>
        <div className="muted" style={{ fontSize: "var(--fs-sm)" }}>Create your account</div>
      </div>

      <form onSubmit={submit} className="fade-in" style={{ width: "100%", maxWidth: 440, padding: "26px 28px", background: "var(--color-paper-2)", border: "1px solid var(--color-line)", borderRadius: "var(--r-lg)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
          <div><label className="label">Given name</label><input className="input" value={f.g} onChange={e => set("g", e.target.value)}/></div>
          <div><label className="label">Family name</label><input className="input" value={f.fam} onChange={e => set("fam", e.target.value)}/></div>
        </div>
        <div style={{ marginBottom: 14 }}>
          <label className="label">Username</label>
          <input className="input" autoComplete="username" value={f.u} onChange={e => set("u", e.target.value)}/>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="label">Password</label>
          <input className="input" type="password" value={f.p} onChange={e => set("p", e.target.value)}/>
          <div className="row" style={{ gap: 12, marginTop: 6, fontSize: 11, color: "var(--color-ink-3)" }}>
            {[["len", "8+ chars"], ["digit", "a digit"], ["sym", "a symbol"]].map(([k, l]) => (
              <span key={k} className="row" style={{ gap: 4, color: pwChecks[k] ? "var(--color-success)" : "var(--color-ink-3)" }}>
                <Icon name={pwChecks[k] ? "check" : "close"} size={11}/> {l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label className="label">Confirm password</label>
          <input className="input" type="password" value={f.cp} onChange={e => set("cp", e.target.value)}/>
          {f.cp && f.p !== f.cp && <div className="helper" style={{ color: "var(--color-error)" }}>Passwords don't match.</div>}
        </div>

        <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }} disabled={!canSubmit || busy}>
          {busy ? "Creating…" : "Create account"}
        </button>
        <div style={{ textAlign: "center", marginTop: 14, fontSize: "var(--fs-sm)" }}>
          <span className="muted">Already have one? </span>
          <button type="button" onClick={() => onNav("/login")} style={{ color: "var(--color-accent)" }}>Sign in →</button>
        </div>
      </form>
    </div>
  );
}

window.LoginScreen = LoginScreen;
window.RegisterScreen = RegisterScreen;
