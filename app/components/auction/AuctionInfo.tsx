import { useState, useEffect } from 'react'

import { Auction } from '~/components/types/Auction'

import { formatEther } from 'viem'

import { secondsToLabel } from '~/utils'

type AuctionInfoProps = {
    auction: Auction | undefined
}

export const AuctionInfo = ({ auction }: AuctionInfoProps) => {
    const [countdownLabel, setCountdownLabel] = useState<string>('')

    useEffect(() => {
        if (auction === undefined || auction === null) return

        updateCountdownLabel(auction)

        const interval = setInterval(() => {
            if (auction.firstBidTime > 0n) updateCountdownLabel(auction)
        }, 1000)

        return () => clearInterval(interval)
    }, [auction])

    function updateCountdownLabel(auction: Auction) {
        let secondsUntilEnd = Number(
            auction.firstBidTime +
                auction.duration -
                Math.round(Date.now() / 1000)
        )

        setCountdownLabel(secondsToLabel(secondsUntilEnd))
    }

    if (auction === undefined) return null

    return (
        <div className="grid w-full grid-cols-2 divide-x-2 divide-default-500">
            <div className="flex flex-col items-start gap-1 pe-4">
                <p className="text-xs tracking-tight text-default-500">
                    Highest bid
                </p>
                <div className="flex items-center justify-center space-x-2 text-xl leading-none">
                    {auction.amount > 0n
                        ? `${formatEther(auction.amount)} POL`
                        : '--'}
                </div>
            </div>

            <div className="flex flex-col items-start gap-1 ps-4">
                <p className="text-xs tracking-tight text-default-500">
                    Auction ends in
                </p>
                <div className="flex items-center justify-center space-x-2 text-xl leading-none">
                    <p>{auction.firstBidTime > 0n ? countdownLabel : '--'}</p>
                </div>
            </div>
        </div>
    )
}
