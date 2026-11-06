// Tout le contenu du site, dans les deux langues.
//
// Separe du code du terminal pour qu'ajouter un projet ou corriger une
// tournure ne demande jamais de toucher au shell.

export type Langue = "fr" | "en";

/** Un texte dans les deux langues. */
export type Bi = Record<Langue, string>;

export interface Projet {
  id: string;
  nom: string;
  url: string;
  demo?: string;
  annee: string;
  pile: string[];
  /** Une ligne, affichee par `ls`. */
  resume: Bi;
  /** L'etude de cas, affichee par `cat`. */
  etude: {
    probleme: Bi;
    approche: Bi;
    difficile: Bi;
    preuve: Bi;
  };
  images?: { src: string; legende: Bi }[];
}

export const PROJETS: Projet[] = [
  {
    id: "personadle",
    nom: "PersonaDLE",
    url: "https://github.com/CodeByHaamza/personadle",
    demo: "https://personadle.net",
    annee: "2025 →",
    pile: ["vanilla js", "php", "mariadb", "docker", "apache"],
    resume: {
      fr: "Un jeu de devinette quotidien dans l'univers Persona, en ligne et joué tous les jours",
      en: "A daily guessing game set in the Persona universe, live and played every day",
    },
    etude: {
      probleme: {
        fr: "Les jeux « -dle » quotidiens marchent parce qu'ils sont courts et qu'on les partage. Mais la plupart des clones amateurs meurent au bout d'un mois : le contenu s'épuise, et plus personne ne tient le serveur.",
        en: "Daily \"-dle\" games work because they are short and shareable. Most fan-made clones die within a month: the content runs out, and nobody keeps the server alive.",
      },
      approche: {
        fr: "Six modes au lieu d'un seul, pour que la base de personnages serve six fois. Tout tourne dans Docker avec MariaDB, derrière Apache : une remise en route prend une commande. Le front est en JavaScript sans framework, donc rien à migrer tous les six mois.",
        en: "Six modes instead of one, so the character set pays for itself six times over. Everything runs in Docker with MariaDB behind Apache, so bringing it back up is a single command. The front end is framework-free JavaScript: nothing to migrate every six months.",
      },
      difficile: {
        fr: "Le mode musique. Il faut rendre un morceau reconnaissable en quelques secondes sans livrer la réponse dans le nom du fichier, et servir l'audio assez vite pour que le jeu reste nerveux.",
        en: "The music mode. You have to make a track recognisable in seconds without leaking the answer in the file name, and serve the audio fast enough to keep the game snappy.",
      },
      preuve: {
        fr: "En ligne sur personadle.net, avec un serveur Discord et un bot que j'ai écrit pour l'accompagner.",
        en: "Live at personadle.net, with a Discord server and a bot I wrote to go with it.",
      },
    },
  },
  {
    id: "kagami",
    nom: "Kagami",
    url: "https://github.com/CodeByHaamza/kagami",
    demo: "https://codebyhaamza.github.io/kagami/",
    annee: "2026",
    pile: ["typescript", "mediapipe", "onnxruntime-web", "three.js", "pwa"],
    resume: {
      fr: "Tu formes les signes devant ta caméra, une IA les reconnaît, la technique part à l'écran",
      en: "You form the hand signs on camera, an AI recognises them, the jutsu fires",
    },
    etude: {
      probleme: {
        fr: "Reconnaître une suite de signes de main en temps réel demande de la vision par ordinateur. La solution évidente est d'envoyer les images à un serveur — c'est-à-dire filmer les gens et expédier leur visage ailleurs.",
        en: "Recognising a sequence of hand signs in real time needs computer vision. The obvious route is to send frames to a server — which means filming people and shipping their face somewhere.",
      },
      approche: {
        fr: "Tout tourne dans le navigateur : MediaPipe pour les mains et la pose, ONNX Runtime Web pour la détection des signes. Aucune image ne quitte l'appareil, et l'application fonctionne hors ligne une fois installée.",
        en: "Everything runs in the browser: MediaPipe for hands and pose, ONNX Runtime Web for sign detection. No frame leaves the device, and the app works offline once installed.",
      },
      difficile: {
        fr: "Le coût. Faire tourner deux modèles sur chaque image d'une webcam sature un processeur. Il a fallu choisir les variantes légères, déléguer au GPU quand il existe, et accepter de sauter une image plutôt que de prendre du retard.",
        en: "The budget. Running two models on every webcam frame saturates a CPU. I had to pick the lite variants, delegate to the GPU where there is one, and accept dropping a frame rather than falling behind.",
      },
      preuve: {
        fr: "440 tests, TypeScript strict, et une démo qu'on peut essayer avec sa propre caméra.",
        en: "440 tests, strict TypeScript, and a demo you can try with your own camera.",
      },
    },
    images: [
      {
        src: "img/kagami.webp",
        legende: {
          fr: "Les douze signes du zodiaque, illustrés pour l'entraînement guidé",
          en: "The twelve zodiac seals, illustrated for guided training",
        },
      },
    ],
  },
  {
    id: "grimoire",
    nom: "Grimoire du Cœur",
    url: "https://github.com/Grimoire-du-Coeur",
    annee: "2024 →",
    pile: ["python", "psp eboot", "reverse engineering", "xdelta"],
    resume: {
      fr: "Traduire en français des jeux Megaten que personne n'avait traduits, et la communauté qui va avec",
      en: "Translating Megaten games into French that nobody had translated, and the community around it",
    },
    etude: {
      probleme: {
        fr: "Persona 1 et Persona 2 n'ont jamais eu de traduction française. Les jeux PSP ne livrent pas leurs textes : les dialogues sont enfouis dans l'exécutable et dans des archives maison, sans aucun outil public pour les en sortir.",
        en: "Persona 1 and Persona 2 never had a French translation. PSP games do not hand over their text: dialogue is buried in the executable and in bespoke archives, with no public tool to get it out.",
      },
      approche: {
        fr: "Démonter le binaire EBOOT pour trouver les tables de scripts, écrire l'extracteur, puis le réinjecteur — en respectant les longueurs, sinon le jeu plante. Les outils sont publics ; les données du jeu, non.",
        en: "Take the EBOOT binary apart to find the script tables, write the extractor, then the reinjector — respecting lengths, or the game crashes. The tools are public; the game data is not.",
      },
      difficile: {
        fr: "Le français est plus long que l'anglais, et les boîtes de dialogue ne s'agrandissent pas. Chaque ligne est un arbitrage entre la fidélité et la place disponible — j'ai dû construire un outil web de relecture pour que plusieurs personnes tranchent ensemble.",
        en: "French runs longer than English, and the text boxes do not grow. Every line is a trade-off between faithfulness and the room available — which is why I built a web proofreading tool so several people could decide together.",
      },
      preuve: {
        fr: "71 étoiles sur l'organisation, dont 56 sur le seul patch Persona 2, et des correctifs que des gens installent vraiment.",
        en: "71 stars across the organisation, 56 on the Persona 2 patch alone, and patches people actually install.",
      },
    },
  },
  {
    id: "jojo-arena",
    nom: "JoJo Arena",
    url: "https://github.com/CodeByHaamza/jojo-arena",
    annee: "2026",
    pile: ["python", "pygame-ce", "pytest"],
    resume: {
      fr: "Un jeu de combat 1 contre 1 en pixel art vu de dessus, dessiné entièrement en code",
      en: "A 1v1 top-down pixel-art fighting game, drawn entirely in code",
    },
    etude: {
      probleme: {
        fr: "Qu'est-ce qui fait qu'un combat ressemble à JoJo, et pas seulement qu'il en porte les noms ? Ce n'est pas la taille du roster : c'est que chaque personnage se lise à l'écran.",
        en: "What makes a fight feel like JoJo, rather than just borrow its names? Not the roster size: it is that every character reads on screen.",
      },
      approche: {
        fr: "Une simulation déterministe à 60 images par seconde, où la même suite d'entrées donne toujours la même partie. C'est ce qui rend le jeu testable : 959 tests rejouent des combats entiers et vérifient l'issue.",
        en: "A deterministic 60 fps simulation, where the same input sequence always yields the same match. That is what makes it testable: 959 tests replay whole fights and assert the outcome.",
      },
      difficile: {
        fr: "Le déterminisme, justement. Il interdit le flottant approximatif, l'ordre d'itération non garanti et tout tirage aléatoire non initialisé. Chaque raccourci se paie par un test qui échoue une fois sur cinquante.",
        en: "The determinism itself. It rules out sloppy floats, unguaranteed iteration order, and any unseeded randomness. Every shortcut costs you a test that fails one run in fifty.",
      },
      preuve: {
        fr: "959 tests, 94 % de couverture, zéro ressource importée : tout le pixel art est généré par le code.",
        en: "959 tests, 94% coverage, zero imported assets: all the pixel art is generated in code.",
      },
    },
  },
];

