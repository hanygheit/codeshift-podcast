/** Site theme: light by default, dark only when the visitor has chosen it with the header toggle. */
export const THEME_STORAGE_KEY = "codeshift-theme";

/** Inline head script: applies a saved dark preference before first paint (no flash). */
export const THEME_INIT_SCRIPT = `try{if(localStorage.getItem("${THEME_STORAGE_KEY}")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

/** Flips the theme on <html>, remembers the choice, and returns whether dark is now active. */
export function toggleTheme(): boolean {
  const dark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light");
  } catch {
    // Storage can be blocked (private mode); the toggle still works for this page view.
  }
  return dark;
}
