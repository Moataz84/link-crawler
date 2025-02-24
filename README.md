# link-crawler

A simple Node.js package that crawls internal links of a website and generates a sitemap.

## Installation

```sh
npm install @moataz84/link-crawler
```

## Usage

### Importing the Module

```js
const { validateURLInput, crawlURL, generateSitemap } = require("link-crawler")
```

### Functions

#### `validateURLInput(usrInput): async`
Asynchronous function that validates user input to determine if it's a valid URL. Returns the full URL with appropriate protocol (HTTP/HTTPS).

```js
validateURLInput("example.com").then(resp => {
  console.log(resp)
})
/*
{
  valid: true,
  URL: "https://example.com",
  usrInput: "example.com"
}
*/
```

#### `crawlURL(URL): async`
Asynchronous function that crawls a URL and returns a list of internal links. Recommended to be used in combination with `validateURLInput(URL)`.

```js
validateURLInput("example.com").then(async resp => {
  const links = await crawlURL(resp.URL)
  console.log(links)
})
/*
{
  links: ["https://example.com/page1", "https://example.com/page2"],
  time: "00:00:00.515"
}
*/
```

#### `generateSitemap(URL): async`
Asynchronous function that generates a sitemap file for the given URL, saves it in the local directory, and returns the file name. Recommended to be used in combination with `validateURLInput(URL)`.

```js
validateURLInput("example.com").then(async resp => {
  const sitemap = await generateSitemap(resp.URL)
  console.log(sitemap)
})
/*
{
  file: "sitemap-7d0d59b4-3aa2-4712-876e-a721cc73f99b.xml",
  time: "00:00:00.515"
}
*/
```

## License

MIT