export const A_PROPOS: Record<Langue, string[]> = {
  fr: [
    "Hamza, 3ᵉ année de BUT Informatique, en alternance.",
    "",
    "Je construis des choses petites et finies : un jeu quotidien, un moteur",
    "de reconnaissance de gestes, un jeu de combat, et des traductions",
    "françaises de jeux Megaten de l'époque PSP.",
    "",
    "Tout sort avec Docker, des tests et un changelog. Je ne laisse pas les",
    "projets à moitié faits — j'en commence simplement trop.",
  ],
  en: [
    "Hamza, third-year CS student (BUT Informatique), work-study.",
    "",
    "I build small complete things: a daily game, a gesture recognition",
    "engine, a fighting game, and French fan translations of PSP-era",
    "Megaten titles.",
    "",
    "Everything ships with Docker, tests and a changelog. I don't leave",
    "projects half-finished — I just start too many of them.",
  ],
};

export const PILE: { cat: string; items: string[] }[] = [
  { cat: "languages", items: ["typescript", "python", "php", "javascript", "java", "c", "bash"] },
  { cat: "web", items: ["react", "three.js", "vite", "node", "nestjs", "pwa"] },
  { cat: "data", items: ["mariadb", "mysql", "mongodb", "pandas", "numpy"] },
  { cat: "infra", items: ["docker", "compose", "github actions", "apache", "cloudflare", "ubuntu"] },
  { cat: "quality", items: ["vitest", "playwright", "pytest", "ruff", "eslint", "prettier"] },
  { cat: "rabbit holes", items: ["mediapipe", "onnxruntime-web", "pygame-ce", "psp eboot"] },
];

