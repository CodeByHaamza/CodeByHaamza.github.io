// Choisit la vue et la monte.
//
// La page classique est le defaut : on arrive sur quelque chose qui se lit
// sans rien savoir faire. Le terminal est une option, accessible par le
// bouton, par la touche ~, ou par l'adresse #terminal.

import "./style.css";
import { rendreClassique } from "./classique";
import { monterTerminal } from "./vue-terminal";
import type { Langue } from "./contenu/donnees";

const app = document.getElementById("app") as HTMLDivElement;
const CLE_VUE = "vue";
const CLE_LANGUE = "langue";

type Vue = "classique" | "terminal";

function langueInitiale(): Langue {
  const stockee = localStorage.getItem(CLE_LANGUE);
  if (stockee === "fr" || stockee === "en") return stockee;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

function vueInitiale(): Vue {
  if (location.hash.startsWith("#terminal")) return "terminal";
  // Un fragment de commande (#cat …) vise forcement le terminal.
  if (location.hash.length > 1) return "terminal";
  return localStorage.getItem(CLE_VUE) === "terminal" ? "terminal" : "classique";
}

let langue: Langue = langueInitiale();
let vue: Vue = vueInitiale();
let demonterTerminal: (() => void) | null = null;

function majBarre(): void {
  const b = document.getElementById("bascule") as HTMLButtonElement;
  b.textContent = vue === "classique"
    ? (langue === "fr" ? "> terminal" : "> terminal")
    : (langue === "fr" ? "× quitter le terminal" : "× leave the terminal");
  b.setAttribute("aria-pressed", String(vue === "terminal"));
}

function monter(): void {
  demonterTerminal?.();
  demonterTerminal = null;
  app.replaceChildren();
  document.body.dataset.vue = vue;
  if (vue === "classique") {
    rendreClassique(app, langue, () => basculer("terminal"), changerLangue);
  } else {
    demonterTerminal = monterTerminal(app, langue, () => basculer("classique"),
                                      (n) => { langue = n; sauver(); });
  }
  majBarre();
  localStorage.setItem(CLE_VUE, vue);
}

function sauver(): void {
  localStorage.setItem(CLE_LANGUE, langue);
}

function changerLangue(n: Langue): void {
  langue = n;
  sauver();
  monter();
}

function basculer(v: Vue): void {
  vue = v;
  if (v === "classique" && location.hash) {
    history.replaceState(null, "", location.pathname);
  }
  monter();
  window.scrollTo({ top: 0 });
}

document.getElementById("bascule")?.addEventListener("click", () => {
  basculer(vue === "classique" ? "terminal" : "classique");
});

// La touche ~ ouvre le terminal, comme dans un jeu. On l'ignore si on est
// deja en train d'ecrire dans un champ, sinon on ne pourrait plus taper le
// caractere lui-meme.
document.addEventListener("keydown", (ev) => {
  const cible = ev.target as HTMLElement | null;
  if (cible && (cible.tagName === "INPUT" || cible.tagName === "TEXTAREA")) return;
  if (ev.key === "~" || (ev.key === "Escape" && vue === "terminal")) {
    ev.preventDefault();
    basculer(vue === "classique" ? "terminal" : "classique");
  }
});

monter();
