/**
 * Inline script prevents theme flash before React hydrates.
 * Must stay sync and tiny — reads localStorage + system preference.
 */
export function ThemeScript() {
  const code = `(function(){try{var k='thunder-theme';var p=localStorage.getItem(k);var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=(p==='dark'||p==='light')?p:(d?'dark':'light');var e=document.documentElement;e.classList.toggle('dark',r==='dark');e.dataset.theme=r;e.style.colorScheme=r;}catch(e){}})();`;
  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
      suppressHydrationWarning
    />
  );
}
