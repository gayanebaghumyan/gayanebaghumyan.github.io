(() => {
  const pageName = document.body.dataset.analyticsPage;
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
    flush();
  }
  library.addEventListener("load", flush);
  startVisit();

  const clickTitles = {
    "click-research": "Clicked Research",
    "click-teaching": "Clicked Teaching",
    "click-cv": "Clicked CV",
    "download-cv": "CV download clicked"
  };
  function trackClick(event) {
    if (event.type === "auxclick" && event.button !== 1) return;
    const element = event.target.closest?.("[data-analytics-click]");
    const path = element?.dataset.analyticsClick;
    if (!Object.hasOwn(clickTitles, path)) return;
    record(path, clickTitles[path], true);
  }
  document.addEventListener("click", trackClick);
  document.addEventListener("auxclick", trackClick);

  // One anonymous total per tab, shared by Home and CV. No visitor ID is added.
  const timeKey = "site-viewing-time-v2";
  const expiry = 30 * 60 * 1000;
  const milestones = [15, 30];
  let secondsOnSite = 0;
  let lastActiveAt = Date.now();
  let reachedTimes = new Set();
  function restoreTime() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(timeKey));
      if (saved && Number.isFinite(saved.seconds) && saved.seconds >= 0 &&
          Number.isFinite(saved.updated) && Date.now() - saved.updated < expiry) {
        secondsOnSite = saved.seconds;
        lastActiveAt = saved.updated;
      }
    } catch { /* Measurements still work without browser storage. */ }
    resetIfIdle();
    reachedTimes = new Set(milestones.filter(seconds => secondsOnSite >= seconds));
  }
  function resetIfIdle() {
    if (Date.now() - lastActiveAt >= expiry) {
      secondsOnSite = 0;
      reachedTimes.clear();
      lastActiveAt = Date.now();
    }
  }
  restoreTime();
  let visible = document.visibilityState === "visible";
  let lastTick = performance.now();
  let timer;

  function saveTime() {
    try {
      sessionStorage.setItem(timeKey, JSON.stringify({ seconds: secondsOnSite, updated: lastActiveAt }));
    } catch { /* Storage is optional. */ }
  }
  function tick() {
    const now = performance.now();
    if (visible) {
      resetIfIdle();
      // Discard long clock gaps caused by sleep or suspended browser processes.
      secondsOnSite += Math.min(Math.max(now - lastTick, 0), 2000) / 1000;
      lastActiveAt = Date.now();
      for (const seconds of milestones) {
        if (secondsOnSite < seconds || reachedTimes.has(seconds)) continue;
        reachedTimes.add(seconds);
        record(`time-site-${seconds}s`, `Time on website ≥ ${seconds} seconds`);
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
    if (visible) resetIfIdle();
    startVisit();
    runTimer();
  });
  window.addEventListener("pagehide", () => {
    tick();
    visible = false;
    clearInterval(timer);
    saveTime();
    flush();
  });
  window.addEventListener("pageshow", () => {
    // Refresh the shared total after Back/Forward restores a cached page.
    restoreTime();
    lastTick = performance.now();
    visible = document.visibilityState === "visible";
    runTimer();
    startVisit();
  });
  runTimer();
})();