export const LIENS = [
  { nom: "github", url: "https://github.com/CodeByHaamza" },
  { nom: "personadle", url: "https://personadle.net" },
  { nom: "linkedin", url: "https://www.linkedin.com/in/hamza-karrouchi/" },
  { nom: "discord", url: "https://discord.com/users/690536004758536192" },
  { nom: "steam", url: "https://steamcommunity.com/profiles/76561199179744533/" },
  { nom: "mail", url: "mailto:hamza.karrouchi.dev@gmail.com" },
];

export const GOUTS: Record<Langue, string[]> = {
  fr: [
    "manga      JoJo partie 7 (Steel Ball Run), Goodnight Punpun, Uzumaki",
    "anime      Fullmetal Alchemist Brotherhood, L'Attaque des Titans",
    "jeux       Persona 5 Royal, Elden Ring, Bloodborne, Black Myth Wukong",
    "films      la trilogie Spider-Verse, sans discussion",
    "étagère    ~300 tomes, dont des exclusifs et des éditions limitées",
  ],
  en: [
    "manga      JoJo Part 7 (Steel Ball Run), Goodnight Punpun, Uzumaki",
    "anime      Fullmetal Alchemist Brotherhood, Attack on Titan",
    "games      Persona 5 Royal, Elden Ring, Bloodborne, Black Myth Wukong",
    "films      the Spider-Verse trilogy, no debate",
    "shelf      ~300 volumes, including exclusives and limited editions",
  ],
};
