// Le shell : analyse la ligne, execute, rend la sortie.
//
// Les commandes sont des fonctions pures qui renvoient des Blocs. Le rendu
// est au meme endroit pour tout le monde, donc une commande n'a jamais a
// savoir comment on affiche une image ou un lien.

import { construire, decouper, normaliser, resoudre, type Bloc, type Noeud }
  from "./fs";
import { LIENS, PROJETS, type Langue } from "./contenu/donnees";
import stats from "../data/github.json";

const t = (texte: string, classe?: string): Bloc =>
  ({ type: "texte", texte, classe });

export interface Etat {
  langue: Langue;
  chemin: string[];
  racine: Noeud;
}

type Commande = (args: string[], e: Etat) => Bloc[];

const TEXTES = {
  inconnue: {
    fr: (c: string) => `${c} : commande inconnue. Tape « help ».`,
    en: (c: string) => `${c}: command not found. Try "help".`,
  },
  absent: {
    fr: (c: string) => `${c} : aucun fichier de ce nom`,
    en: (c: string) => `${c}: no such file or directory`,
  },
  pasUnDossier: {
    fr: (c: string) => `${c} : n'est pas un dossier`,
    en: (c: string) => `${c}: not a directory`,
  },
  estUnDossier: {
    fr: (c: string) => `${c} : est un dossier`,
    en: (c: string) => `${c}: is a directory`,
  },
  aide: {
    fr: [
      ["help", "cette liste"],
      ["ls [chemin]", "lister"],
      ["cd <chemin>", "se deplacer"],
      ["cat <fichier>", "lire"],
      ["tree", "tout l'arbre d'un coup"],
      ["open <nom>", "ouvrir un projet dans un onglet"],
      ["stats", "mes chiffres GitHub, tires de l'API"],
      ["neofetch", "ma machine"],
      ["whoami", "en un mot"],
      ["fr | en", "changer de langue"],
      ["clear", "nettoyer l'ecran"],
      ["exit", "revenir au site"],
    ],
    en: [
      ["help", "this list"],
      ["ls [path]", "list"],
      ["cd <path>", "move around"],
      ["cat <file>", "read"],
      ["tree", "the whole tree at once"],
      ["open <name>", "open a project in a tab"],
      ["stats", "my GitHub numbers, straight from the API"],
      ["neofetch", "my machine"],
      ["whoami", "in one word"],
      ["fr | en", "switch language"],
      ["clear", "wipe the screen"],
      ["exit", "back to the site"],
    ],
  },
  astuce: {
    fr: "Tab complete, les fleches rappellent l'historique. Commence par « ls ».",
    en: "Tab completes, arrows recall history. Start with \"ls\".",
  },
};

function cheminTexte(c: string[]): string {
  return "/" + c.join("/");
}

