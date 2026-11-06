# codebyhaamza.github.io

Mon site : quatre pages, de vraies adresses, et une vue terminal en bonus.

| Page | |
|---|---|
| `/` | accroche, sélection de projets, chiffres GitHub, contact |
| `/projets` | les quatre projets |
| `/projets/:id` | l'étude de cas — le problème, l'approche, le plus dur, la preuve |
| `/a-propos` | parcours, stack, hors du code |
| `/contact` | les liens |

La **vue terminal** s'ouvre par le bouton `_terminal`, la touche `~`, ou une
adresse avec un fragment. `exit` en ressort.

| Fichier | |
|---|---|
| `src/contenu/donnees.ts` | tout le contenu, FR et EN. Ajouter un projet ici l'affiche partout |
| `src/pages.ts` | les pages du site |
| `src/ui.ts` | navigation, pied, apparitions au défilement, compteurs |
| `src/main.ts` | le routeur |
| `src/terminal.ts`, `src/fs.ts`, `src/vue-terminal.ts` | la vue terminal |
| `outils/chiffres.mjs` | appelle l'API GitHub avant chaque build |

**Les polices sont embarquées** (`@fontsource`) : aucun appel à Google, donc
rien à charger ailleurs ni à tracer.

**Les chiffres sont figés à la construction** dans `data/github.json` : aucune
clé exposée, aucun quota consommé chez le visiteur, et la page s'affiche même
si GitHub est en panne. Le workflow reconstruit chaque jour. Les langages ne
comptent que les dépôts publics.

```sh
npm install
npm run dev
```
