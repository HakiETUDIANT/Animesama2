async function searchResults(keyword) {
  try {
      // 1. Construction de l'URL de recherche
      const searchUrl = `https://anime-sama.fr/catalogue/?search=${encodeURIComponent(keyword)}`;
      console.log("Searching URL:", searchUrl);

      // 2. Récupération du HTML
      const response = await fetch(searchUrl);
      const html = await response.text();

      // 3. Parsing avec DOMParser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // 4. Extraction des résultats avec les bons sélecteurs
      const results = [];

      // Cibler les cartes d'anime dans le catalogue (basé sur la structure HTML réelle)
      const items = doc.querySelectorAll('#list_catalog .shrink-0');

      console.log("Number of anime cards found:", items.length);

      items.forEach(item => {
          const linkElement = item.querySelector('a');
          const href = linkElement?.href;
          const imgElement = item.querySelector('img');
          const image = imgElement?.src;
          const titleElement = item.querySelector('h1');
          const title = titleElement?.textContent?.trim();

          if (title && href) {
              results.push({
                  title: title,
                  image: image || 'https://anime-sama.fr/logo.png',
                  href: href.startsWith('http') ? href : `https://anime-sama.fr${href}`
              });
          }
      });

      return JSON.stringify(results.length > 0 ? results : [{
          title: `Aucun résultat pour "${keyword}"`,
          href: searchUrl,
          image: 'https://anime-sama.fr/logo.png'
      }]);

  } catch (error) {
      console.error("Search error:", error);
      return JSON.stringify([{
          title: "Erreur de recherche",
          href: "#",
          image: "https://anime-sama.fr/logo.png"
      }]);
  }
}

// Fonctions génériques pour tous les animes
async function extractDetails(url) {
  return JSON.stringify([{
      description: "Anime disponible sur Anime-sama",
      genres: ["Anime"],
      year: new Date().getFullYear()
  }]);
}

async function extractEpisodes(url) {
  return JSON.stringify([{
      number: "1",
      href: url + "/1"
  }]);
}

async function extractStreamUrl(url) {
  return `https://anime-sama.fr${url}`;
}

if (typeof module !== 'undefined') {
  module.exports = {
      searchResults,
      extractDetails,
      extractEpisodes,
      extractStreamUrl
  };
}

// to make it run with Node.js
if (typeof window === 'undefined') {
  // node js env
  global.fetch = require('node-fetch');

  // to create  a DOMParser which is equal for node.js env  since it doesn't have the browser's DOMParser
  class NodeDOMParser {
    parseFromString(html, type) {
      const { JSDOM } = require('jsdom');
      return new JSDOM(html).window.document;
    }
  }

  global.DOMParser = NodeDOMParser;

  // here we'll test with naruto cuz i think this is anime?
  async function main() {
    const result = await searchResults('naruto');
    console.log(result);
  }

  // run main if exec
  if (require.main === module) {
    main().catch(console.error);
  }
}
