// La vue par defaut : une page qui se lit en defilant.
//
// Elle est construite depuis contenu/donnees.ts, exactement la meme source
// que le terminal. Ajouter un projet le fait apparaitre dans les deux vues
// sans rien dupliquer.

import {
  A_PROPOS, GOUTS, LIENS, PILE, PROJETS, type Langue, type Projet,
} from "./contenu/donnees";
import stats from "../data/github.json";

const T = {
  apropos: { fr: "À propos", en: "About" },
  projets: { fr: "Projets", en: "Projects" },
  pile: { fr: "Stack", en: "Stack" },
  chiffres: { fr: "En chiffres", en: "By the numbers" },
  gouts: { fr: "Hors du code", en: "Away from the code" },
  contact: { fr: "Me joindre", en: "Get in touch" },
  probleme: { fr: "Le problème", en: "The problem" },
  approche: { fr: "L'approche", en: "The approach" },
  difficile: { fr: "Le plus dur", en: "The hard part" },
  preuve: { fr: "La preuve", en: "The proof" },
  code: { fr: "Code", en: "Code" },
  demo: { fr: "Essayer", en: "Try it" },
  deplier: { fr: "Lire l'étude de cas", en: "Read the case study" },
  versTerminal: { fr: "Vue terminal", en: "Terminal view" },
  commits: { fr: "commits", en: "commits" },
  etoiles: { fr: "étoiles", en: "stars" },
  depots: { fr: "dépôts publics", en: "public repos" },
  serie: { fr: "jours de série", en: "day streak" },
  contributions: { fr: "contributions sur 12 mois", en: "contributions, 12 months" },
  releve: { fr: "relevé le", en: "measured on" },
} satisfies Record<string, Record<Langue, string>>;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K, classe?: string, texte?: string,
): HTMLElementTagNameMap[K] {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texte !== undefined) n.textContent = texte;
  return n;
}

function banniere(): HTMLElement {
  const h = el("h1", "nom");
  h.dataset.texte = "HAMZA";
  h.textContent = "HAMZA";
  return h;
}

function carteProjet(p: Projet, l: Langue): HTMLElement {
  const art = el("article", "projet");

  const tete = el("header", "projet-tete");
  const h = el("h3", undefined, p.nom);
  tete.append(h, el("span", "annee", p.annee));
  art.append(tete);

  art.append(el("p", "resume", p.resume[l]));

  const pile = el("ul", "puces");
  for (const x of p.pile) pile.append(el("li", undefined, x));
  art.append(pile);

  const liens = el("p", "liens");
  const a = el("a", "bouton", T.code[l]);
  a.href = p.url;
  a.target = "_blank";
  a.rel = "noopener";
  liens.append(a);
  if (p.demo) {
    const d = el("a", "bouton primaire", T.demo[l]);
    d.href = p.demo;
    d.target = "_blank";
    d.rel = "noopener";
    liens.append(d);
  }
  art.append(liens);

  // L'etude de cas est repliee : la carte reste lisible d'un coup d'oeil,
  // et le detail est la pour qui veut creuser.
  const det = el("details", "etude");
  det.append(el("summary", undefined, T.deplier[l]));
  for (const [cle, titre] of [
    ["probleme", T.probleme[l]], ["approche", T.approche[l]],
    ["difficile", T.difficile[l]], ["preuve", T.preuve[l]],
  ] as const) {
    det.append(el("h4", undefined, titre));
    det.append(el("p", undefined, p.etude[cle][l]));
  }
  for (const img of p.images ?? []) {
    const fig = el("figure");
    const i = el("img");
    i.src = img.src;
    i.alt = img.legende[l];
    i.loading = "lazy";
    fig.append(i, el("figcaption", undefined, img.legende[l]));
    det.append(fig);
  }
  art.append(det);
  return art;
}

function section(id: string, titre: string): HTMLElement {
  const s = el("section", "bloc");
  s.id = id;
  s.append(el("h2", undefined, titre));
  return s;
}

