const axios = require("axios")
const URL = require("url")

async function checkSSL(domain) {
  const urls = { 
    secure: `https://${domain}`,
    notSecure: `http://${domain}`
  }

  try {
    new URL.URL(urls.secure)

    const responses = await Promise.allSettled([
      axios.get(urls.secure),
      axios.get(urls.notSecure)
    ])
    const result = responses.map(res => ({
      url: res.status === "fulfilled"? res.value.config.url: res.reason.config.url,
      status: res.status
    })).find(url => url.status === "fulfilled")
  
    return result
  } catch {
    return
  }
}

function determineResponse(response, input) {
  if (!response) {
    return ({valid: false})
  }
  return ({valid: true, URL: response.url, usrInput: input})
}

async function validate(input) {
  if (!input) {
    return ({valid: false})
  }
  input = input.toLowerCase()
  try {
    const domain = new URL.URL(input).host
    const result = await checkSSL(domain)
    return determineResponse(result, input)
  } catch {
    const result = await checkSSL(input)
    return determineResponse(result, input)  
  }
}


module.exports = validate