const CMD: Record<string, Commande> = {
  help: (_a, e) => [
    t(e.langue === "fr" ? "Commandes" : "Commands", "titre"),
    t(""),
    ...TEXTES.aide[e.langue].map(([c, d]) => t("  " + c.padEnd(16) + d)),
    t(""),
    t(TEXTES.astuce[e.langue], "sourdine"),
  ],

  ls: (args, e) => {
    const cible = normaliser(e.chemin, args[0] ?? ".");
    const n = resoudre(e.racine, cible);
    if (!n) return [t(TEXTES.absent[e.langue](args[0] ?? "."), "erreur")];
    if (!n.dossier) return [t(n.nom)];
    return (n.enfants ?? []).map((c) =>
      t(
        (c.dossier ? "d  " : "-  ")
        + (c.dossier ? c.nom + "/" : c.nom).padEnd(18)
        + (c.dossier ? "" : String(c.taille ?? 0).padStart(7)),
        c.dossier ? "dossier" : "fichier",
      ));
  },

  cd: (args, e) => {
    const brut = args[0] ?? "/";
    const cible = normaliser(e.chemin, brut);
    const n = resoudre(e.racine, cible);
    if (!n) return [t(TEXTES.absent[e.langue](brut), "erreur")];
    if (!n.dossier) return [t(TEXTES.pasUnDossier[e.langue](brut), "erreur")];
    e.chemin = cible;
    return [];
  },

  cat: (args, e) => {
    if (!args[0]) return [t("cat: " + (e.langue === "fr" ? "quel fichier ?" : "which file?"), "erreur")];
    const n = resoudre(e.racine, normaliser(e.chemin, args[0]));
    if (!n) return [t(TEXTES.absent[e.langue](args[0]), "erreur")];
    if (n.dossier) return [t(TEXTES.estUnDossier[e.langue](args[0]), "erreur")];
    return n.lire ? n.lire(e.langue) : [];
  },

  tree: (_a, e) => {
    const out: Bloc[] = [];
    const marche = (n: Noeud, prefixe: string, dernier: boolean) => {
      if (n !== e.racine) {
        out.push(t(prefixe + (dernier ? "└── " : "├── ")
                   + n.nom + (n.dossier ? "/" : ""),
                   n.dossier ? "dossier" : "fichier"));
      }
      const enfants = n.enfants ?? [];
      enfants.forEach((c, i) =>
        marche(c, n === e.racine ? "" : prefixe + (dernier ? "    " : "│   "),
               i === enfants.length - 1));
    };
    out.push(t(".", "dossier"));
    marche(e.racine, "", true);
    return out;
  },

  pwd: (_a, e) => [t(cheminTexte(e.chemin) || "/")],

  open: (args, e) => {
    const nom = (args[0] ?? "").replace(/\/$/, "");
    const p = PROJETS.find((x) => x.id === nom || x.nom.toLowerCase() === nom);
    const url = p ? (p.demo ?? p.url)
      : LIENS.find((x) => x.nom === nom)?.url;
    if (!url) {
      return [t(e.langue === "fr"
        ? `open : « ${nom} » ne mene nulle part. Essaie « ls /projects ».`
        : `open: "${nom}" goes nowhere. Try "ls /projects".`, "erreur")];
    }
    window.open(url, "_blank", "noopener");
    return [t((e.langue === "fr" ? "ouverture de " : "opening ") + url,
              "sourdine")];
  },

  stats: (_a, e) => [
    t(e.langue === "fr" ? "Chiffres GitHub" : "GitHub numbers", "titre"),
    t(stats.releve, "sourdine"),
    t(""),
    t("commits".padEnd(16) + stats.commits.toLocaleString("fr-FR")),
    t("etoiles".padEnd(16) + stats.etoiles),
    t("depots".padEnd(16) + stats.depots),
    t("pull requests".padEnd(16) + stats.prs),
    t((e.langue === "fr" ? "serie" : "streak").padEnd(16)
      + stats.serie + (e.langue === "fr" ? " jours" : " days")),
    t("contributions".padEnd(16) + stats.contributions + " / 12 mo"),
    t(""),
    ...(() => {
      // Barres relatives au plus gros langage et bornees a 18 colonnes :
      // en absolu, une part de 54 % debordait sur le pourcentage.
      const max = Math.max(...stats.langages.map((l) => l.part), 1);
      return stats.langages.map((l) =>
        t("  " + l.nom.padEnd(14)
          + "█".repeat(Math.max(1, Math.round((l.part / max) * 18)))
            .padEnd(19)
          + l.part.toFixed(1).padStart(4) + " %", "barre"));
    })(),
  ],

  neofetch: (_a, e) => [
    t("hamza@PC-HAMZA", "titre"),
    t("─".repeat(44), "sourdine"),
    ...[
      ["os", "Windows 11 Home · build 26300"],
      ["cpu", "AMD Ryzen 9 9950X3D (16c / 32t)"],
      ["gpu", "NVIDIA RTX 5080 · 16 GB GDDR7"],
      ["ram", "32 GB G.Skill DDR5-6000 CL36"],
      ["disk", "2× 990 EVO Plus 2 TB · IronWolf 8 TB"],
      ["shell", "pwsh 7 + oh-my-posh"],
      ["server", "karrouchi-server · Ubuntu 26.04"],
      [e.langue === "fr" ? "monte en" : "built in",
       e.langue === "fr" ? "8 ans d'economies, piece par piece"
                         : "8 years of saving, part by part"],
    ].map(([k, v]) => t(k.padEnd(10) + v)),
  ],

  whoami: (_a, e) => [
    t("hamza", "titre"),
    t(e.langue === "fr"
      ? "etudiant en informatique · livre un projet toutes les deux semaines · rom hacker"
      : "cs student · ships a project every two weeks · rom hacker", "sourdine"),
  ],

  sudo: (_a, e) => [
    t(e.langue === "fr"
      ? "Belle tentative. Tu n'es pas dans le fichier sudoers. L'incident sera signale."
      : "Nice try. You are not in the sudoers file. This incident will be reported.",
      "erreur"),
  ],
};

export function completer(ligne: string, e: Etat): string {
  const morceaux = ligne.split(/\s+/);
  const dernier = morceaux[morceaux.length - 1] ?? "";
  const candidats: string[] = morceaux.length <= 1
    ? [...Object.keys(CMD), "clear", "fr", "en"]
    : (resoudre(e.racine, normaliser(e.chemin, dernier.includes("/")
        ? dernier.slice(0, dernier.lastIndexOf("/")) : "."))?.enfants ?? [])
        .map((c) => {
          const base = dernier.includes("/")
            ? dernier.slice(0, dernier.lastIndexOf("/") + 1) : "";
          return base + c.nom + (c.dossier ? "/" : "");
        });
  const ok = candidats.filter((c) => c.startsWith(dernier));
  if (ok.length !== 1) return ligne;
  morceaux[morceaux.length - 1] = ok[0];
  return morceaux.join(" ");
}

export function executer(ligne: string, e: Etat): Bloc[] | "clear" {
  const brut = ligne.trim();
  if (!brut) return [];
  const [nom, ...args] = brut.split(/\s+/);
  if (nom === "clear") return "clear";
  if (nom === "fr" || nom === "en") {
    e.langue = nom;
    return [t(nom === "fr" ? "Langue : francais." : "Language: English.",
              "sourdine")];
  }
  if (nom === "exit" || nom === "quit") {
    // La vue ecoute cet evenement : elle seule sait se refermer.
    window.dispatchEvent(new CustomEvent("terminal:sortie", { detail: "exit" }));
    return [];
  }
  const cmd = CMD[nom];
  if (!cmd) return [t(TEXTES.inconnue[e.langue](nom), "erreur")];
  return cmd(args, e);
}

export function etatInitial(): Etat {
  return { langue: "fr", chemin: [], racine: construire() };
}

export { cheminTexte, decouper };
