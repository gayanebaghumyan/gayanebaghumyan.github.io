(() => {
  const pageName = document.body.dataset.analyticsPage;
  const pageTitle = pageName === "cv" ? "CV" : "Home";
  const library = document.querySelector("script[data-goatcounter]");
  if (!pageName || !library) return;

  const preference = new URLSearchParams(location.search).get("analytics");
  try {
    if (preference === "off") localStorage.setItem("skipgc", "t");
    if (preference === "on") localStorage.removeItem("skipgc");
  } catch {
    // The URL still excludes this page if browser storage is unavailable.
  }

  function excluded() {
    if (preference === "off" || navigator.webdriver ||
        location.hostname !== "gayanebaghumyan.github.io") return true;
    try {
      return localStorage.getItem("skipgc") === "t";
    } catch {
      return false;
    }
  }
  if (excluded()) return;

  const pending = [];
  function flush() {
    if (excluded()) { pending.length = 0; return; }
    if (typeof window.goatcounter?.count !== "function") return;
    while (pending.length) {
      try { window.goatcounter.count(pending.shift()); } catch {
        // Analytics must never interrupt navigation or the theme button.
      }
    }
  }
  function record(path, title, everyClick = false) {
    if (excluded()) return;
    if (pending.length < 40) pending.push({
      path, title, event: true, no_session: everyClick, referrer: ""
    });
    flush();
  }

  // Keep the existing site-wide visitor series. All extra rows are events.
  let started = false;
  function startVisit() {
    if (started || document.visibilityState !== "visible") return;
    started = true;
    pending.unshift({ path: "/site-visit", title: "Site visitor", event: false });
    record(`page-${pageName}`, `Page · ${pageTitle}`);
  }
  library.addEventListener("load", flush);
  startVisit();

  function trackClick(event) {
    if (event.type === "auxclick" && event.button !== 1) return;
    const element = event.target.closest?.("[data-analytics-click]");
    if (!element) return;
    record(element.dataset.analyticsClick, element.dataset.analyticsTitle, true);
  }
  document.addEventListener("click", trackClick);
  document.addEventListener("auxclick", trackClick);
  document.querySelector("#theme-toggle")?.addEventListener("change", (event) => {
    const theme = event.target.checked ? "dark" : "light";
    record(`theme-${theme}`, `Theme · Switched to ${theme}`, true);
  });

  // Reaching a heading for two seconds is distinct from clicking a menu link.
  const headings = new Map();
  function updateHeading(element) {
    const state = headings.get(element);
    if (state.timer) { clearTimeout(state.timer); state.timer = null; }
    if (state.sent || !state.visible || document.visibilityState !== "visible") return;
    state.timer = setTimeout(() => {
      state.timer = null;
      if (!state.visible || document.visibilityState !== "visible") return;
      state.sent = true;
      record(`reached-${element.dataset.analyticsSection}`,
        `Reached · ${element.dataset.analyticsTitle}`);
    }, 2000);
  }
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const state = headings.get(entry.target);
        state.visible = entry.isIntersecting && entry.intersectionRatio >= 0.5;
        updateHeading(entry.target);
      }
    }, { threshold: 0.5, rootMargin: "-80px 0px 0px 0px" });
    document.querySelectorAll("[data-analytics-section]").forEach((element) => {
      headings.set(element, { visible: false, sent: false, timer: null });
      observer.observe(element);
    });
  }

  // Anonymous per-tab totals survive navigation; no visitor identifier is added.
  const timeKey = "site-viewing-time";
  const expiry = 30 * 60 * 1000;
  let viewingTime = { home: 0, cv: 0 };
  try {
    const saved = JSON.parse(sessionStorage.getItem(timeKey));
    if (saved && Date.now() - saved.updated < expiry) {
      for (const name of ["home", "cv"]) {
        if (Number.isFinite(saved[name]) && saved[name] >= 0) viewingTime[name] = saved[name];
      }
    }
  } catch {
    // Measurements still work for this page without browser storage.
  }
  const milestones = [15, 30, 60, 120, 300];
  const reachedTimes = new Set(milestones.filter(seconds => viewingTime[pageName] >= seconds));
  let visible = document.visibilityState === "visible";
  let lastTick = performance.now();
  let timer;

  function saveTime() {
    try {
      sessionStorage.setItem(timeKey, JSON.stringify({ ...viewingTime, updated: Date.now() }));
    } catch { /* Storage is optional. */ }
  }
  function tick() {
    const now = performance.now();
    if (visible) {
      // Discard long clock gaps caused by sleep or suspended browser processes.
      viewingTime[pageName] += Math.min(Math.max(now - lastTick, 0), 2000) / 1000;
      for (const seconds of milestones) {
        if (viewingTime[pageName] < seconds || reachedTimes.has(seconds)) continue;
        reachedTimes.add(seconds);
        const label = seconds < 60 ? `${seconds} seconds` : `${seconds / 60} minute${seconds > 60 ? "s" : ""}`;
        record(`time-${pageName}-${seconds}s`, `Time · ${pageTitle} ≥ ${label}`);
      }
      saveTime();
    }
    lastTick = now;
  }
  function runTimer() {
    clearInterval(timer);
    if (visible) timer = setInterval(tick, 1000);
  }
  document.addEventListener("visibilitychange", () => {
    tick();
    visible = document.visibilityState === "visible";
    startVisit();
    runTimer();
    headings.forEach((_, element) => updateHeading(element));
  });
  window.addEventListener("pagehide", () => {
    tick();
    visible = false;
    clearInterval(timer);
    saveTime();
    headings.forEach((_, element) => updateHeading(element));
    flush();
  });
  window.addEventListener("pageshow", () => {
    lastTick = performance.now();
    visible = document.visibilityState === "visible";
    runTimer();
    headings.forEach((_, element) => updateHeading(element));
  });
  runTimer();
})();
