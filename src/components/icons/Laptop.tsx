import * as React from 'react'
import { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
  fill?: string
  accentColor?: string
  className?: string
}
const LaptopIcon = ({
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
    viewBox="0 0 24 24"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <path
      fill={accentColor}
      d="m15.078 9.49 1.405-.315a.55.55 0 0 0 .427-.517.58.58 0 0 0-.407-.555l-4.09-1.165a.529.529 0 0 0-.536.147.537.537 0 0 0-.147.538l1.165 4.07c.072.24.277.407.535.407h.02a.535.535 0 0 0 .518-.427l.315-1.388 1.775 1.778c.112.11.26.165.39.165a.566.566 0 0 0 .387-.165.536.536 0 0 0 0-.778L15.077 9.49Z"
    />
    <path
      fill={fill}
      d="M2.035 16.52.387 19.665c-.24.463-.22 1 .058 1.443.278.445.74.705 1.257.705H21.96c.517 0 .997-.26 1.258-.705.277-.443.294-.98.055-1.443l-1.645-3.145V.74a.546.546 0 0 0-.555-.555H2.59a.544.544 0 0 0-.555.555v15.78Zm13.488 4.2H8.158c-.295 0-.463-.315-.313-.572l.535-.833a.55.55 0 0 1 .462-.26h5.976c.184 0 .37.093.462.26l.538.833c.185.257 0 .572-.295.572ZM3.145 1.295h17.39v14.8H3.145v-14.8Z"
    />
  </svg>
)
export default LaptopIcon
