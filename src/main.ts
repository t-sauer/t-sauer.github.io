const STORAGE_KEY = 'theme';
const root = document.documentElement;
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const label = toggle?.querySelector<HTMLElement>('[data-theme-label]');

type Theme = 'light' | 'dark';

const getPreferredTheme = (): Theme =>
  window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';

const applyTheme = (theme: Theme, persist: boolean) => {
  root.dataset.theme = theme;
  if (toggle) {
    toggle.dataset.theme = theme;
    toggle.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  }
  if (label) {
    label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
  if (persist) {
    localStorage.setItem(STORAGE_KEY, theme);
  }
};

const loadTheme = (): Theme => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return getPreferredTheme();
};

const initTheme = () => {
  applyTheme(loadTheme(), false);

  toggle?.addEventListener('click', () => {
    const nextTheme: Theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme, true);
  });

  const media = window.matchMedia('(prefers-color-scheme: light)');
  media.addEventListener('change', () => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(getPreferredTheme(), false);
    }
  });
};

initTheme();
