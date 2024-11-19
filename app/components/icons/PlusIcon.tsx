import * as React from 'react'
import type { SVGProps } from 'react'
const SvgPlusIcon = (props: SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        {...props}
    >
        <path fill="currentColor" d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" />
    </svg>
)
export default SvgPlusIcon
