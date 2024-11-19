import * as React from 'react'
import type { SVGProps } from 'react'
const SvgMenuIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm16 5H4v2h16z" />
    </svg>
)
export default SvgMenuIcon
