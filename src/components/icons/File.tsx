import * as React from "react"
import { SVGProps } from "react"
interface SVGRProps {
  title?: string;
  titleId?: string;
  fill?: string;
  accentColor?: string;
  className?: string;
}
const FileIcon = ({
  title,
  titleId,
  fill = "#000",
  accentColor = "#000",
  className = "",
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
      stroke={accentColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M16.83 18.718v-5.175a1.363 1.363 0 1 1 2.725 0v6.017a2.726 2.726 0 1 1-5.452 0v-6.606a4.09 4.09 0 1 1 8.178 0v5.764"
    />
    <path
      fill="none"
      stroke={fill}
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.02 19.406H2.157A1.438 1.438 0 0 1 .72 17.97V2.156A1.438 1.438 0 0 1 2.156.72h10.186a1.438 1.438 0 0 1 1.016.42l2.753 2.753a1.438 1.438 0 0 1 .42 1.016v1.15"
    />
  </svg>
)
export default FileIcon
