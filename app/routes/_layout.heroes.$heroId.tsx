import type { MetaFunction } from '@remix-run/node'

import { useParams } from '@remix-run/react'

import { Spinner } from '@nextui-org/spinner'

import { AlertIcon } from '~/components/icons'

import { isHeroInGoldMine, useHero } from '~/components/wagmi/hooks'
import { HeroImage } from '~/components/hero/HeroImage'
import { HeroStats } from '~/components/hero/HeroStats'
import { HeroAction } from '~/components/hero/HeroAction'
import { HeroChips } from '~/components/hero/HeroChips'

import { GoldMineAction } from '~/components/goldmine/GoldMineAction'
import { GoldMineInfo } from '~/components/goldmine/GoldMineInfo'
import { HeroEndedAuctionInfo } from '~/components/hero/HeroEndedAuctionInfo'
import { HeroInventory } from '~/components/hero/HeroInventory'
import { AttributesGrid } from '~/components/ui/AttributesGrid'

export const meta: MetaFunction = ({ params }) => {
    return [
        { title: `0xHeroes - Hero #${params.heroId}` },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function HeroPage() {
    const params = useParams()

    const { hero, isError, isFetching, isSuccess, error } = useHero(
        params.heroId !== undefined ? BigInt(params.heroId) : undefined,
        true
    )

    console.log(error)

    if (isError) {
        return <AlertIcon className="w-12 text-danger" />
    } else if (!isSuccess || isFetching) {
        return (
            <div className="flex justify-center">
                <Spinner color="default" size="lg" />
            </div>
        )
    }

    if (params.heroId === undefined || hero == undefined) {
        return null
    }

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <HeroImage hero={hero} />

            <div className="order-3 row-span-2 flex flex-col gap-4 md:order-2">
                <div>
                    <div className="text-xs text-default-500">
                        0xHero #{hero?.id.toString()}
                    </div>

                    <HeroChips hero={hero} />

                    <div className="text-4xl">{hero?.name}</div>

                    <div>{hero?.description}</div>
                </div>

                <HeroEndedAuctionInfo hero={hero} />

                {isHeroInGoldMine(hero) ? (
                    <>
                        <GoldMineInfo hero={hero} />
                        <GoldMineAction hero={hero} />
                    </>
                ) : hero.isInAuction ? null : (
                    <HeroAction hero={hero} />
                )}

                <HeroInventory hero={hero} />
            </div>

            <HeroStats hero={hero} className="order-2 md:order-3" />
        </div>
    )
}
