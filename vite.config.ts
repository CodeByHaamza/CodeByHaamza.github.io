import { defineConfig } from "vite";

// Site utilisateur servi a la racine de codebyhaamza.github.io : la base
// reste "/". Elle est tout de meme lue dans l'environnement, pour qu'une
// previsualisation sous un sous-chemin reste possible sans toucher au code.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/",
  build: { target: "es2022" },
});
