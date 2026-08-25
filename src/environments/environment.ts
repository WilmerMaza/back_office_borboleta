export const environment = {
  production: true,
  URLS: "assets/data", // Change only the domain part, keeping "/api/admin" intact
  storageURL: "assets",
  URL: "https://back-borboleta-git-qa-wilmermazas-projects.vercel.app/api",
  URLs: "https://borboleta.site/api",
  /**
   * Vitrina /theme: si hay slugs, solo se muestran esos temas.
   * Si está vacío, solo el tema activo (status) que devuelve el API.
   */
  showcaseThemeSlugs: [] as string[],
};
