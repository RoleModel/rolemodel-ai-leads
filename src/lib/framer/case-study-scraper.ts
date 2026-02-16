/**
 * Case Study Metadata Provider
 * Provides metadata for case study cards using data from case-studies.json
 * Images are hosted on Framer CDN (framerusercontent.com)
 */
import caseStudies from '@/data/case-studies.json'

export interface CaseStudyMetadata {
  url: string
  title: string
  description?: string
  backgroundImage?: string
  logo?: string
}

export interface CaseStudyData {
  slug: string
  title: string
  description: string
  logo: string | null
  main: string | null
  logoUrl: string | null
  mainUrl: string | null
}

// Create a lookup map by slug for fast access
const caseStudyMap = new Map<string, CaseStudyData>()
for (const study of caseStudies as CaseStudyData[]) {
  caseStudyMap.set(study.slug, study)
}

/**
 * Extract slug from a case study URL
 */
const extractSlug = (url: string): string | null => {
  const match = url.match(/case-studies\/([a-z0-9-]+)/i)
  return match ? match[1] : null
}

/**
 * Get case study metadata from local JSON data
 * Uses Framer CDN URLs for images
 */
export const scrapeCaseStudyMetadata = async (
  url: string
): Promise<CaseStudyMetadata> => {
  const slug = extractSlug(url)

  if (slug && caseStudyMap.has(slug)) {
    const entry = caseStudyMap.get(slug)!
    return {
      url,
      title: entry.title,
      description: entry.description || undefined,
      // Use Framer CDN URLs (mainUrl/logoUrl)
      backgroundImage: entry.mainUrl || undefined,
      logo: entry.logoUrl || undefined,
    }
  }

  // Return basic metadata if case study not found in JSON
  return {
    url,
    title:
      slug
        ?.split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ') || 'Case Study',
  }
}

/**
 * Get all available case studies from local data
 */
export const getAllCaseStudies = (): CaseStudyData[] => {
  return caseStudies as CaseStudyData[]
}

/**
 * Get a specific case study by slug
 */
export const getCaseStudyBySlug = (slug: string): CaseStudyData | undefined => {
  return caseStudyMap.get(slug)
}
