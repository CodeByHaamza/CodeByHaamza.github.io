// Ecrit un index.html a chaque adresse du site, apres le build.
//
// GitHub Pages n'a pas de reecriture d'URL. Sans ces fichiers, /projets
// tombe sur 404.html : la page s'affiche quand meme et le routeur prend la
// main, mais le serveur repond 404. Un moteur de recherche n'indexe pas
// une 404, et la plupart des generateurs d'apercu de lien (Discord,
// LinkedIn) ignorent la page. Un lien vers une etude de cas n'aurait donc
// aucun apercu.
//
// En posant un vrai fichier a chaque chemin, Pages repond 200 partout.
// 404.html reste la pour les adresses reellement inconnues.

import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const DIST = "dist";
const SOURCE = join(DIST, "index.html");

const donnees = await readFile("src/contenu/donnees.ts", "utf8");
const ids = [...donnees.matchAll(/^\s{4}id:\s*"([a-z0-9-]+)"/gm)]
  .map((m) => m[1]);

if (ids.length === 0) {
  // Si le format de donnees.ts change, mieux vaut casser le build que
  // publier un site dont la moitie des pages repond 404 en silence.
  console.error("routes : aucun projet trouve dans donnees.ts");
  process.exit(1);
}

const chemins = [
  "projets",
  "a-propos",
  "contact",
  ...ids.map((id) => `projets/${id}`),
];

for (const c of chemins) {
  const cible = join(DIST, c, "index.html");
  await mkdir(dirname(cible), { recursive: true });
  await copyFile(SOURCE, cible);
}

// Pour tout le reste : l'application demarre et affiche sa page 404.
await copyFile(SOURCE, join(DIST, "404.html"));

console.log(`routes : ${chemins.length} pages ecrites (${ids.join(", ")})`);
