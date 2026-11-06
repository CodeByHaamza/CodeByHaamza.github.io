# codebyhaamza.github.io

Mon site. Deux vues sur **le même contenu**.

**La vue classique**, par défaut : une page qui se lit en défilant — à propos,
projets avec leur étude de cas repliée, stack, chiffres GitHub, hors du code,
contact.

**La vue terminal**, en option : on y navigue en tapant `help`, `ls`, `cd`,
`cat`, `tree`, `open`, `stats`, `neofetch`, `exit`. On y entre par le bouton
en haut à droite, par la touche `~`, ou par l'adresse `#terminal`.

Les deux lisent `src/contenu/donnees.ts` : ajouter un projet là le fait
apparaître des deux côtés, en français et en anglais, sans rien dupliquer.

| | |
|---|---|
| `src/contenu/donnees.ts` | tout le contenu, dans les deux langues |
| `src/classique.ts` | la page qui défile |
| `src/vue-terminal.ts` | l'interface du terminal |
| `src/terminal.ts` | l'analyse et l'exécution des commandes |
| `src/fs.ts` | le système de fichiers virtuel |
| `outils/chiffres.mjs` | appelle l'API GitHub avant chaque build |

Les chiffres sont figés à la construction dans `data/github.json` : aucune clé
exposée, aucun quota consommé chez le visiteur, et la page s'affiche même si
GitHub est en panne. Le workflow reconstruit chaque jour.

Les liens profonds passent par le fragment d'URL :
`#cat /projects/kagami/README.md` ouvre le terminal sur l'étude de cas.

```sh
npm install
npm run dev
```
