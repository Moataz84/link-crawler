const validate = require("./validate")
const { crawl, sitemap } = require("./crawler")

async function validateURLInput(usrInput) {
  return await validate(usrInput)
}

async function crawlURL(URL) {
  return await crawl(URL)
}

async function generateSitemap(URL) {
  return await sitemap(URL)
}

module.exports = { validateURLInput, crawlURL, generateSitemap }