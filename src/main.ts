// Le pilote du terminal : amorcage, saisie, historique, rendu.

import "./style.css";
import {
  cheminTexte, completer, etatInitial, executer, type Etat,
} from "./terminal";
import type { Bloc } from "./fs";

const etat: Etat = etatInitial();
const ecran = document.getElementById("ecran") as HTMLDivElement;
const saisie = document.getElementById("saisie") as HTMLInputElement;
const invite = document.getElementById("invite") as HTMLSpanElement;
const historique: string[] = [];
let curseurHisto = -1;

const BANNIERE = [
  "██╗  ██╗ █████╗ ███╗   ███╗███████╗ █████╗ ",
  "██║  ██║██╔══██╗████╗ ████║╚══███╔╝██╔══██╗",
  "███████║███████║██╔████╔██║  ███╔╝ ███████║",
  "██╔══██║██╔══██║██║╚██╔╝██║ ███╔╝  ██╔══██║",
  "██║  ██║██║  ██║██║ ╚═╝ ██║███████╗██║  ██║",
  "╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝",
];

function majInvite(): void {
  invite.innerHTML =
    `<span class="u">hamza@portfolio</span>:<span class="w">`
    + (cheminTexte(etat.chemin) || "/") + `</span>$&nbsp;`;
}

function ligneElement(b: Bloc): HTMLElement {
  if (b.type === "image") {
    const fig = document.createElement("figure");
    fig.className = "media";
    const img = document.createElement("img");
    img.src = b.src;
    img.alt = b.alt;
    img.loading = "lazy";
    fig.append(img);
    if (b.legende) {
      const cap = document.createElement("figcaption");
      cap.textContent = b.legende;
      fig.append(cap);
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

function ecrire(blocs: Bloc[]): void {
  for (const b of blocs) ecran.append(ligneElement(b));
}

function ecrireCommande(ligne: string): void {
  const p = document.createElement("p");
  p.className = "ligne echo";
  p.innerHTML =
    `<span class="u">hamza@portfolio</span>:<span class="w">`
    + (cheminTexte(etat.chemin) || "/") + `</span>$ `;
  p.append(document.createTextNode(ligne));
  ecran.append(p);
}

function defiler(): void {
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function soumettre(ligne: string): void {
  ecrireCommande(ligne);
  if (ligne.trim()) historique.unshift(ligne);
  curseurHisto = -1;
  const sortie = executer(ligne, etat);
  if (sortie === "clear") {
    ecran.replaceChildren();
  } else {
    ecrire(sortie);
    if (sortie.length) ecran.append(ligneElement({ type: "texte", texte: "" }));
  }
  majInvite();
  defiler();
}

saisie.addEventListener("keydown", (ev) => {
  if (ev.key === "Enter") {
    const v = saisie.value;
    saisie.value = "";
    soumettre(v);
  } else if (ev.key === "Tab") {
    ev.preventDefault();
    saisie.value = completer(saisie.value, etat);
  } else if (ev.key === "ArrowUp") {
    ev.preventDefault();
    if (curseurHisto + 1 < historique.length) {
      curseurHisto += 1;
      saisie.value = historique[curseurHisto];
    }
  } else if (ev.key === "ArrowDown") {
    ev.preventDefault();
    curseurHisto = Math.max(curseurHisto - 1, -1);
    saisie.value = curseurHisto < 0 ? "" : historique[curseurHisto];
  } else if (ev.key === "l" && ev.ctrlKey) {
    ev.preventDefault();
    ecran.replaceChildren();
  }
});

// Cliquer n'importe ou rend le focus au champ : on ne veut jamais taper
// dans le vide sur un site dont le seul moyen d'interaction est le clavier.
document.addEventListener("click", () => {
  if (!window.getSelection()?.toString()) saisie.focus();
});

/** Amorcage : la banniere apparait ligne par ligne, puis l'accueil. */
async function amorcer(): Promise<void> {
  const banniere = document.createElement("pre");
  banniere.className = "banniere";
  ecran.append(banniere);
  for (const l of BANNIERE) {
    banniere.textContent += l + "\n";
    await new Promise((r) => setTimeout(r, 70));
  }
  banniere.dataset.texte = banniere.textContent ?? "";
  await new Promise((r) => setTimeout(r, 180));
  ecrire([
    { type: "texte", texte: "" },
    {
      type: "texte",
      texte: "CS student · ships a project every two weeks · ROM hacker",
      classe: "sourdine",
    },
    { type: "texte", texte: "" },
    {
      type: "texte",
      texte: "Tape « help » pour la liste des commandes, « en » for English.",
    },
    { type: "texte", texte: "" },
  ]);
  majInvite();
  saisie.focus();
  rejouerLien();
}

/** Les commandes du fragment d'URL, separees par « ; ».
 *
 * Un terminal n'a pas d'adresses : impossible d'envoyer quelqu'un sur une
 * etude de cas precise. Le fragment repare ca — codebyhaamza.github.io/
 * #cat /projects/kagami/README.md ouvre directement la bonne page. */
function rejouerLien(): void {
  const brut = decodeURIComponent(location.hash.replace(/^#/, "")).trim();
  if (!brut) return;
  for (const c of brut.split(";").map((x) => x.trim()).filter(Boolean)) {
    soumettre(c);
  }
}

window.addEventListener("hashchange", rejouerLien);

void amorcer();
