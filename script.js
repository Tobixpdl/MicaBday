// Configuration -------------------------------------------------------------
const EVENT = {
  name: "Micaela",
  title: "Cumpleaños de Micaela",
  date: "2026-10-01",
  time: "18:00",
  location: "Coronel Vilela 544",
  web3FormsAccessKey: "319bb023-ab5c-4f41-93e0-f84b6bbe9831"
};

const $ = (selector) => document.querySelector(selector);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const motionEnabled = !reducedMotion.matches && typeof gsap !== "undefined";
const eventDateLabel = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${EVENT.date}T12:00:00Z`));
const scene = $(".scene");
const planetOrbit = $(".planet-orbit");
const canvas = $("#starfield");
const context = canvas.getContext("2d", { alpha: true });
const parallaxLayers = [...document.querySelectorAll(".parallax-layer")];
const acceptButton = $("#accept-button");
const acceptLabel = $("#accept-label");
const calendarButton = $("#calendar-button");
const statusMessage = $("#status-message");
const modal = $("#name-modal");
const modalClose = $("#modal-close");
const nameForm = $("#name-form");
const guestInput = $("#guest-input");
const confirmButton = $("#confirm-button");
const dialogError = $("#dialog-error");
const storedNameKey = "micaela-rsvp-last-guest";
const urlGuest = new URLSearchParams(location.search).get("guest")?.trim().slice(0, 80) || "";
let guestName = urlGuest;
let isSubmitting = false;
let isAnimatingAcceptance = false;
let isCtaAnimating = false;

// Starfield and pointer depth -----------------------------------------------
const pointer = { targetX: 0, targetY: 0, x: 0, y: 0 };
const starfield = { width: 0, height: 0, stars: [], shooting: null, nextShooting: 0, lastFrame: 0 };

function resizeStarfield() {
  const width = innerWidth;
  const height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  starfield.width = width;
  starfield.height = height;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(250, Math.max(96, Math.round(width * height / 5000)));
  starfield.stars = Array.from({ length: count }, (_, index) => {
    const band = index % 3;
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      depth: [.15, .35, .6][band],
      speedX: (Math.random() - .5) * [.8, 1.9, 3.6][band],
      speedY: (Math.random() - .5) * [.28, .62, 1.15][band],
      radius: band === 0 ? .55 + Math.random() * .55 : band === 1 ? .8 + Math.random() * .8 : 1.05 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      frequency: .65 + Math.random() * 1.5,
      warmth: Math.random() > .84,
      flare: band === 2 && Math.random() > .82
    };
  });
}

function drawStarfield(time) {
  const { width, height, stars } = starfield;
  context.clearRect(0, 0, width, height);
  for (const star of stars) {
    const x = ((star.x + time * star.speedX + pointer.x * star.depth * 25) % (width + 8) + width + 8) % (width + 8);
    const y = ((star.y + time * star.speedY + pointer.y * star.depth * 18) % (height + 8) + height + 8) % (height + 8);
    const pulse = Math.sin(time * star.frequency + star.phase);
    const shimmer = reducedMotion.matches ? 1 : star.flare ? .38 + Math.max(0, pulse) ** 3 * .62 : .28 + (pulse + 1) * .36;
    context.globalAlpha = shimmer * (star.depth === .15 ? .68 : star.depth === .35 ? .84 : 1);
    context.fillStyle = star.warmth ? "#f5dfb4" : "#dce7ee";
    context.beginPath();
    context.arc(x, y, star.radius, 0, Math.PI * 2);
    context.fill();
    if (star.flare && pulse > .72) {
      const flare = (pulse - .72) / .28;
      context.globalAlpha = flare * .65;
      context.fillRect(x - star.radius * 2.7, y - .45, star.radius * 5.4, .9);
      context.fillRect(x - .45, y - star.radius * 2.7, .9, star.radius * 5.4);
    }
  }
  context.globalAlpha = 1;

  if (reducedMotion.matches) return;
  if (time > starfield.nextShooting && !starfield.shooting) {
    starfield.shooting = { start: time, x: width * (.22 + Math.random() * .62), y: height * (.13 + Math.random() * .28) };
    starfield.nextShooting = time + 5.5 + Math.random() * 5.5;
  }
  if (starfield.shooting) {
    const life = (time - starfield.shooting.start) / .65;
    if (life >= 1) starfield.shooting = null;
    else {
      const x = starfield.shooting.x - life * 112;
      const y = starfield.shooting.y + life * 58;
      const gradient = context.createLinearGradient(x + 91, y - 47, x, y);
      gradient.addColorStop(0, "rgba(235,231,204,0)");
      gradient.addColorStop(1, `rgba(246,239,214,${Math.sin(life * Math.PI) * .8})`);
      context.strokeStyle = gradient;
      context.lineWidth = 1.4;
      context.beginPath();
      context.moveTo(x + 91, y - 47);
      context.lineTo(x, y);
      context.stroke();
    }
  }
}

function animationFrame(timestamp) {
  requestAnimationFrame(animationFrame);
  if (document.hidden || !context || timestamp - starfield.lastFrame < 16) return;
  starfield.lastFrame = timestamp;
  if (!reducedMotion.matches) {
    pointer.x += (pointer.targetX - pointer.x) * .06;
    pointer.y += (pointer.targetY - pointer.y) * .06;
    for (const layer of parallaxLayers) {
      const depth = Number(layer.dataset.depth);
      layer.style.transform = `translate3d(${(pointer.x * depth * 28).toFixed(2)}px, ${(pointer.y * depth * 24).toFixed(2)}px, 0)`;
    }
    const seconds = timestamp / 1000;
    const orbitX = Math.cos(seconds * .19) * Math.max(8, innerWidth * .016);
    const orbitY = Math.sin(seconds * .19) * Math.max(5, innerHeight * .012);
    planetOrbit.style.transform = `translate3d(${orbitX.toFixed(2)}px, ${orbitY.toFixed(2)}px, 0)`;
  }
  drawStarfield(timestamp / 1000);
}

function initStarfieldAndParallax() {
  if (!context) return;
  resizeStarfield();
  addEventListener("resize", () => { resizeStarfield(); if (reducedMotion.matches) drawStarfield(0); }, { passive: true });
  if (reducedMotion.matches) { drawStarfield(0); return; }
  if (!reducedMotion.matches) {
    document.addEventListener("pointermove", (event) => {
      pointer.targetX = Math.max(-1, Math.min(1, event.clientX / innerWidth * 2 - 1));
      pointer.targetY = Math.max(-1, Math.min(1, event.clientY / innerHeight * 2 - 1));
    }, { passive: true });
    document.addEventListener("pointerleave", () => { pointer.targetX = 0; pointer.targetY = 0; });
  }
  requestAnimationFrame(animationFrame);
}

// Intro and ship ------------------------------------------------------------
let shipTimeline;

function initSpaceship() {
  if (!motionEnabled) return;
  const ship = $("#ship-flight");
  const width = scene.clientWidth;
  const height = scene.clientHeight;
  shipTimeline?.kill();
  shipTimeline = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 6.2 });
  shipTimeline
    .fromTo(ship, { x: width + 58, y: -height * .3, scale: .42, opacity: 0, filter: "blur(3px)" }, { x: width * .7, y: -height * .12, scale: .58, opacity: .55, filter: "blur(0px)", duration: 1.25, ease: "power2.out" })
    .to(ship, { x: width * .34, y: height * .18, scale: .76, opacity: .62, duration: 1.7, ease: "sine.inOut" })
    .to(ship, { x: -width * .23 - 100, y: height * .69, scale: .55, opacity: 0, filter: "blur(2.5px)", duration: 1.65, ease: "power2.in" });
  shipTimeline.play();
}

function playIntro() {
  if (!motionEnabled) { document.documentElement.classList.remove("js-pending"); return; }
  gsap.ticker.lagSmoothing(0);
  const planet = $("#planet");
  const rect = planet.getBoundingClientRect();
  const startScale = Math.max(innerWidth, innerHeight) / Math.max(rect.width, 1) * 1.65;
  const startX = innerWidth / 2 - (rect.left + rect.width / 2);
  const startY = innerHeight / 2 - (rect.top + rect.height / 2);
  document.documentElement.classList.add("intro-active");
  gsap.set([".hero", ".details", ".response-area"], { opacity: 0, y: 17 });
  gsap.set([".grogu", ".anzellan"], { opacity: 0, y: 30, scale: .97 });
  gsap.set(".bad-baby", { opacity: 0, y: 9 });
  gsap.set(canvas, { opacity: 0 });
  gsap.set(planet, { x: startX, y: startY, scale: startScale, opacity: 1 });
  document.documentElement.classList.remove("js-pending");
  gsap.timeline({ onComplete: () => { document.documentElement.classList.remove("intro-active"); initSpaceship(); } })
    .to(planet, { x: 0, y: 0, scale: 1, opacity: .77, duration: 1.35, ease: "power3.inOut" }, 0)
    .to(canvas, { opacity: .84, duration: 1.1, ease: "power1.out" }, .38)
    .to(".grogu", { opacity: 1, y: 0, scale: 1, duration: .57, ease: "power2.out" }, .92)
    .to(".anzellan", { opacity: 1, y: 0, scale: 1, duration: .5, ease: "power2.out" }, 1.19)
    .to(".hero", { opacity: 1, y: 0, duration: .56, ease: "power2.out" }, 1.27)
    .to(".bad-baby", { opacity: 1, y: 0, duration: .36, ease: "power2.out" }, 1.42)
    .to(".details", { opacity: 1, y: 0, duration: .48, ease: "power2.out" }, 1.55)
    .to(".response-area", { opacity: 1, y: 0, duration: .42, ease: "power2.out" }, 1.88);
}

// RSVP and envelope ---------------------------------------------------------
function storageKey(name) { return `micaela-rsvp-2026:${name.trim().toLocaleLowerCase("es-AR")}`; }
function wasAccepted(name) { try { return localStorage.getItem(storageKey(name)) === "accepted"; } catch { return false; } }
function rememberAcceptance(name) {
  try { localStorage.setItem(storageKey(name), "accepted"); localStorage.setItem(storedNameKey, name); }
  catch { /* Storage may be unavailable in private browsing. */ }
}
function setMessage(message, success = false) {
  statusMessage.textContent = message;
  statusMessage.classList.toggle("success", success);
}
function showAccepted(name) {
  guestName = name;
  closeModal();
  acceptButton.disabled = true;
  acceptButton.classList.add("accepted");
  acceptLabel.textContent = "INVITACIÓN ACEPTADA";
  $(".button-spark").textContent = "✓";
  $(".button-arrow").hidden = true;
  calendarButton.hidden = false;
  setMessage(`¡Gracias, ${name}! Nos vemos el ${eventDateLabel.replace(/ de \d{4}$/, "")}.`, true);
}
function openModal() { dialogError.textContent = ""; modal.hidden = false; guestInput.focus(); }
function closeModal() {
  modal.hidden = true;
  if (document.activeElement && modal.contains(document.activeElement)) acceptButton.focus();
}

function igniteCta(onComplete) {
  if (!motionEnabled) { onComplete(); return; }
  isCtaAnimating = true;
  acceptButton.classList.add("igniting");
  const energy = $(".saber-energy");
  const sweep = $(".button-sweep");
  const sweepDistance = Math.max(0, acceptButton.clientWidth - 28);
  acceptButton.style.setProperty("--sweep-distance", `${sweepDistance}px`);
  gsap.killTweensOf([energy, sweep]);
  gsap.timeline({ onComplete: () => {
    gsap.set([energy, sweep], { clearProps: "transform,opacity,transformOrigin" });
    acceptButton.classList.remove("igniting");
    isCtaAnimating = false;
    onComplete();
  } })
    .fromTo(energy, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: .17, ease: "power2.out" }, 0)
    .to(energy, { opacity: .9, duration: .24 }, .17)
    .to(energy, { scaleX: 0, opacity: 0, transformOrigin: "right center", duration: .1, ease: "power2.in" }, .41)
    .fromTo(sweep, { x: 0 }, { x: sweepDistance, duration: .5, ease: "none" }, 0)
    .to(sweep, { opacity: .96, duration: .08 }, .04)
    .to(sweep, { opacity: 0, duration: .16 }, .31);
}

function playEnvelopeAnimation(name) {
  closeModal();
  if (!motionEnabled) { showAccepted(name); return; }
  isAnimatingAcceptance = true;
  const envelope = $("#envelope-flight");
  const letter = $(".letter-card");
  const shell = $(".envelope-shell");
  const flap = $(".envelope-flap");
  const seal = $(".envelope-seal");
  const trail = $(".envelope-trail");
  gsap.set(envelope, { x: 0, y: 0, scale: .8, rotation: 0, autoAlpha: 0 });
  gsap.set(letter, { y: 0, scale: 1, opacity: 1 });
  gsap.set(shell, { opacity: 0 });
  gsap.set(flap, { rotationX: -175 });
  gsap.set(seal, { scale: .2, opacity: 0 });
  gsap.set(trail, { opacity: 0, scaleX: .3 });
  gsap.timeline({ onComplete: () => { isAnimatingAcceptance = false; showAccepted(name); gsap.to(".response-area", { opacity: 1, duration: .28 }); } })
    .to(".response-area", { opacity: .12, duration: .18 }, 0)
    .to(envelope, { autoAlpha: 1, scale: 1, duration: .22, ease: "back.out(1.7)" }, .07)
    .to(shell, { opacity: 1, duration: .2 }, .29)
    .to(letter, { y: 29, scale: .78, opacity: 0, duration: .3, ease: "power2.in" }, .3)
    .to(flap, { rotationX: 0, duration: .29, ease: "power2.inOut" }, .57)
    .to(seal, { scale: 1, opacity: 1, duration: .18, ease: "back.out(2)" }, .83)
    .to(trail, { opacity: .8, scaleX: 1, duration: .18 }, 1.02)
    .to(envelope, { x: innerWidth * .43, y: -innerHeight * .47, scale: .08, rotation: -19, opacity: 0, duration: .66, ease: "power3.in" }, 1.04)
    .to(trail, { opacity: 0, duration: .3 }, 1.35);
}

async function submitRsvp(name) {
  if (isSubmitting || isAnimatingAcceptance) return;
  if (wasAccepted(name)) { showAccepted(name); return; }
  if (!EVENT.web3FormsAccessKey || EVENT.web3FormsAccessKey === "REEMPLAZAR_ACCESS_KEY") {
    closeModal();
    setMessage("La confirmación aún no está disponible. Intentá más tarde.");
    return;
  }
  isSubmitting = true;
  acceptButton.disabled = true;
  acceptButton.classList.add("loading");
  confirmButton.disabled = true;
  acceptLabel.textContent = "ENVIANDO…";
  setMessage("");
  dialogError.textContent = "";
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key: EVENT.web3FormsAccessKey,
        subject: `Nueva confirmación para Micaela | ${name}`,
        from_name: "Misión de Micaela | Confirmaciones",
        nombre: name,
        respuesta: "Aceptó la invitación",
        evento: EVENT.title,
        fecha: eventDateLabel,
        hora: EVENT.time,
        lugar: EVENT.location,
        timestamp: new Date().toISOString()
      })
    });
    const result = await response.json();
    if (!response.ok || result.success !== true) throw new Error("RSVP failed");
    rememberAcceptance(name);
    playEnvelopeAnimation(name);
  } catch {
    closeModal();
    setMessage("No se pudo enviar. Tocá para reintentar.");
    acceptButton.disabled = false;
    acceptLabel.textContent = "REINTENTAR ENVÍO";
  } finally {
    isSubmitting = false;
    acceptButton.classList.remove("loading");
    confirmButton.disabled = false;
  }
}

function initRSVP() {
  acceptButton.addEventListener("click", () => {
    if (isSubmitting || isAnimatingAcceptance || isCtaAnimating) return;
    igniteCta(() => {
      if (guestName) submitRsvp(guestName);
      else openModal();
    });
  });
  nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = guestInput.value.trim().replace(/\s+/g, " ").slice(0, 80);
    if (!name) { dialogError.textContent = "Escribí tu nombre para confirmar."; guestInput.focus(); return; }
    guestName = name;
    submitRsvp(name);
  });
  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", (event) => {
    if (modal.hidden) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "Tab") {
      const items = [modalClose, guestInput, confirmButton];
      if (event.shiftKey && document.activeElement === items[0]) { event.preventDefault(); items.at(-1).focus(); }
      else if (!event.shiftKey && document.activeElement === items.at(-1)) { event.preventDefault(); items[0].focus(); }
    }
  });
  if (!guestName) { try { guestName = localStorage.getItem(storedNameKey) || ""; } catch { /* Storage is optional. */ } }
  if (guestName && wasAccepted(guestName)) showAccepted(guestName);
}

// Calendar ------------------------------------------------------------------
function escapeIcs(value) { return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }
function initCalendar() {
  calendarButton.addEventListener("click", () => {
    const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const start = new Date(`${EVENT.date}T${EVENT.time}:00-03:00`).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Micaela//Invitacion//ES", "BEGIN:VEVENT", "UID:micaela-cumple-20261001@invitacion.local", `DTSTAMP:${stamp}`, `DTSTART:${start}`, `SUMMARY:${escapeIcs(EVENT.title)}`, `LOCATION:${escapeIcs(EVENT.location)}`, "END:VEVENT", "END:VCALENDAR"];
    const blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cumpleanos-micaela-2026.ics";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

initStarfieldAndParallax();
initRSVP();
initCalendar();
playIntro();
