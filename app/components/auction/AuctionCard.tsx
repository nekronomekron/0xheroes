import { useState } from 'react'

import { Card, CardFooter, Link } from '@nextui-org/react'
import { Image } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { useHero, useAuction } from '../wagmi/hooks'

import { AuctionInfo } from './AuctionInfo'
import { HeroImage } from '../hero/HeroImage'

type AuctionCardProps = {
    auctionId: bigint | string
}

export const AuctionCard = ({ auctionId }: AuctionCardProps) => {
    const { auction, isFetching: isAuctionFetching } = useAuction(auctionId)
    const { hero, isFetching: isHeroFetching } = useHero(auction?.tokenId, true)

    return (
        <Card isPressable as={Link} href={`/auctions/${auctionId}`} fullWidth>
            {isAuctionFetching || isHeroFetching ? (
                <Spinner size="lg" className="size-full" color="default" />
            ) : (
                <>
                    <HeroImage hero={hero} />

                    <p className="absolute left-3 top-2 z-10 text-xl font-light text-primary-foreground">
                        {hero?.name}
                    </p>

                    <CardFooter className="absolute bottom-0 z-10 p-3">
                        <div className="bg-black/40 text-primary-foreground p-4 w-full rounded-2xl">
                            <AuctionInfo auction={auction} />
                        </div>
                    </CardFooter>
                </>
            )}
        </Card>
    )
}
