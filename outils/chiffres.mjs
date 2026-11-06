// Recupere mes chiffres GitHub et les ecrit dans data/github.json.
//
// Appele avant chaque build. Le site embarque donc des valeurs figees au
// moment de la construction, plutot que d'appeler l'API chez le visiteur :
// pas de cle a exposer, pas de quota a epuiser, et la page s'affiche meme
// si GitHub est en panne. Le workflow reconstruit tous les jours.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const LOGIN = process.env.GH_LOGIN ?? "CodeByHaamza";

const REQUETE = `
query {
  user(login: "${LOGIN}") {
    followers { totalCount }
    contributionsCollection {
      totalCommitContributions restrictedContributionsCount
      totalPullRequestContributions
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount } }
      }
    }
    repositories(first: 100, ownerAffiliations: OWNER, isFork: false) {
      totalCount
      nodes {
        isPrivate
        stargazerCount
        languages(first: 12, orderBy: {field: SIZE, direction: DESC}) {
          edges { size node { name } }
        }
      }
    }
  }
}`;

function series(semaines) {
  const jours = semaines.flatMap((s) => s.contributionDays);
  let record = 0;
  let suite = 0;
  for (const j of jours) {
    suite = j.contributionCount > 0 ? suite + 1 : 0;
    record = Math.max(record, suite);
  }
  let actuelle = 0;
  for (let i = jours.length - 1; i >= 0; i -= 1) {
    if (jours[i].contributionCount > 0) actuelle += 1;
    // On tolere un dernier jour vide : la journee n'est pas finie.
    else if (actuelle > 0) break;
  }
  return { actuelle, record };
}

const brut = execFileSync("gh", ["api", "graphql", "-f", `query=${REQUETE}`], {
  encoding: "utf8",
  maxBuffer: 32 * 1024 * 1024,
});
const u = JSON.parse(brut).data.user;
const cc = u.contributionsCollection;
const depots = u.repositories.nodes;

// Les langages ne comptent QUE les depots publics. Avec les prives, un
// seul gros depot professionnel en HTML ecrasait tout le classement a 54 %,
// ce qui est faux pour un visiteur et renseigne sur du code qu'il ne verra
// jamais. Les commits, eux, incluent bien les contributions privees : c'est
// un volume, pas une composition.
const tailles = new Map();
for (const r of depots.filter((d) => !d.isPrivate)) {
  for (const e of r.languages.edges) {
    tailles.set(e.node.name, (tailles.get(e.node.name) ?? 0) + e.size);
  }
}
const total = [...tailles.values()].reduce((a, b) => a + b, 0) || 1;
const classes = [...tailles.entries()].sort((a, b) => b[1] - a[1]);
const langages = classes.slice(0, 6)
  .map(([nom, v]) => ({ nom: nom.toLowerCase(), part: (v * 100) / total }));
const reste = classes.slice(6).reduce((a, [, v]) => a + v, 0);
if (reste / total > 0.004) {
  langages.push({ nom: "autres", part: (reste * 100) / total });
}

const { actuelle, record } = series(cc.contributionCalendar.weeks);

// Les 71 etoiles de l'organisation Grimoire du Coeur ne sont pas comptees
// par cette requete, qui ne regarde que mes depots personnels.
const ETOILES_ORG = 71;

const sortie = {
  releve: new Date().toISOString().slice(0, 10),
  commits: cc.totalCommitContributions + cc.restrictedContributionsCount,
  prs: cc.totalPullRequestContributions,
  etoiles: depots.reduce((a, r) => a + r.stargazerCount, 0) + ETOILES_ORG,
  // Publics seulement : annoncer 14 depots quand un visiteur n'en voit
  // que 8 est trompeur, et le compte incluait un depot professionnel.
  depots: depots.filter((d) => !d.isPrivate).length,
  abonnes: u.followers.totalCount,
  contributions: cc.contributionCalendar.totalContributions,
  serie: actuelle,
  serieRecord: record,
  langages,
};

mkdirSync("data", { recursive: true });
writeFileSync("data/github.json", JSON.stringify(sortie, null, 2) + "\n");
console.log(
  `chiffres : ${sortie.commits} commits, ${sortie.etoiles} etoiles, `
  + `serie ${sortie.serie} j, ${langages.length} langages`,
);
