import type { Experimental_GeneratedImage } from 'ai'

import { cn } from '@/lib/utils'

export type ImageProps = Omit<Experimental_GeneratedImage, 'uint8Array'> & {
  className?: string
  alt?: string
}

// Using img for base64 data URIs - Next/Image doesn't support data: URLs
export const Image = ({ base64, mediaType, ...props }: ImageProps) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    {...props}
    alt={props.alt}
    className={cn('h-auto max-w-full overflow-hidden rounded-md', props.className)}
    src={`data:${mediaType};base64,${base64}`}
  />
)
