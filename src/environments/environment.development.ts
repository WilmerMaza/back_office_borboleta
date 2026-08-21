export const environment = {
  production: false,
  URLS: "assets/data", // Change only the domain part, keeping "/api/admin" intact
  storageURL: "assets",
  URL: "http://localhost:3001/api",
  URLs: "https://borboleta.site/api",
  /**
   * Vitrina /theme: si hay slugs, solo se muestran esos temas.
   * Si está vacío, solo el tema activo (status) que devuelve el API.
   */
  showcaseThemeSlugs: [] as string[],
};
