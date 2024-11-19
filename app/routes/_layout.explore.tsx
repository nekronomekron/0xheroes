import { useEffect, useState } from 'react'
import type { MetaFunction } from '@remix-run/node'

import { useTotalSupply, getTokenByIndex } from '~/components/wagmi/hooks'

import { HeroesGrid } from '~/components/hero/HeroesGrid'

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function ExplorePage() {
    const { totalSupply } = useTotalSupply()

    const [heroIds, setHeroIds] = useState<bigint[]>([])

    useEffect(() => {
        async function updateTokens() {
            let result: bigint[] = []

            for (let index = 0; index < totalSupply!; index++) {
                result.push((await getTokenByIndex(index)) as bigint)
            }

            setHeroIds(result)
        }

        if (totalSupply === undefined) {
            setHeroIds([])
            return
        }

        updateTokens()
    }, [totalSupply])

    return (
        <HeroesGrid
            heroIds={heroIds}
            showHeroesInGoldMine={true}
            showHeroesInAuction={true}
        />
    )
}
