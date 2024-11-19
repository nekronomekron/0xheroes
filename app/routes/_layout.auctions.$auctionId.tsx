import { useEffect, useState } from 'react'

import type { MetaFunction } from '@remix-run/node'

import { useParams } from '@remix-run/react'
import { Accordion, AccordionItem, Image } from '@nextui-org/react'

import { Spinner } from '@nextui-org/spinner'

import { useAuction, useHero } from '~/components/wagmi/hooks'
import { AuctionInfo } from '~/components/auction/AuctionInfo'
import { HeroImage } from '~/components/hero/HeroImage'
import { AuctionBidList } from '~/components/auction/AuctionBidList'
import { AuctionAction } from '~/components/auction/AuctionAction'
import { HeroStats } from '~/components/hero/HeroStats'

import { AlertIcon } from '~/components/icons'
import { useTranslation } from 'react-i18next'

export const meta: MetaFunction = ({ params }) => {
    return [
        { title: `0xHeroes - Auction #${params.auctionId}` },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function AuctionPage() {
    const params = useParams()
    const { t } = useTranslation()

    const { auction, isError, isFetching, isSuccess } = useAuction(
        params.auctionId !== undefined ? BigInt(params.auctionId) : undefined
    )
    const { hero } = useHero(auction?.tokenId, true)

    if (isError) {
        return (
            <div className="flex justify-center text-2xl gap-2 text-danger items-center flex-col">
                <AlertIcon className="w-12" />
                <p className="text-center">
                    Not able to load auction from Blockchain.
                </p>
            </div>
        )
    } else if (!isSuccess || isFetching) {
        return (
            <div className="flex justify-center">
                <Spinner color="default" size="lg" />
            </div>
        )
    }

    if (
        params.auctionId === undefined ||
        auction === undefined ||
        hero == undefined
    ) {
        return null
    }

    return (
        <>
            <div className="flex flex-1 flex-col md:hidden gap-4">
                <div>
                    <div className="text-xs text-default-500">
                        0xHero #{hero?.id.toString()}
                    </div>
                    <div className="text-4xl">{hero?.name}</div>
                    <div>{hero?.description}</div>
                </div>

                <AuctionInfo auction={auction} />

                <HeroImage hero={hero} />

                <Accordion variant="bordered">
                    <AccordionItem
                        key="1"
                        aria-label="Hero Stats"
                        title="Hero Stats"
                    >
                        <HeroStats hero={hero} />
                    </AccordionItem>
                </Accordion>

                <Accordion variant="bordered" selectedKeys={new Set(['1'])}>
                    <AccordionItem key="1" aria-label="Auction" title="Auction">
                        <AuctionAction auction={auction} />
                        <AuctionBidList
                            auctionId={auction.id}
                            tokenId={hero.id}
                        />
                    </AccordionItem>
                </Accordion>
            </div>

            <div className="hidden md:grid grid-cols-1 gap-4 md:grid-cols-2">
                <HeroImage hero={hero} />

                <div className="row-span-2 flex flex-col gap-4">
                    <div>
                        <div className="text-xs text-default-500">
                            0xHero #{hero?.id.toString()}
                        </div>
                        <div className="text-4xl">{hero?.name}</div>
                        <div>{hero?.description}</div>
                    </div>

                    <AuctionInfo auction={auction} />
                    <AuctionAction auction={auction} />
                    <AuctionBidList auctionId={auction.id} tokenId={hero.id} />
                </div>

                <HeroStats hero={hero} />
            </div>
        </>
    )
}