export function rendreClassique(
  racine: HTMLElement, l: Langue, onTerminal: () => void,
  onLangue: (n: Langue) => void,
): void {
  racine.replaceChildren();

  // ---- en-tete
  const hero = el("header", "hero");
  hero.append(banniere());
  hero.append(el("p", "accroche",
    l === "fr"
      ? "Étudiant en informatique · je livre un projet toutes les deux semaines · rom hacker"
      : "CS student · ships a project every two weeks · ROM hacker"));
  const liens = el("nav", "liens-haut");
  for (const x of LIENS) {
    const a = el("a", undefined, x.nom);
    a.href = x.url;
    if (!x.url.startsWith("mailto:")) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    liens.append(a);
  }
  hero.append(liens);
  racine.append(hero);

  // ---- a propos
  const ap = section("apropos", T.apropos[l]);
  for (const para of A_PROPOS[l].join("\n").split("\n\n")) {
    ap.append(el("p", undefined, para.replace(/\n/g, " ")));
  }
  racine.append(ap);

  // ---- projets
  const pr = section("projets", T.projets[l]);
  const grille = el("div", "grille");
  for (const p of PROJETS) grille.append(carteProjet(p, l));
  pr.append(grille);
  racine.append(pr);

  // ---- stack
  const st = section("stack", T.pile[l]);
  const tab = el("dl", "pile");
  for (const c of PILE) {
    tab.append(el("dt", undefined, c.cat));
    tab.append(el("dd", undefined, c.items.join(" · ")));
  }
  st.append(tab);
  racine.append(st);

  // ---- chiffres
  const ch = section("chiffres", T.chiffres[l]);
  const tuiles = el("div", "tuiles");
  for (const [v, k] of [
    [stats.commits.toLocaleString(l === "fr" ? "fr-FR" : "en-US"), T.commits[l]],
    [String(stats.etoiles), T.etoiles[l]],
    [String(stats.depots), T.depots[l]],
    [String(stats.serie), T.serie[l]],
  ] as const) {
    const t = el("div", "tuile");
    t.append(el("strong", undefined, v), el("span", undefined, k));
    tuiles.append(t);
  }
  ch.append(tuiles);

  const barres = el("div", "langages");
  const max = Math.max(...stats.langages.map((x) => x.part), 1);
  for (const lg of stats.langages) {
    const r = el("div", "langue");
    r.append(el("span", "nom-langue", lg.nom));
    const piste = el("div", "piste");
    const rempli = el("div", "rempli");
    rempli.style.width = `${(lg.part / max) * 100}%`;
    piste.append(rempli);
    r.append(piste, el("span", "part", `${lg.part.toFixed(1)} %`));
    barres.append(r);
  }
  ch.append(barres);
  ch.append(el("p", "note",
    `${T.releve[l]} ${stats.releve} · ${stats.contributions} ${T.contributions[l]}`));
  racine.append(ch);

  // ---- hors du code
  const fu = section("fun", T.gouts[l]);
  const ul = el("ul", "gouts");
  for (const g of GOUTS[l]) {
    const i = g.indexOf("  ");
    const li = el("li");
    li.append(el("strong", undefined, g.slice(0, i).trim()),
              el("span", undefined, g.slice(i).trim()));
    ul.append(li);
  }
  fu.append(ul);
  const fig = el("figure", "tusk");
  const img = el("img");
  img.src = "img/tusk.gif";
  img.alt = "Tusk, Steel Ball Run";
  img.loading = "lazy";
  fig.append(img, el("figcaption", undefined,
    l === "fr"
      ? "TUSK ACT 4 — Steel Ball Run, la meilleure partie. Pas de débat."
      : "TUSK ACT 4 — Steel Ball Run, the best part. No debate."));
  fu.append(fig);
  racine.append(fu);

  // ---- contact
  const co = section("contact", T.contact[l]);
  const lc = el("ul", "contacts");
  for (const x of LIENS) {
    const li = el("li");
    const a = el("a", undefined, x.url.replace(/^mailto:/, ""));
    a.href = x.url;
    if (!x.url.startsWith("mailto:")) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    li.append(el("strong", undefined, x.nom), a);
    lc.append(li);
  }
  co.append(lc);
  racine.append(co);

  // ---- pied
  const pied = el("footer", "pied");
  const bt = el("button", "bouton", "> " + T.versTerminal[l]);
  bt.addEventListener("click", onTerminal);
  const bl = el("button", "bouton", l === "fr" ? "English" : "Français");
  bl.addEventListener("click", () => onLangue(l === "fr" ? "en" : "fr"));
  pied.append(bt, bl);
  racine.append(pied);
}
