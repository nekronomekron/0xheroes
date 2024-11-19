import { Chip, CardProps, Card, Spinner, Link } from '@nextui-org/react'
import { useInView } from 'react-intersection-observer'

import {
    isHeroInGoldMine,
    useHero,
    useAuctionIdForTokenId,
} from '../wagmi/hooks'
import { HeroImage } from './HeroImage'

type HeroCardProps = {
    tokenId: bigint | string
    size: 'sm' | 'md' | 'lg'
    showHeroInAuction?: boolean
    showHeroInGoldMine?: boolean
} & CardProps

export const HeroCard = ({
    tokenId,
    size,
    showHeroInAuction = false,
    showHeroInGoldMine = false,
    ...rest
}: HeroCardProps) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        fallbackInView: true,
    })

    const { hero, isSuccess, isFetching, isError } = useHero(tokenId, inView)
    const { auctionIdForTokenId } = useAuctionIdForTokenId(tokenId)

    if (
        (hero?.isInAuction && !showHeroInAuction) ||
        (isHeroInGoldMine(hero) && !showHeroInGoldMine)
    )
        return null

    return (
        <div ref={ref}>
            {inView ? (
                <Card
                    {...rest}
                    isPressable
                    as={Link}
                    href={
                        hero?.isInAuction
                            ? `/auctions/${auctionIdForTokenId}`
                            : `/heroes/${tokenId}`
                    }
                    fullWidth
                    radius="none"
                    className="aspect-square bg-transparent"
                    shadow="none"
                >
                    {isFetching ? (
                        <Spinner
                            size={size}
                            className="size-full"
                            color="default"
                        />
                    ) : (
                        <>
                            <HeroImage hero={hero} />

                            <div
                                className={`absolute left-0 top-0 z-10 ${size === 'sm' ? 'text-md' : size === 'md' ? 'text-lg' : 'text-xl'} font-light text-primary-foreground flex flex-col h-full p-2`}
                            >
                                <p className="grow">{hero?.name}</p>

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
                        </>
                    )}
                </Card>
            ) : null}
        </div>
    )
}
