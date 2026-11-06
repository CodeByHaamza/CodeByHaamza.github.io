// La vue terminal : construit son interface, branche le clavier, et sait
// se demonter proprement quand on repasse en vue classique.

import {
  cheminTexte, completer, etatInitial, executer, type Etat,
} from "./terminal";
import type { Bloc } from "./fs";
import type { Langue } from "./contenu/donnees";

const BANNIERE = [
  "██╗  ██╗ █████╗ ███╗   ███╗███████╗ █████╗ ",
  "██║  ██║██╔══██╗████╗ ████║╚══███╔╝██╔══██╗",
  "███████║███████║██╔████╔██║  ███╔╝ ███████║",
  "██╔══██║██╔══██║██║╚██╔╝██║ ███╔╝  ██╔══██║",
  "██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║  ██║",
  "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝",
];

export function monterTerminal(
  hote: HTMLElement, langue: Langue, onQuitter: () => void,
  onLangue: (l: Langue) => void,
): () => void {
  const etat: Etat = etatInitial();
  etat.langue = langue;

  const racine = document.createElement("div");
  racine.id = "terminal";
  racine.innerHTML =
    '<div id="ecran"></div>'
    + '<div id="barreSaisie"><span id="invite"></span>'
    + '<input id="saisie" autocomplete="off" autocapitalize="off" '
    + 'autocorrect="off" spellcheck="false" aria-label="Ligne de commande"></div>';
  hote.append(racine);

  const ecran = racine.querySelector("#ecran") as HTMLDivElement;
  const saisie = racine.querySelector("#saisie") as HTMLInputElement;
  const invite = racine.querySelector("#invite") as HTMLSpanElement;
  const historique: string[] = [];
  let curseur = -1;
  let vivant = true;

  const inviteHtml = () =>
    '<span class="u">hamza@portfolio</span>:<span class="w">'
    + (cheminTexte(etat.chemin) || "/") + "</span>$&nbsp;";

  const majInvite = () => { invite.innerHTML = inviteHtml(); };

  function element(b: Bloc): HTMLElement {
    if (b.type === "image") {
      const fig = document.createElement("figure");
      fig.className = "media";
      const img = document.createElement("img");
      img.src = b.src;
      img.alt = b.alt;
      img.loading = "lazy";
      fig.append(img);
      if (b.legende) {
        const c = document.createElement("figcaption");
        c.textContent = b.legende;
        fig.append(c);
      }
      return fig;
    }
    if (b.type === "lien") {
      const p = document.createElement("p");
      p.className = "ligne";
      const a = document.createElement("a");
      a.href = b.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = b.texte;
      p.append(a);
      return p;
    }
    const p = document.createElement("p");
    p.className = "ligne" + (b.classe ? " " + b.classe : "");
    p.textContent = b.texte || " ";
    return p;
  }

  function soumettre(ligne: string): void {
    const echo = document.createElement("p");
    echo.className = "ligne echo";
    echo.innerHTML = inviteHtml();
    echo.append(document.createTextNode(ligne));
    ecran.append(echo);

    if (ligne.trim()) historique.unshift(ligne);
    curseur = -1;

    const avant = etat.langue;
    const sortie = executer(ligne, etat);
    if (sortie === "clear") {
      ecran.replaceChildren();
    } else {
      for (const b of sortie) ecran.append(element(b));
      if (sortie.length) ecran.append(element({ type: "texte", texte: "" }));
    }
    if (etat.langue !== avant) onLangue(etat.langue);
    majInvite();
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }

  const auClavier = (ev: KeyboardEvent) => {
    if (ev.key === "Enter") {
      const v = saisie.value;
      saisie.value = "";
      soumettre(v);
    } else if (ev.key === "Tab") {
      ev.preventDefault();
      saisie.value = completer(saisie.value, etat);
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      if (curseur + 1 < historique.length) saisie.value = historique[++curseur];
    } else if (ev.key === "ArrowDown") {
      ev.preventDefault();
      curseur = Math.max(curseur - 1, -1);
      saisie.value = curseur < 0 ? "" : historique[curseur];
    } else if (ev.key === "l" && ev.ctrlKey) {
      ev.preventDefault();
      ecran.replaceChildren();
    }
  };
  saisie.addEventListener("keydown", auClavier);

  // Cliquer n'importe ou rend le focus au champ : sur une vue dont le seul
  // moyen d'agir est le clavier, taper dans le vide est deroutant.
  const auClic = () => {
    if (vivant && !window.getSelection()?.toString()) saisie.focus();
  };
  racine.addEventListener("click", auClic);

  function rejouerLien(): void {
    const brut = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
    if (!brut || brut === "terminal") return;
    for (const c of brut.split(";").map((x) => x.trim()).filter(Boolean)) {
      soumettre(c);
    }
  }
  window.addEventListener("hashchange", rejouerLien);

  void (async () => {
    const pre = document.createElement("pre");
    pre.className = "banniere";
    ecran.append(pre);
    for (const l of BANNIERE) {
      if (!vivant) return;
      pre.textContent += l + "\n";
      await new Promise((r) => setTimeout(r, 60));
    }
    pre.dataset.texte = pre.textContent ?? "";
    if (!vivant) return;
    for (const b of [
      { type: "texte" as const, texte: "" },
      {
        type: "texte" as const, classe: "sourdine",
        texte: etat.langue === "fr"
          ? "Tape « help » pour les commandes, « exit » pour revenir au site."
          : "Type \"help\" for commands, \"exit\" to go back to the site.",
      },
      { type: "texte" as const, texte: "" },
    ]) ecran.append(element(b));
    majInvite();
    saisie.focus();
    rejouerLien();
  })();

  majInvite();

  // `exit` et `quit` reviennent a la vue classique. Ils sont branches ici
  // plutot que dans terminal.ts : seule la vue sait comment se refermer.
  const surSortie = (ev: Event) => {
    const d = (ev as CustomEvent<string>).detail;
    if (d === "exit") onQuitter();
  };
  window.addEventListener("terminal:sortie", surSortie);

  return () => {
    vivant = false;
    saisie.removeEventListener("keydown", auClavier);
    racine.removeEventListener("click", auClic);
    window.removeEventListener("hashchange", rejouerLien);
    window.removeEventListener("terminal:sortie", surSortie);
    racine.remove();
  };
}
