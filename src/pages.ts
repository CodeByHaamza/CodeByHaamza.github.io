// Les pages du site. Chacune renvoie son contenu ; la navigation et le
// pied sont ajoutes par le routeur.

import {
  A_PROPOS, GOUTS, LIENS, PILE, PROJETS, type Langue, type Projet,
} from "./contenu/donnees";
import stats from "../data/github.json";
import { compteur, el, lien, reveler } from "./ui";

const T = {
  voirTout: { fr: "Tous les projets", en: "All projects" },
  enVedette: { fr: "Sélection", en: "Selected work" },
  lire: { fr: "Lire l'étude de cas", en: "Read the case study" },
  code: { fr: "Code source", en: "Source" },
  demo: { fr: "Essayer en ligne", en: "Try it live" },
  retour: { fr: "Tous les projets", en: "All projects" },
  probleme: { fr: "Le problème", en: "The problem" },
  approche: { fr: "L'approche", en: "The approach" },
  difficile: { fr: "Le plus dur", en: "The hard part" },
  preuve: { fr: "La preuve", en: "The proof" },
  chiffres: { fr: "En chiffres", en: "By the numbers" },
  commits: { fr: "commits sur un an", en: "commits this year" },
  etoiles: { fr: "étoiles cumulées", en: "stars earned" },
  depots: { fr: "dépôts publics", en: "public repos" },
  serie: { fr: "jours de série", en: "day streak" },
  langages: { fr: "Langages, dépôts publics", en: "Languages, public repos" },
  parler: { fr: "On en parle ?", en: "Let's talk" },
  parlerTexte: {
    fr: "Une question sur un projet, une idée de collaboration, ou juste envie d'échanger : écris-moi.",
    en: "A question about a project, an idea to build together, or just a chat: drop me a line.",
  },
  ecrire: { fr: "M'écrire", en: "Email me" },
  stack: { fr: "Ce avec quoi je travaille", en: "What I work with" },
  horsCode: { fr: "Hors du code", en: "Away from the code" },
  contactTitre: { fr: "Me joindre", en: "Get in touch" },
  aproposTitre: { fr: "À propos", en: "About" },
  projetsTitre: { fr: "Projets", en: "Work" },
  projetsIntro: {
    fr: "Quatre projets menés jusqu'au bout, chacun avec son étude de cas : le problème, l'approche, ce qui a coûté cher, et ce que ça prouve.",
    en: "Four projects taken all the way, each with a case study: the problem, the approach, what it cost, and what it proves.",
  },
} satisfies Record<string, Record<Langue, string>>;

function titreSection(sur: string, titre: string): HTMLElement {
  const d = el("div", "titre-section");
  d.append(el("p", "surtitre", sur), el("h2", undefined, titre));
  return d;
}

function carte(p: Projet, l: Langue, rang: number): HTMLElement {
  const a = el("a", "carte");
  a.href = `/projets/${p.id}`;
  const haut = el("div", "carte-haut");
  haut.append(el("h3", undefined, p.nom), el("span", "carte-annee", p.annee));
  a.append(haut);
  a.append(el("p", "carte-resume", p.resume[l]));
  const puces = el("ul", "puces");
  for (const x of p.pile.slice(0, 4)) puces.append(el("li", undefined, x));
  a.append(puces);
  const fleche = el("span", "carte-fleche", T.lire[l]);
  a.append(fleche);
  return reveler(a, rang);
}

/* ------------------------------------------------------------ accueil */

