import { Bindings, getGitHubToken } from './bindings'
import { USER_AGENT } from './constants'

export const getLatestRelease = async (
  bindings: Bindings,
  username: string,
  reponame: string
) => {
  const cacheKey = `release:${username}:${reponame}`
  const cache = await bindings.KV.get(cacheKey)

  if (cache) {
    return JSON.parse(cache)
  }

  const url = `https://api.github.com/repos/${username}/${reponame}/releases/latest`
  console.log('getting latest release', url)
  // Headers
  const headers: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': "2022-11-28",
    // chrome
    'user-agent': USER_AGENT,
  }

  // Add github token if provided
  const token = getGitHubToken(bindings, url)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  // Get JSON from github
  const response = await fetch(url.toString(), {
    method: 'GET',
    headers,
  })


  console.log(response)

  if (!response.ok) return null

  const text = await response.text()
  await bindings.KV.put(cacheKey, text, {
    // 10 minutes
    expirationTtl: 60 * 10,
  })

  return JSON.parse(text)
}
