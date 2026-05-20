"use client";

// Theme toggle button. Renders the same DOM on both server and client so
// it's visible immediately — even if hydration is slow or interrupted by
// a stray browser extension. The sun/moon icon swap is driven purely by
// the `dark` class on <html>, set pre-paint by ThemeScript: both SVGs
// are in the markup and CSS hides whichever isn't active.
//
// The `onClick` handler still needs hydration to fire, but the icon
// state is correct without it.

function toggle() {
  const html = document.documentElement;
  const next = !html.classList.contains("dark");
  html.classList.toggle("dark", next);
  try {
    localStorage.setItem("theme", next ? "dark" : "light");
  } catch {}
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      title="(Alt + T)"
      accessKey="t"
      onClick={toggle}
      className="theme-toggle inline-flex items-center justify-center w-8 h-8 text-[color:var(--primary)] hover:text-[color:var(--secondary)]"
    >
      {/* Moon icon — shown in light mode */}
      <svg
        className="theme-toggle-moon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
      {/* Sun icon — shown in dark mode */}
      <svg
        className="theme-toggle-sun"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <line x1="12" y1="1" x2="12" y2="3" />
        <line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" />
        <line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    </button>
  );
}
