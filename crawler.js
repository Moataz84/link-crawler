const axios = require("axios")
const cheerio = require("cheerio")
const URL = require("url")
const uuid = require("uuid")
const fs = require("fs")

const startTime = new Date().getTime()

async function crawl(
  url,
  queue = new Set([url]),
  crawled = new Set([]),
  found = new Set([]),
  notValid = new Set([])
) {
  const props = new URL.URL(url)
  const domain = props.host
  const protocol = props.protocol

  const links = [...queue].filter(link => !crawled.has(link))

  if (links.length === 0) {
    found.add(`${url}/`)
    const finalLinks = [...found].filter(l => !notValid.has(l))
    return {
      links: finalLinks,
      time: new Date(new Date().getTime() - startTime).toISOString().split("T")[1].slice(0, 12)
    }
  }

  console.log(links.length)

  try {
    const responses = await Promise.allSettled(links.splice(0, 25).map(link => axios.get(link)))
    responses.forEach(res => {
      const link = res.status === "fulfilled"? res.value.config.url: res.reason.config.url
      crawled.add(link)

      if (res.status === "rejected") {
        notValid.add(link)
        return
      }

      if (new URL.URL(link).host !== domain) {
        notValid.add(link)
        return
      }

      const type = res.value.headers["content-type"]
      if (!type.includes("text/html")) {
        if (["pdf", "xml", "json"].some(i => type.includes(i))) found.add(link)
        else notValid.add(link)
        return
      }

      $ = cheerio.load(res.value.data)
      $(res.value.data).find("a").each((i, v) => {
        const value = $(v).attr("href")
        try {
          const parts = new URL.URL(value, link)
          const fullLink = `${parts.origin}${parts.pathname}${parts.search}`
          const encodedLink = encodeURIComponent(decodeURIComponent(fullLink)).
          replace(/%2F/g, "/").replace(/%3A/g, ":").replace(/%3F/g, "?").replace(/%3D/g, "=")
          
          const linkParts = new  URL.URL(encodedLink)
          if (linkParts.host === domain && linkParts.protocol === protocol) {
            found.add(encodedLink)
            queue.add(encodedLink)
          } else {
            crawled.add(encodedLink)
          }
        } catch {}
      })
    })
  } catch (e) {
    console.log(e)
  }
  return crawl(url, queue, crawled, found, notValid)
}

function assignProperties(links) {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, "0")
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const year = d.getFullYear()
  const date = `${year}-${month}-${day}`

  return [...links].map(link => {
    let path = new URL.URL(link).pathname
    if (path.charAt(path.length - 1) === "/") path = path.substring(0, path.length - 1)
    const numberOfDirectories = path.split("/").length - 1

    if (numberOfDirectories === 0) {
      priority = "1.0"
    } else if (numberOfDirectories === 1 || numberOfDirectories === 2) {
      priority = "0.80"
    } else if (numberOfDirectories === 3 || numberOfDirectories === 4) {
      priority = "0.75"
    } else if (numberOfDirectories === 5 || numberOfDirectories === 6) {
      priority = "0.60"
    } else if (numberOfDirectories === 7 || numberOfDirectories === 8) {
      priority = "0.45"
    } else if (numberOfDirectories > 8) {
      priority = "0.35"
    }

    const eachLink = { url: link, priority, date }
    return eachLink
  })
}

function outputToFile(obj, number) {
  const sitemapFile = `sitemap-${uuid.v4()}.xml`

  const urlset = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<!--Total Links: ${number}-->\n`

  const orderedList = obj.sort((a, b) => 
    parseFloat(b.priority) - parseFloat(a.priority) || a.url.length - b.url.length
  )
  
  const linkTags = orderedList.map(l => {
    const link = `
  <url>
    <loc>${l.url}</loc>
    <priority>${l.priority}</priority>
    <lastmod>${l.date}</lastmod>
  </url>\n`
    return link
  })
  const output = [urlset, ...linkTags, "\n</urlset>"].reduce((a, b) => a + b)
  fs.writeFileSync(sitemapFile, output)

  return {
    file: sitemapFile,
    time: new Date(new Date().getTime() - startTime).toISOString().split("T")[1].slice(0, 12)
  }
}

async function sitemap(url) {  
  const links = await crawl(url)
  const obj = assignProperties(links.links)
  return outputToFile(obj, obj.length)
}

module.exports = { crawl, sitemap }