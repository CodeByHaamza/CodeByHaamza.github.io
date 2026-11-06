// Briques communes aux pages : fabrique d'elements, navigation, pied,
// et l'apparition au defilement.

import { LIENS, type Langue } from "./contenu/donnees";

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, classe?: string, texte?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

export function lien(href: string, texte: string, classe?: string): HTMLAnchorElement {
  const a = el("a", classe, texte);
  a.href = href;
  if (!href.startsWith("/") && !href.startsWith("mailto:")) {
    a.target = "_blank";
    a.rel = "noopener";
  }
  return a;
}

/** Marque un bloc pour qu'il apparaisse quand il entre dans l'ecran. */
export function reveler(n: HTMLElement, rang = 0): HTMLElement {
  n.classList.add("rev");
  n.style.setProperty("--rang", String(rang));
  return n;
}

let observateur: IntersectionObserver | null = null;

export function brancherRevelations(racine: ParentNode): void {
  const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const blocs = [...racine.querySelectorAll<HTMLElement>(".rev")];
  if (doux) {
    // Pas d'apparition progressive : on montre tout, tout de suite.
    for (const b of blocs) b.classList.add("vu");
    return;
  }
  observateur?.disconnect();
  observateur = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (e.isIntersecting) {
        e.target.classList.add("vu");
        observateur?.unobserve(e.target);
      }
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  for (const b of blocs) observateur.observe(b);
}

const NAV: { href: string; fr: string; en: string }[] = [
  { href: "/", fr: "Accueil", en: "Home" },
  { href: "/projets", fr: "Projets", en: "Work" },
  { href: "/a-propos", fr: "À propos", en: "About" },
  { href: "/contact", fr: "Contact", en: "Contact" },
];

export function barreNav(
  chemin: string, l: Langue, onLangue: (n: Langue) => void,
  onTerminal: () => void,
): HTMLElement {
  const h = el("header", "entete");
  const inner = el("div", "entete-inner");

  const marque = lien("/", "", "marque");
  marque.textContent = "";
  const hk = el("span", "marque-hk", "HK");
  const nm = el("span", "marque-nom", "Hamza Karrouchi");
  marque.append(hk, nm);
  inner.append(marque);

  const nav = el("nav", "nav");
  for (const item of NAV) {
    const a = lien(item.href, l === "fr" ? item.fr : item.en);
    const actif = item.href === "/"
      ? chemin === "/"
      : chemin.startsWith(item.href);
    if (actif) a.setAttribute("aria-current", "page");
    nav.append(a);
  }
  inner.append(nav);

  const outils = el("div", "outils");
  const bl = el("button", "lien-outil", l === "fr" ? "EN" : "FR");
  bl.type = "button";
  bl.title = l === "fr" ? "Read in English" : "Lire en français";
  bl.addEventListener("click", () => onLangue(l === "fr" ? "en" : "fr"));
  const bt = el("button", "lien-outil terminal", "_terminal");
  bt.type = "button";
  bt.title = l === "fr" ? "Vue terminal (touche ~)" : "Terminal view (~ key)";
  bt.addEventListener("click", onTerminal);
  outils.append(bl, bt);
  inner.append(outils);

  h.append(inner);
  return h;
}

export function pied(l: Langue): HTMLElement {
  const f = el("footer", "pied");
  const inner = el("div", "pied-inner");

  const g = el("div");
  g.append(el("p", "pied-nom", "Hamza Karrouchi"));
  g.append(el("p", "pied-note",
    l === "fr"
      ? "Étudiant en informatique, en alternance. France."
      : "CS student, work-study. France."));
  inner.append(g);

  const d = el("nav", "pied-liens");
  for (const x of LIENS) d.append(lien(x.url, x.nom));
  inner.append(d);

  f.append(inner);
  const bas = el("p", "pied-bas",
    l === "fr"
      ? "Site construit avec Vite et TypeScript. Chiffres GitHub relevés à la construction."
      : "Built with Vite and TypeScript. GitHub numbers measured at build time.");
  f.append(bas);
  return f;
}

/** Fait monter un nombre de 0 a sa valeur, une seule fois, a l'apparition. */
export function compteur(cible: HTMLElement, valeur: number, l: Langue): void {
  const doux = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (n: number) => n.toLocaleString(l === "fr" ? "fr-FR" : "en-US");
  if (doux) {
    cible.textContent = fmt(valeur);
    return;
  }
  cible.textContent = "0";
  const io = new IntersectionObserver((e) => {
    if (!e[0].isIntersecting) return;
    io.disconnect();
    const duree = 1100;
    let debut: number | null = null;
    const pas = (t: number) => {
      debut ??= t;
      const p = Math.min((t - debut) / duree, 1);
      cible.textContent = fmt(Math.floor(valeur * (1 - (1 - p) ** 3)));
      if (p < 1) requestAnimationFrame(pas);
    };
    requestAnimationFrame(pas);
  }, { threshold: 0.4 });
  io.observe(cible);
}