export function pageAccueil(l: Langue): HTMLElement {
  const f = document.createElement("div");

  // --- hero
  const hero = el("section", "hero");
  const h1 = el("h1", "hero-titre");
  const l1 = el("span", "l", l === "fr" ? "Je construis" : "I build");
  const l2 = el("span", "l", l === "fr" ? "des choses" : "small complete");
  const l3 = el("span", "l accent", l === "fr" ? "finies." : "things.");
  h1.append(l1, l2, l3);
  hero.append(h1);
  hero.append(el("p", "hero-texte",
    l === "fr"
      ? "Hamza Karrouchi — étudiant en informatique en alternance. Un jeu joué tous les jours, un moteur de reconnaissance de gestes, et des traductions françaises de jeux que personne n'avait traduits."
      : "Hamza Karrouchi — CS student, work-study. A game played every day, a gesture recognition engine, and French translations of games nobody had translated."));
  const actions = el("div", "hero-actions");
  const a1 = lien("/projets", T.voirTout[l], "btn btn-plein");
  const a2 = lien("/contact", T.parler[l], "btn");
  actions.append(a1, a2);
  hero.append(actions);
  f.append(hero);

  // --- selection
  const sel = el("section", "section");
  sel.append(reveler(titreSection(T.enVedette[l], T.projetsTitre[l])));
  const grille = el("div", "grille");
  PROJETS.slice(0, 3).forEach((p, i) => grille.append(carte(p, l, i)));
  sel.append(grille);
  const plus = el("div", "centre");
  plus.append(lien("/projets", T.voirTout[l], "btn"));
  sel.append(reveler(plus, 3));
  f.append(sel);

  // --- chiffres
  f.append(sectionChiffres(l));

  // --- contact
  const cta = el("section", "section cta");
  const bloc = el("div", "cta-bloc");
  bloc.append(el("h2", undefined, T.parler[l]));
  bloc.append(el("p", undefined, T.parlerTexte[l]));
  const mail = LIENS.find((x) => x.nom === "mail")!;
  bloc.append(lien(mail.url, T.ecrire[l], "btn btn-plein"));
  cta.append(reveler(bloc));
  f.append(cta);

  return f;
}

function sectionChiffres(l: Langue): HTMLElement {
  const s = el("section", "section");
  s.append(reveler(titreSection(T.chiffres[l],
    l === "fr" ? "Ce que ça représente" : "What that adds up to")));

  const tuiles = el("div", "tuiles");
  const data: [number, string][] = [
    [stats.commits, T.commits[l]],
    [stats.etoiles, T.etoiles[l]],
    [stats.depots, T.depots[l]],
    [stats.serie, T.serie[l]],
  ];
  data.forEach(([v, k], i) => {
    const t = el("div", "tuile");
    const n = el("strong");
    t.append(n, el("span", undefined, k));
    compteur(n, v, l);
    tuiles.append(reveler(t, i));
  });
  s.append(tuiles);

  const barres = el("div", "langages");
  barres.append(el("p", "surtitre", T.langages[l]));
  const max = Math.max(...stats.langages.map((x) => x.part), 1);
  stats.langages.forEach((lg, i) => {
    const r = el("div", "langue");
    r.append(el("span", "langue-nom", lg.nom));
    const piste = el("div", "piste");
    const rempli = el("div", "rempli");
    rempli.style.setProperty("--part", `${(lg.part / max) * 100}%`);
    piste.append(rempli);
    r.append(piste, el("span", "langue-part", `${lg.part.toFixed(1)}%`));
    barres.append(reveler(r, i));
  });
  s.append(barres);
  return s;
}

/* ------------------------------------------------------------ projets */

export function pageProjets(l: Langue): HTMLElement {
  const f = document.createElement("div");
  const s = el("section", "section section-haut");
  s.append(reveler(titreSection(T.projetsTitre[l],
    l === "fr" ? "Quatre projets, quatre terrains" : "Four projects, four grounds")));
  const intro = el("p", "intro", T.projetsIntro[l]);
  s.append(reveler(intro, 1));
  const grille = el("div", "grille");
  PROJETS.forEach((p, i) => grille.append(carte(p, l, i)));
  s.append(grille);
  f.append(s);
  return f;
}

