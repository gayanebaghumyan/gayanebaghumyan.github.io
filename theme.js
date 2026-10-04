(() => {
  const storageKey = "site-theme";
  let currentTheme = "dark";
  let themeToggle;

  function applyTheme(theme) {
    currentTheme = theme === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = currentTheme;
    if (themeToggle) themeToggle.checked = currentTheme === "dark";
  }

  function restoreTheme() {
    try {
      applyTheme(window.localStorage.getItem(storageKey));
    } catch {
      applyTheme(currentTheme);
    }
  }

  // Runs in the head so the saved theme is applied before the page is painted.
  restoreTheme();

  document.addEventListener("DOMContentLoaded", () => {
    themeToggle = document.querySelector("#theme-toggle");
    if (!themeToggle) return;
    restoreTheme();

    themeToggle.addEventListener("change", () => {
      applyTheme(themeToggle.checked ? "dark" : "light");
      try {
        window.localStorage.setItem(storageKey, currentTheme);
      } catch {
        // The toggle still works when the browser blocks saved preferences.
      }
    });
  });

  // Keep the toggle in sync after Back/Forward and changes in another tab.
  window.addEventListener("pageshow", restoreTheme);
  window.addEventListener("storage", (event) => {
    if (event.key === storageKey || event.key === null) restoreTheme();
  });
})();
