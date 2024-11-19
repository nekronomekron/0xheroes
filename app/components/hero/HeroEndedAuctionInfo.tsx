import { useAccount } from 'wagmi'

import { formatEther } from 'viem'

import { Hero } from '~/components/types/Hero'

import { useAuctionEndedLog } from '../wagmi/hooks'
import { Link } from '@nextui-org/react'

type HeroEndedAuctionInfoProps = {
    hero: Hero
}

export const HeroEndedAuctionInfo = ({ hero }: HeroEndedAuctionInfoProps) => {
    const logs = useAuctionEndedLog(hero.id)

    const { address } = useAccount()

    if (logs === undefined || logs === null || logs?.length == 0) return null

    return (
        <div className="grid w-full grid-cols-2 divide-x-2 divide-default-500">
            <div className="flex flex-col items-start gap-1 pe-4">
                <p className="text-xs tracking-tight text-default-500">
                    Highest bid
                </p>
                <div className="flex items-center justify-center space-x-2 text-xl leading-none">
                    {(logs![0] as any).args.amount > 0n
                        ? `${formatEther((logs![0] as any).args.amount)} POL`
                        : '--'}
                </div>
            </div>

            <div className="flex flex-col items-start gap-1 ps-4">
                <p className="text-xs tracking-tight text-default-500">
                    Winner
                </p>
                <div className="flex items-center justify-center space-x-2">
                    <Link
                        className="text-xl leading-none"
                        href={`/users/${(logs![0] as any).args.winner}`}
                    >
                        {(logs![0] as any).args.winner === address ? (
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text font-bold">
                                You
                            </div>
                        ) : (
                            <p>{`${(logs![0] as any).args.winner.slice(0, 4)}...${(logs![0] as any).args.winner.slice(-4)}`}</p>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    )
}
