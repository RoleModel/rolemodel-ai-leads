import * as React from "react"
import { SVGProps } from "react"
interface SVGRProps {
  title?: string;
  titleId?: string;
  fill?: string
  accentColor?: string
  className?: string;
}
const SendIcon = ({
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
    fill="none"
    viewBox="0 0 24 24"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill={fill}
      d="M23.813 6.188a2.433 2.433 0 0 0-2.438-2.438h-15a2.433 2.433 0 0 0-2.438 2.438v3.187c0 .318.245.563.563.563a.553.553 0 0 0 .563-.563V6.187c0-.73.582-1.312 1.312-1.312h15c.73 0 1.313.582 1.313 1.313V18c0 .525-.582 1.125-1.313 1.125H6.562a.553.553 0 0 0-.562.563c0 .318.244.562.563.562h14.812c1.293 0 2.438-1.05 2.438-2.25V6.187Z"
    />
    <path
      fill={fill}
      d="M21.14 9.37c-.393.448-4.11 4.693-7.265 4.693-3.262 0-7.125-4.538-7.293-4.745a.581.581 0 0 1 .074-.787.565.565 0 0 1 .787.074c0 .02.938 1.125 2.233 2.213 1.648 1.389 3.094 2.12 4.199 2.12s2.55-.731 4.2-2.1c1.275-1.088 2.232-2.193 2.232-2.213a.544.544 0 0 1 .787-.074.544.544 0 0 1 .046.819Z"
    />
    <path
      fill={accentColor}
      d="M1.125 15.938c0-.319.244-.563.563-.563h4.687c.318 0 .563.244.563.563a.553.553 0 0 1-.563.562H1.687a.553.553 0 0 1-.562-.563ZM5.063 12.188a.553.553 0 0 0-.563-.563H3.187a.553.553 0 0 0-.562.563c0 .318.244.562.563.562H4.5a.553.553 0 0 0 .563-.563ZM.188 19.688c0 .318.244.562.562.562h1.875a.553.553 0 0 0 .563-.563.553.553 0 0 0-.563-.562H.75a.553.553 0 0 0-.563.563Z"
    />
  </svg>
)
export default SendIcon
