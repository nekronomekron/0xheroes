import { formatEther } from 'ethers/utils'

import { useStakedGold } from '../wagmi/hooks'

import { Hero } from '../types/Hero'

import { Chip } from '@nextui-org/react'

type GoldMineInfoProps = {
    hero: Hero
}

export const GoldMineInfo = ({ hero }: GoldMineInfoProps) => {
    const { stakedGold } = useStakedGold(hero.id, true)

    if (stakedGold === undefined) return null

    return (
        <div className="flex content-center gap-2">
            Staked ca.{' '}
            <Chip color="warning" variant="bordered">
                {formatEther(stakedGold)} 0xG
            </Chip>
        </div>
    )
}
