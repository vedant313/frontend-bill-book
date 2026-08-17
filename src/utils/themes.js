import { tint } from "./color.js";

// Preset "designs" the user can pick from Appearance settings. Each preset
// is a full palette mapped onto the CSS variables used across the app
// (see styles/global.css :root). Keeping the shape identical to :root makes
// applying a theme as simple as setting these as inline CSS variables on
// the document root.
export const PRESET_THEMES = [
  {
    id: "ocean",
    name: "Ocean (Default)",
    vars: {
      "--navy": "#16233f", "--navy-light": "#223154",
      "--teal": "#0f9b8e", "--teal-light": "#e4f5f2",
      "--paper": "#faf9f5", "--card": "#ffffff",
      "--ink": "#1a1d24", "--muted": "#6b7280", "--border": "#e7e5de",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "sunset",
    name: "Sunset",
    vars: {
      "--navy": "#7c2d12", "--navy-light": "#9a3412",
      "--teal": "#ea580c", "--teal-light": "#ffedd5",
      "--paper": "#fffaf5", "--card": "#ffffff",
      "--ink": "#292524", "--muted": "#78716c", "--border": "#f0e0d0",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "forest",
    name: "Forest",
    vars: {
      "--navy": "#1b3a2b", "--navy-light": "#26503b",
      "--teal": "#c9a227", "--teal-light": "#f7f0d2",
      "--paper": "#f7f8f2", "--card": "#ffffff",
      "--ink": "#1c2620", "--muted": "#6b7768", "--border": "#e2e6da",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "royal",
    name: "Royal Purple",
    vars: {
      "--navy": "#2e1065", "--navy-light": "#3f1d8c",
      "--teal": "#7c3aed", "--teal-light": "#ede9fe",
      "--paper": "#f8f7fc", "--card": "#ffffff",
      "--ink": "#1e1b2e", "--muted": "#6f6b85", "--border": "#e5e2f2",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "rose",
    name: "Rose",
    vars: {
      "--navy": "#831843", "--navy-light": "#9d174d",
      "--teal": "#db2777", "--teal-light": "#fce7f3",
      "--paper": "#fff7fa", "--card": "#ffffff",
      "--ink": "#2b1220", "--muted": "#8a6b78", "--border": "#f3dde6",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "slate",
    name: "Slate",
    vars: {
      "--navy": "#1e293b", "--navy-light": "#334155",
      "--teal": "#0ea5e9", "--teal-light": "#e0f2fe",
      "--paper": "#f8fafc", "--card": "#ffffff",
      "--ink": "#0f172a", "--muted": "#64748b", "--border": "#e2e8f0",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "berry",
    name: "Berry",
    vars: {
      "--navy": "#4c0519", "--navy-light": "#6b0f28",
      "--teal": "#be123c", "--teal-light": "#ffe4e6",
      "--paper": "#fff8f8", "--card": "#ffffff",
      "--ink": "#27070a", "--muted": "#8a6367", "--border": "#f2dcdf",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "mint",
    name: "Mint",
    vars: {
      "--navy": "#064e3b", "--navy-light": "#0a6b51",
      "--teal": "#10b981", "--teal-light": "#d1fae5",
      "--paper": "#f0fdf4", "--card": "#ffffff",
      "--ink": "#052e1c", "--muted": "#5f8873", "--border": "#d7ede1",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "gold",
    name: "Classic Gold",
    vars: {
      "--navy": "#1a1a1a", "--navy-light": "#2e2e2e",
      "--teal": "#b8860b", "--teal-light": "#faf1d8",
      "--paper": "#fdfaf3", "--card": "#ffffff",
      "--ink": "#1a1a1a", "--muted": "#736b5a", "--border": "#eae2cc",
      "--amber": "#c9852b", "--amber-bg": "#fbf0de",
      "--red": "#b94a3f", "--red-bg": "#fbebe8",
      "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
    },
  },
  {
    id: "midnight",
    name: "Midnight (Dark)",
    vars: {
      "--navy": "#0b1220", "--navy-light": "#141d33",
      "--teal": "#22d3ee", "--teal-light": "#123544",
      "--paper": "#0b0f1a", "--card": "#131a2b",
      "--ink": "#e5e7eb", "--muted": "#94a3b8", "--border": "#232b41",
      "--amber": "#e0a94a", "--amber-bg": "#332616",
      "--red": "#e06b60", "--red-bg": "#3a1c1a",
      "--green": "#4ade80", "--green-bg": "#123320",
    },
  },
];

export const DEFAULT_PRESET_ID = "ocean";

export function getPreset(id) {
  return PRESET_THEMES.find((t) => t.id === id) || PRESET_THEMES[0];
}

// Builds a full theme (all CSS variables) from just the handful of colors a
// user picks in the "Create your own theme" builder.
export function buildCustomTheme({ navy, teal, paper, ink }) {
  return {
    "--navy": navy,
    "--navy-light": tint(navy, 0.18),
    "--teal": teal,
    "--teal-light": tint(teal, 0.88),
    "--paper": paper,
    "--card": tint(paper, 0.6) === paper ? "#ffffff" : tint(paper, 0.85),
    "--ink": ink,
    "--muted": tint(ink, 0.45),
    "--border": tint(ink, 0.86),
    "--amber": "#c9852b", "--amber-bg": "#fbf0de",
    "--red": "#b94a3f", "--red-bg": "#fbebe8",
    "--green": "#1e7a4c", "--green-bg": "#e7f5ec",
  };
}

// Resolves a business.theme value ({ preset, custom }) to a concrete set of
// CSS variables ready to apply to the document root.
export function resolveThemeVars(theme) {
  if (theme?.custom) return buildCustomTheme(theme.custom);
  return getPreset(theme?.preset || DEFAULT_PRESET_ID).vars;
}

export function applyThemeVars(vars) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => root.style.setProperty(key, value));
}
