import { Image } from '@nextui-org/react'

import { Hero } from '../types/Hero'

type HeroImageProps = {
    hero: Hero | undefined
}

export const HeroImage = ({ hero }: HeroImageProps) => {
    return (
        <Image src={hero?.imageData} removeWrapper className="w-full h-full" />
    )
}
