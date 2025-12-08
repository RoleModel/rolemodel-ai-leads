import * as React from 'react'
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
  fill?: string
  accentColor?: string
  className?: string
}
const LightbulbIcon = ({
  title,
  titleId,
  fill = '#000',
  accentColor = '#000',
  className = '',
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="-0.5 -0.5 24 24"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.063 21.563h2.874"
    />
    <path
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17.25 11.5a5.75 5.75 0 1 0-7.188 5.547v1.64h2.876v-1.64A5.737 5.737 0 0 0 17.25 11.5Z"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.5 2.875V1.437"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M20.125 10.063h1.438"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M1.438 11.5h1.437"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m17.599 16.88 1.017 1.017"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.384 3.666 1.017 1.016"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m17.599 4.682 1.017-1.016"
    />
    <path
      fill="none"
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.384 17.897 1.017-1.017"
    />
  </svg>
)
export default LightbulbIcon
