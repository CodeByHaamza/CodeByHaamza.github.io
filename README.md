# codebyhaamza.github.io

Mon portfolio, sous forme de terminal. On navigue en tapant des commandes :
`help`, `ls`, `cd`, `cat`, `tree`, `open`, `stats`, `neofetch`.

- **`src/contenu/donnees.ts`** — tout le contenu, en français et en anglais.
  Ajouter un projet ici le fait apparaître sous `/projects` sans toucher au
  shell.
- **`src/fs.ts`** — le système de fichiers virtuel, construit depuis ce
  contenu.
- **`src/terminal.ts`** — l'analyse des commandes et leur exécution.
- **`outils/chiffres.mjs`** — appelle l'API GitHub avant chaque build et
  écrit `data/github.json`. Les chiffres sont donc figés à la construction :
  aucune clé exposée, aucun quota consommé chez le visiteur, et la page
  s'affiche même si GitHub est en panne. Le workflow reconstruit chaque jour.

Les liens profonds passent par le fragment d'URL : `#cat /projects/kagami/README.md`
ouvre directement l'étude de cas.

```sh
npm install
npm run dev
```