export function pageProjet(id: string, l: Langue): HTMLElement | null {
  const p = PROJETS.find((x) => x.id === id);
  if (!p) return null;
  const f = document.createElement("div");
  const s = el("article", "section section-haut etude");

  const retour = lien("/projets", "← " + T.retour[l], "retour");
  s.append(retour);

  const tete = el("header", "etude-tete");
  tete.append(el("h1", undefined, p.nom));
  tete.append(el("p", "etude-resume", p.resume[l]));
  const meta = el("div", "etude-meta");
  const puces = el("ul", "puces");
  for (const x of p.pile) puces.append(el("li", undefined, x));
  meta.append(puces, el("span", "carte-annee", p.annee));
  tete.append(meta);
  const actions = el("div", "hero-actions");
  if (p.demo) actions.append(lien(p.demo, T.demo[l], "btn btn-plein"));
  actions.append(lien(p.url, T.code[l], "btn"));
  tete.append(actions);
  s.append(reveler(tete));

  const champs: [string, string][] = [
    [T.probleme[l], p.etude.probleme[l]],
    [T.approche[l], p.etude.approche[l]],
    [T.difficile[l], p.etude.difficile[l]],
    [T.preuve[l], p.etude.preuve[l]],
  ];
  champs.forEach(([h, corps], i) => {
    const bloc = el("section", "etude-bloc");
    bloc.append(el("h2", undefined, h), el("p", undefined, corps));
    s.append(reveler(bloc, i));
  });

  for (const img of p.images ?? []) {
    const fig = el("figure", "etude-figure");
    const i = el("img");
    i.src = img.src;
    i.alt = img.legende[l];
    i.loading = "lazy";
    fig.append(i, el("figcaption", undefined, img.legende[l]));
    s.append(reveler(fig, 4));
  }

  // --- projet suivant
  const idx = PROJETS.indexOf(p);
  const suivant = PROJETS[(idx + 1) % PROJETS.length];
  const nav = el("div", "suivant");
  nav.append(el("p", "surtitre", l === "fr" ? "Projet suivant" : "Next project"));
  const a = lien(`/projets/${suivant.id}`, suivant.nom, "suivant-lien");
  nav.append(a);
  s.append(reveler(nav, 5));

  f.append(s);
  return f;
}

/* ------------------------------------------------------------ a propos */

export function pageAPropos(l: Langue): HTMLElement {
  const f = document.createElement("div");
  const s = el("section", "section section-haut");
  s.append(reveler(titreSection(T.aproposTitre[l],
    l === "fr" ? "Qui je suis" : "Who I am")));

  const texte = el("div", "prose");
  for (const para of A_PROPOS[l].join("\n").split("\n\n")) {
    texte.append(el("p", undefined, para.replace(/\n/g, " ")));
  }
  s.append(reveler(texte, 1));
  f.append(s);

  const st = el("section", "section");
  st.append(reveler(titreSection(T.stack[l],
    l === "fr" ? "Le stack" : "The stack")));
  const pile = el("div", "pile");
  PILE.forEach((c, i) => {
    const r = el("div", "pile-ligne");
    r.append(el("h3", undefined, c.cat));
    const ul = el("ul", "puces");
    for (const x of c.items) ul.append(el("li", undefined, x));
    r.append(ul);
    pile.append(reveler(r, i));
  });
  st.append(pile);
  f.append(st);

  const fu = el("section", "section");
  fu.append(reveler(titreSection(T.horsCode[l],
    l === "fr" ? "Ce qui nourrit le reste" : "What feeds the rest")));
  const cols = el("div", "deux-colonnes");
  const ul = el("ul", "gouts");
  for (const g of GOUTS[l]) {
    const i = g.indexOf("  ");
    const li = el("li");
    li.append(el("strong", undefined, g.slice(0, i).trim()),
              el("span", undefined, g.slice(i).trim()));
    ul.append(li);
  }
  cols.append(reveler(ul));
  const fig = el("figure", "etude-figure");
  const img = el("img");
  img.src = "img/tusk.gif";
  img.alt = "Tusk, Steel Ball Run";
  img.loading = "lazy";
  fig.append(img, el("figcaption", undefined,
    l === "fr"
      ? "TUSK ACT 4 — Steel Ball Run, la meilleure partie. Pas de débat."
      : "TUSK ACT 4 — Steel Ball Run, the best part. No debate."));
  cols.append(reveler(fig, 1));
  fu.append(cols);
  f.append(fu);

  return f;
}

/* ------------------------------------------------------------ contact */

export function pageContact(l: Langue): HTMLElement {
  const f = document.createElement("div");
  const s = el("section", "section section-haut");
  s.append(reveler(titreSection(T.contactTitre[l], T.parler[l])));
  s.append(reveler(el("p", "intro", T.parlerTexte[l]), 1));

  const liste = el("div", "contacts");
  LIENS.forEach((x, i) => {
    const a = lien(x.url, "", "contact-ligne");
    a.textContent = "";
    a.append(el("span", "contact-nom", x.nom));
    a.append(el("span", "contact-url", x.url.replace(/^mailto:/, "")));
    a.append(el("span", "contact-fleche", "↗"));
    liste.append(reveler(a, i));
  });
  s.append(liste);
  f.append(s);
  return f;
}
