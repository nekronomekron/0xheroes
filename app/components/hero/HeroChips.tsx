import { Chip } from '@nextui-org/react'
import { Link } from '@nextui-org/react'

import { Hero } from '../types/Hero'
import { isHeroInGoldMine, useOwnerOfHero } from '../wagmi/hooks'

import { UserIcon } from '../icons'

type HeroChipsProps = {
    hero: Hero
}

export const HeroChips = ({ hero }: HeroChipsProps) => {
    const { owner } = useOwnerOfHero(hero.id)

    return (
        <div className="flex gap-2">
            {owner !== undefined && owner !== null && (
                <Chip
                    as={Link}
                    href={`/users/${owner}`}
                    variant="bordered"
                    startContent={<UserIcon className="w-4" />}
                >
                    {`${owner.slice(0, 4)}...${owner.slice(-4)}`}
                </Chip>
            )}

            {hero?.isInAuction && (
                <Chip size="sm" color="primary">
                    Auction
                </Chip>
            )}

            {isHeroInGoldMine(hero) && (
                <Chip size="sm" color="warning">
                    Gold Mine
                </Chip>
            )}
        </div>
    )
}
