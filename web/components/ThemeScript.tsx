// Inline <script> that runs before React hydrates. It reads the stored
// theme preference (or the OS preference if nothing's stored) and applies
// the `dark` class to <html> synchronously, so the page never paints in
// the wrong theme.
//
// Kept as a string passed to dangerouslySetInnerHTML so it ships inline
// in the document head — a module/component would run too late.
export function ThemeScript() {
  const code = `
(function() {
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = saved ? saved === 'dark' : prefersDark;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`.trim();

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
