// Un systeme de fichiers en memoire, construit depuis le contenu.
//
// Le terminal ne connait que cet arbre : il ne sait rien des projets ni des
// langues. Ajouter un projet dans contenu/donnees.ts le fait apparaitre
// sous /projects sans toucher a une seule commande.

import {
  A_PROPOS, GOUTS, LIENS, PILE, PROJETS, type Langue,
} from "./contenu/donnees";

/** Un morceau de sortie : du texte colore, une image, ou un lien. */
export type Bloc =
  | { type: "texte"; texte: string; classe?: string }
  | { type: "image"; src: string; alt: string; legende?: string }
  | { type: "lien"; texte: string; url: string };

export interface Noeud {
  nom: string;
  dossier: boolean;
  /** Taille affichee par `ls -l`. Decorative, mais coherente. */
  taille?: number;
  enfants?: Noeud[];
  /** Le contenu, recalcule a chaque changement de langue. */
  lire?: (l: Langue) => Bloc[];
  /** Cible de `open`. */
  url?: string;
}

const t = (texte: string, classe?: string): Bloc =>
  ({ type: "texte", texte, classe });

function pave(titre: string, lignes: string[]): Bloc[] {
  return [t(titre, "titre"), t(""), ...lignes.map((l) => t(l))];
}

function etudeDeCas(p: (typeof PROJETS)[number], l: Langue): Bloc[] {
  const enTete: Record<Langue, string[]> = {
    fr: ["LE PROBLEME", "L'APPROCHE", "LE PLUS DUR", "LA PREUVE"],
    en: ["THE PROBLEM", "THE APPROACH", "THE HARD PART", "THE PROOF"],
  };
  const champs = [p.etude.probleme, p.etude.approche, p.etude.difficile,
                  p.etude.preuve];
  const out: Bloc[] = [
    t(p.nom, "titre"),
    t(`${p.annee}   ${p.pile.join(" · ")}`, "sourdine"),
    t(""),
  ];
  enTete[l].forEach((h, i) => {
    out.push(t(h, "section-t"));
    out.push(...decouper(champs[i][l], 74).map((x) => t(x)));
    out.push(t(""));
  });
  for (const img of p.images ?? []) {
    out.push({ type: "image", src: img.src, alt: img.legende[l],
               legende: img.legende[l] });
  }
  out.push({ type: "lien", texte: "code  " + p.url, url: p.url });
  if (p.demo) out.push({ type: "lien", texte: "demo  " + p.demo, url: p.demo });
  return out;
}

/** Coupe un paragraphe a la largeur voulue, sans casser les mots. */
export function decouper(texte: string, largeur: number): string[] {
  const mots = texte.split(/\s+/);
  const lignes: string[] = [];
  let courante = "";
  for (const m of mots) {
    if (courante && (courante + " " + m).length > largeur) {
      lignes.push(courante);
      courante = m;
    } else {
      courante = courante ? courante + " " + m : m;
    }
  }
  if (courante) lignes.push(courante);
  return lignes;
}

export function construire(): Noeud {
  const projets: Noeud[] = PROJETS.map((p) => ({
    nom: p.id,
    dossier: true,
    enfants: [
      {
        nom: "README.md",
        dossier: false,
        taille: 2048,
        lire: (l: Langue) => etudeDeCas(p, l),
      },
      {
        nom: "links.txt",
        dossier: false,
        taille: 128,
        url: p.demo ?? p.url,
        lire: () => [
          { type: "lien", texte: "code  " + p.url, url: p.url },
          ...(p.demo
            ? [{ type: "lien" as const, texte: "demo  " + p.demo, url: p.demo }]
            : []),
        ],
      },
    ],
  }));

  return {
    nom: "/",
    dossier: true,
    enfants: [
      {
        nom: "about.txt",
        dossier: false,
        taille: 512,
        lire: (l) => A_PROPOS[l].map((x) => t(x)),
      },
      {
        nom: "stack.txt",
        dossier: false,
        taille: 768,
        lire: () => [
          t("stack", "titre"), t(""),
          ...PILE.map((c) =>
            t(c.cat.padEnd(15) + c.items.join(" · "))),
        ],
      },
      {
        nom: "contact.txt",
        dossier: false,
        taille: 256,
        lire: () => [
          t("contact", "titre"), t(""),
          ...LIENS.map((x) => ({
            type: "lien" as const,
            texte: x.nom.padEnd(12) + x.url,
            url: x.url,
          })),
        ],
      },
      { nom: "projects", dossier: true, enfants: projets },
      {
        nom: "fun",
        dossier: true,
        enfants: [
          {
            nom: "tastes.txt",
            dossier: false,
            taille: 384,
            lire: (l) => pave(l === "fr" ? "mes gouts" : "my taste", GOUTS[l]),
          },
          {
            nom: "tusk.gif",
            dossier: false,
            taille: 76156,
            lire: (l) => [
              {
                type: "image",
                src: "img/tusk.gif",
                alt: "Tusk, Steel Ball Run",
                legende: l === "fr"
                  ? "TUSK ACT 4 — Steel Ball Run, la meilleure partie. Pas de debat."
                  : "TUSK ACT 4 — Steel Ball Run, the best part. No debate.",
              },
            ],
          },
        ],
      },
    ],
  };
}

export function resoudre(racine: Noeud, chemin: string[]): Noeud | null {
  let n: Noeud = racine;
  for (const part of chemin) {
    if (!n.dossier || !n.enfants) return null;
    const suivant = n.enfants.find((e) => e.nom === part);
    if (!suivant) return null;
    n = suivant;
  }
  return n;
}

/** Normalise "a/../b", ".", les barres en trop, et les chemins absolus. */
export function normaliser(courant: string[], brut: string): string[] {
  const parts = brut.split("/").filter((p) => p.length > 0);
  const out = brut.startsWith("/") ? [] : [...courant];
  for (const p of parts) {
    if (p === ".") continue;
    if (p === "..") out.pop();
    else out.push(p);
  }
  return out;
}
