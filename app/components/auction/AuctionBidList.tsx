import { parseEther, formatEther } from 'viem'

import * as blockies from 'blockies-ts'
import { Link } from '@nextui-org/react'

import { useAuctionBidLogs } from '../wagmi/hooks'
import { BlockTimestamp } from '../wagmi/BlockTimestamp'

import appConfig from '~/app.config.json'

type AuctionBidListProps = {
    auctionId: bigint
    tokenId: bigint
}

export const AuctionBidList = ({ auctionId, tokenId }: AuctionBidListProps) => {
    const logs = useAuctionBidLogs(auctionId, tokenId)

    return (
        <div>
            <div className="grid grid-cols-1 gap-4">
                <p className="text-xl">Offers</p>

                {logs !== null && logs?.length > 0 ? (
                    logs
                        ?.sort((a, b) =>
                            (a as any).args.value < (b as any).args.value
                                ? 1
                                : (a as any).args.value > (b as any).args.value
                                  ? -1
                                  : 0
                        )
                        .map((logItem, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-2"
                            >
                                <img
                                    src={blockies
                                        .create({
                                            seed: (logItem as any).args.sender,
                                        })
                                        .toDataURL()}
                                    style={{
                                        borderRadius: 999,
                                        width: 24,
                                        height: 24,
                                    }}
                                />

                                <div className="flex flex-col items-start gap-1">
                                    <p className="text-lg">
                                        {`${(logItem as any).args.sender.slice(
                                            0,
                                            4
                                        )}...${(
                                            logItem as any
                                        ).args.sender.slice(-4)}`}
                                    </p>
                                    <BlockTimestamp
                                        blockNumber={logItem.blockNumber}
                                    />
                                </div>

                                <div className="flex grow items-center justify-end space-x-2 leading-none">
                                    <p>POL</p>
                                    <p>
                                        {formatEther(
                                            (logItem as any).args.value
                                        )}
                                    </p>
                                    <Link
                                        href={`${appConfig.explorerUri}/tx/${logItem.transactionHash}`}
                                        isExternal
                                        showAnchorIcon
                                    />
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="flex justify-center text-default-500">
                        No offers found
                    </div>
                )}
            </div>
        </div>
    )
}
