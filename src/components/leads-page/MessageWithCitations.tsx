'use client'

import { type UIMessage } from 'ai'

import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
  InlineCitationText,
} from '@/components/ai-elements/inline-citation'

export interface Citation {
  url?: string
  title: string
  description?: string
}

interface MessageWithCitationsProps {
  message: UIMessage
  citations?: Citation[]
  className?: string
  style?: React.CSSProperties
}

export function MessageWithCitations({
  message,
  citations,
  className,
  style,
}: MessageWithCitationsProps) {
  const renderTextWithCitations = (text: string) => {
    if (!citations || citations.length === 0) {
      return text
    }

    // Split text by citation markers like [1], [2], etc.
    const parts = text.split(/(\[\d+\])/g)
    const citationRefs: string[] = []
    const citationMap: { [key: number]: Citation } = {}

    return parts.map((segment, i) => {
      const citationMatch = segment.match(/\[(\d+)\]/)
      if (citationMatch) {
        const citationNumber = parseInt(citationMatch[1])
        const citationIndex = citationNumber - 1
        const citation = citations[citationIndex]

        if (citation) {
          citationMap[citationNumber] = citation
          const url = citation.url ?? ''
          if (url && !citationRefs.includes(url)) {
            citationRefs.push(url)
          }

          return (
            <InlineCitation key={i}>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={[url]} />
                <InlineCitationCardBody>
                  <InlineCitationCarousel>
                    <InlineCitationCarouselHeader>
                      <InlineCitationCarouselPrev />
                      <InlineCitationCarouselIndex />
                      <InlineCitationCarouselNext />
                    </InlineCitationCarouselHeader>
                    <InlineCitationCarouselContent>
                      <InlineCitationCarouselItem>
                        <InlineCitationSource
                          title={citation.title}
                          url={url}
                          description={citation.description}
                        />
                      </InlineCitationCarouselItem>
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          )
        }
      }
      return <span key={i}>{segment}</span>
    })
  }

  return (
    <div className={className} style={style}>
      {message.parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <InlineCitationText key={index}>
              {renderTextWithCitations(part.text)}
            </InlineCitationText>
          )
        }
        return null
      })}
    </div>
  )
}
