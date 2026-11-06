'use strict';

const defaults = { thin: 3, thick: 8, color: '#ffffff', opacity: 96, thumb: 'circle' };
const keys = Object.keys(defaults);

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function sanitizeSetting(key, value) {
  switch (key) {
    case 'thin':
      return Math.round(clampNumber(value, 2, 10, defaults.thin));
    case 'thick':
      return Math.round(clampNumber(value, 4, 16, defaults.thick));
    case 'opacity':
      return Math.round(clampNumber(value, 30, 100, defaults.opacity));
    case 'color':
      return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value) ? value : defaults.color;
    case 'thumb':
      return value === 'none' || value === 'circle' ? value : defaults.thumb;
    default:
      return defaults[key];
  }
}

function render() {
  for (const key of ['thin', 'thick', 'opacity']) {
    const input = document.getElementById(key);
    const output = document.getElementById(`${key}-value`);
    if (!input || !output) continue;
    output.textContent = input.value + (key === 'opacity' ? '%' : 'px');
  }
}

chrome.storage.local.get(defaults, values => {
  if (chrome.runtime.lastError) return;
  for (const key of keys) {
    const input = document.getElementById(key);
    if (!input) continue;
    input.value = String(sanitizeSetting(key, values[key]));
  }
  render();
});

for (const key of keys) {
  const input = document.getElementById(key);
  if (!input) continue;
  input.addEventListener('input', () => {
    const value = sanitizeSetting(key, input.value);
    input.value = String(value);
    chrome.storage.local.set({ [key]: value });
    render();
  });
}
