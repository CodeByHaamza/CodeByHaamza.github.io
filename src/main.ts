// Le routeur et le montage.
//
// Vraies URL (/projets/kagami) et non des fragments : c'est ce qu'on attend
// d'un site, c'est partageable et indexable. GitHub Pages sert 404.html
// pour tout chemin inconnu ; le workflow en fait une copie d'index.html,
// donc l'application demarre quelle que soit l'adresse ouverte.

import "@fontsource-variable/inter";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/700.css";
import "./style.css";

import {
  pageAPropos, pageAccueil, pageContact, pageProjet, pageProjets,
} from "./pages";
import { barreNav, brancherRevelations, el, pied } from "./ui";
import { monterTerminal } from "./vue-terminal";
import type { Langue } from "./contenu/donnees";

const app = document.getElementById("app") as HTMLDivElement;
const CLE_LANGUE = "langue";

function langueInitiale(): Langue {
  const s = localStorage.getItem(CLE_LANGUE);
  if (s === "fr" || s === "en") return s;
  return navigator.language.startsWith("fr") ? "fr" : "en";
}

let langue: Langue = langueInitiale();
let demonterTerminal: (() => void) | null = null;

const TITRES: Record<string, Record<Langue, string>> = {
  "/": { fr: "Hamza Karrouchi", en: "Hamza Karrouchi" },
  "/projets": { fr: "Projets", en: "Work" },
  "/a-propos": { fr: "À propos", en: "About" },
  "/contact": { fr: "Contact", en: "Contact" },
};

function contenuPour(chemin: string, l: Langue): HTMLElement {
  if (chemin === "/") return pageAccueil(l);
  if (chemin === "/projets") return pageProjets(l);
  if (chemin.startsWith("/projets/")) {
    const p = pageProjet(chemin.slice("/projets/".length), l);
    if (p) return p;
  }
  if (chemin === "/a-propos") return pageAPropos(l);
  if (chemin === "/contact") return pageContact(l);

  const f = document.createElement("div");
  const s = el("section", "section section-haut");
  s.append(el("p", "surtitre", "404"));
  s.append(el("h1", undefined,
    l === "fr" ? "Cette page n'existe pas." : "This page does not exist."));
  const a = el("a", "btn", l === "fr" ? "Retour à l'accueil" : "Back home");
  a.href = "/";
  s.append(a);
  f.append(s);
  return f;
}

function quitterTerminal(): void {
  demonterTerminal?.();
  demonterTerminal = null;
  document.body.dataset.vue = "site";
  rendre(location.pathname, false);
}

function entrerTerminal(): void {
  if (demonterTerminal) return;
  app.replaceChildren();
  document.body.dataset.vue = "terminal";
  demonterTerminal = monterTerminal(app, langue, quitterTerminal, (n) => {
    langue = n;
    localStorage.setItem(CLE_LANGUE, n);
  });
  window.scrollTo({ top: 0 });
}

function rendre(chemin: string, defiler = true): void {
  demonterTerminal?.();
  demonterTerminal = null;
  document.body.dataset.vue = "site";

  const titre = TITRES[chemin];
  document.title = titre
    ? (chemin === "/" ? titre[langue]
       : `${titre[langue]} — Hamza Karrouchi`)
    : "Hamza Karrouchi";
  document.documentElement.lang = langue;

  const page = el("div", "page");
  page.append(barreNav(chemin, langue, changerLangue, entrerTerminal));
  const principal = el("main", "principal");
  principal.id = "contenu";
  principal.append(contenuPour(chemin, langue));
  page.append(principal);
  page.append(pied(langue));

  app.replaceChildren(page);
  brancherRevelations(page);
  // Laisse un souffle avant d'animer l'entree, sinon la transition est
  // avalee par le premier rendu.
  requestAnimationFrame(() => page.classList.add("entree"));
  if (defiler) window.scrollTo({ top: 0 });
}

function changerLangue(n: Langue): void {
  langue = n;
  localStorage.setItem(CLE_LANGUE, n);
  if (demonterTerminal) {
    entrerTerminal();
  } else {
    rendre(location.pathname, false);
  }
}

function naviguer(href: string): void {
  if (href === location.pathname) return;
  history.pushState(null, "", href);
  rendre(href);
}

// Interception des liens internes : un clic ne doit pas recharger la page.
document.addEventListener("click", (ev) => {
  const a = (ev.target as HTMLElement | null)?.closest("a");
  if (!a) return;
  const href = a.getAttribute("href") ?? "";
  if (!href.startsWith("/") || a.target === "_blank") return;
  if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button !== 0) return;
  ev.preventDefault();
  naviguer(href);
});

window.addEventListener("popstate", () => rendre(location.pathname, false));

document.addEventListener("keydown", (ev) => {
  const c = ev.target as HTMLElement | null;
  if (c && (c.tagName === "INPUT" || c.tagName === "TEXTAREA")) return;
  if (ev.key === "~") {
    ev.preventDefault();
    if (demonterTerminal) quitterTerminal();
    else entrerTerminal();
  } else if (ev.key === "Escape" && demonterTerminal) {
    ev.preventDefault();
    quitterTerminal();
  }
});

// Une adresse #terminal ou une commande en fragment ouvre directement le
// terminal : les liens profonds d'avant continuent de marcher.
if (location.hash.length > 1) entrerTerminal();
else rendre(location.pathname, false);
