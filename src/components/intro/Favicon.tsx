import * as React from 'react'
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Favicon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 1024 1024"
    fill="none"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path fill="#2A83F7" d="M0 0h1024v1024H0z" />
    <path
      fill="#FEFEFE"
      d="M266.913 234.54a12.795 12.795 0 0 1 12.812-12.812h252.52c73.796 0 131.021 20.712 169.158 58.891 32.328 32.329 49.752 77.939 49.752 132.688v1.665c0 93.697-50.564 152.588-124.402 179.963L754.828 782.2c5.808 8.499-.256 20.072-10.591 20.072H626.112c-4.27 0-8.285-2.135-10.676-5.68l-118.039-176.29c-1.58-2.349-4.271-3.801-7.089-3.801h-87.249c-4.74 0-8.541 3.844-8.541 8.541v164.375c0 7.09-5.722 12.812-12.811 12.812H279.725a12.795 12.795 0 0 1-12.812-12.812V234.54ZM523.96 503.672c62.18 0 97.839-33.182 97.839-82.08v-1.666c0-54.749-38.136-82.935-100.359-82.935H403.102c-4.74 0-8.541 3.844-8.541 8.541v149.599c0 4.74 3.844 8.541 8.541 8.541H523.96Z"
    />
  </svg>
)
export default Favicon
