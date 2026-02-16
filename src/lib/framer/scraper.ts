/**
 * Framer site scraper - fetches content from Framer sites via sitemap
 */

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: string
  priority?: string
}

export interface ScrapedPage {
  url: string
  title: string
  content: string
  description?: string
  lastModified?: string
  type: 'case-study' | 'blog' | 'page'
}

/**
 * Parse a sitemap XML and extract URLs
 */
export async function parseSitemap(sitemapUrl: string): Promise<SitemapUrl[]> {
  const response = await fetch(sitemapUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`)
  }

  const xml = await response.text()
  const urls: SitemapUrl[] = []

  // Simple XML parsing for sitemap format
  const urlMatches = xml.matchAll(/<url>([\s\S]*?)<\/url>/g)

  for (const match of urlMatches) {
    const urlBlock = match[1]

    const locMatch = urlBlock.match(/<loc>(.*?)<\/loc>/)
    const lastmodMatch = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/)
    const changefreqMatch = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/)
    const priorityMatch = urlBlock.match(/<priority>(.*?)<\/priority>/)

    if (locMatch) {
      urls.push({
        loc: locMatch[1],
        lastmod: lastmodMatch?.[1],
        changefreq: changefreqMatch?.[1],
        priority: priorityMatch?.[1],
      })
    }
  }

  return urls
}

/**
 * Categorize a URL by its path
 */
export function categorizeUrl(url: string): 'case-study' | 'blog' | 'page' | 'skip' {
  const path = new URL(url).pathname

  if (
    path.startsWith('/case-studies/') ||
    path.startsWith('/portfolio/') ||
    path.startsWith('/our-work/')
  ) {
    return 'case-study'
  }
  if (path.startsWith('/blog/') && path !== '/blog') {
    return 'blog'
  }
  // Skip these pages - not useful for RAG
  if (
    path === '/' ||
    path === '/blog' ||
    path === '/privacy-policy' ||
    path.includes('/contact/') ||
    path.includes('/academy/apply')
  ) {
    return 'skip'
  }

  return 'page'
}

/**
 * Scrape a single page and extract content
 */
export async function scrapePage(url: string): Promise<ScrapedPage | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'RoleModel-AI-Scraper/1.0',
      },
    })

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    let title = titleMatch?.[1] || ''
    // Clean up title - remove site name suffix
    title = title.replace(/\s*[|–-]\s*RoleModel.*$/i, '').trim()

    // Extract meta description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)">/i)
    const description = descMatch?.[1]

    // Extract main content - look for common content containers
    let content = ''

    // Try to extract text from the body, removing scripts and styles
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)
    if (bodyMatch) {
      let bodyContent = bodyMatch[1]

      // Remove script tags
      bodyContent = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '')
      // Remove style tags
      bodyContent = bodyContent.replace(/<style[\s\S]*?<\/style>/gi, '')
      // Remove SVG tags
      bodyContent = bodyContent.replace(/<svg[\s\S]*?<\/svg>/gi, '')
      // Remove HTML tags but keep text
      bodyContent = bodyContent.replace(/<[^>]+>/g, ' ')
      // Decode HTML entities
      bodyContent = bodyContent
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
      // Normalize whitespace
      bodyContent = bodyContent.replace(/\s+/g, ' ').trim()

      content = bodyContent
    }

    // If content is too short, it probably didn't extract properly
    if (content.length < 100) {
      console.warn(`Content too short for ${url}: ${content.length} chars`)
      return null
    }

    // Truncate very long content
    if (content.length > 10000) {
      content = content.slice(0, 10000) + '...'
    }

    const type = categorizeUrl(url)
    if (type === 'skip') return null

    return {
      url,
      title,
      content,
      description,
      type,
    }
  } catch (error) {
    console.error(`Error scraping ${url}:`, error)
    return null
  }
}

/**
 * Get all scrapeable URLs from a Framer site
 */
export async function getFramerUrls(
  baseUrl: string,
  options: {
    includeBlog?: boolean
    includeCaseStudies?: boolean
    includePages?: boolean
  } = {}
): Promise<SitemapUrl[]> {
  const { includeBlog = true, includeCaseStudies = true, includePages = true } = options

  const sitemapUrl = baseUrl.endsWith('/')
    ? `${baseUrl}sitemap.xml`
    : `${baseUrl}/sitemap.xml`
  const allUrls = await parseSitemap(sitemapUrl)

  return allUrls.filter((item) => {
    const type = categorizeUrl(item.loc)
    if (type === 'skip') return false
    if (type === 'blog' && !includeBlog) return false
    if (type === 'case-study' && !includeCaseStudies) return false
    if (type === 'page' && !includePages) return false
    return true
  })
}
