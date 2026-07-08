/* SIGA FMAT — Prototipo. Interactividad mínima del mockup (sin backend). */

/* ---------- Toast ---------- */
function toast(msg, audit) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.body.appendChild(t);
  }
  t.innerHTML =
    '<span class="t-ok">✓</span><span>' + msg + "</span>" +
    (audit ? '<span class="t-audit">· registrado en auditoría (' + audit + ")</span>" : "");
  t.classList.add("show");
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove("show"), 3600);
}

/* ---------- Modales ---------- */
function openModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.add("open");
}
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove("open");
}
document.addEventListener("click", (e) => {
  if (e.target.classList && e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("open");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape")
    document.querySelectorAll(".modal-backdrop.open").forEach((m) => m.classList.remove("open"));
});

/* ---------- Tabs ---------- */
document.addEventListener("click", (e) => {
  const tab = e.target.closest(".tab");
  if (!tab || !tab.dataset.pane) return;
  const bar = tab.closest(".tabbar");
  bar.querySelectorAll(".tab").forEach((t) => t.classList.remove("on"));
  tab.classList.add("on");
  const scope = bar.parentElement;
  scope.querySelectorAll(":scope > .tabpane").forEach((p) => p.classList.remove("on"));
  const pane = document.getElementById(tab.dataset.pane);
  if (pane) pane.classList.add("on");
});

/* ---------- Filtros de tabla (chips con data-filter sobre filas con data-estado) ---------- */
document.addEventListener("click", (e) => {
  const chip = e.target.closest(".filter-chip[data-filter]");
  if (!chip) return;
  chip.closest(".filters").querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("on"));
  chip.classList.add("on");
  const f = chip.dataset.filter;
  let visibles = 0;
  document.querySelectorAll("tr[data-estado]").forEach((row) => {
    const show = f === "todos" || row.dataset.estado === f;
    row.style.display = show ? "" : "none";
    if (show) visibles++;
  });
  const empty = document.getElementById("pagos-vacio");
  if (empty) empty.style.display = visibles ? "none" : "block";
});

/* ---------- Revelar PII (con aviso de auditoría) ---------- */
function revealPII(btn, value, field) {
  const holder = btn.previousElementSibling;
  if (btn.dataset.shown === "1") {
    holder.textContent = holder.dataset.mask;
    btn.textContent = "Revelar";
    btn.dataset.shown = "0";
    return;
  }
  holder.dataset.mask = holder.textContent;
  holder.textContent = value;
  holder.style.letterSpacing = "0.5px";
  btn.textContent = "Ocultar";
  btn.dataset.shown = "1";
  toast("Acceso a dato sensible: " + field, "SENSITIVE_DATA_ACCESS · Landy Canul");
}

/* ---------- Acciones simuladas ---------- */
function mockAction(msg, audit) {
  toast(msg, audit || "source: WEB · Landy Canul");
}

function sendProposal(card) {
  const p = card.closest(".proposal");
  p.style.opacity = ".55";
  p.querySelector(".proposal-actions").innerHTML =
    '<span class="chip ok"><span class="dot"></span> ENVIADO</span>' +
    '<span class="note">Confirmado por Landy Canul · source: WEB (propuesta de AI_AGENT)</span>';
  toast("Correo enviado a jorge.pech@correo.uady.mx", "source: WEB · propuesta AI_AGENT confirmada");
}

function discardProposal(card) {
  const p = card.closest(".proposal");
  p.style.opacity = ".45";
  p.querySelector(".proposal-actions").innerHTML =
    '<span class="chip neutral"><span class="dot"></span> DESCARTADA</span>' +
    '<span class="note">La propuesta no se ejecutó · nada salió del sistema</span>';
  toast("Propuesta descartada — no se envió nada");
}

/* ---------- Chat simulado ---------- */
function chatDemo(input) {
  const val = input.value.trim();
  if (!val) return;
  const scroll = document.querySelector(".chat-scroll");
  const u = document.createElement("div");
  u.className = "msg user";
  u.innerHTML = '<div class="msg-bubble">' + val.replace(/</g, "&lt;") + "</div>" +
    '<div class="msg-meta">Landy Canul · ahora</div>';
  scroll.appendChild(u);
  input.value = "";
  setTimeout(() => {
    const b = document.createElement("div");
    b.className = "msg bot";
    b.innerHTML =
      '<div class="msg-bubble">Esta es una respuesta simulada del prototipo. En el sistema real consultaría los datos con <b>tus permisos</b> y respondería con información verificable — y si no encuentro el dato, te lo diré en lugar de inventarlo.</div>' +
      '<div class="msg-meta"><span class="src ai">AI_AGENT</span> consulta de lectura · permisos: SECRETARIA</div>';
    scroll.appendChild(b);
    scroll.scrollTop = scroll.scrollHeight;
  }, 700);
  scroll.scrollTop = scroll.scrollHeight;
}

/* Enter en el input del chat */
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target.matches(".chat-input input")) chatDemo(e.target);
});
