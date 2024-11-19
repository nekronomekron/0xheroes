import { useState, useEffect } from 'react'
import { useNavigate } from '@remix-run/react'

import { useDebounceValue } from 'usehooks-ts'

import { useAccount } from 'wagmi'
import { parseEther, formatEther } from 'viem'

import { Input } from '@nextui-org/react'

import { useCreateBid, useSettleAuction } from '../wagmi/hooks'

import { Button3D } from '../buttons/Button3D'
import { Auction } from '../types/Auction'

import { WaitForTransactionDialog } from '../dialogs/WaitForTransaction'
import { ErrorDialog } from '../dialogs/ErrorDialog'
import { useTranslation } from 'react-i18next'

type AuctionActionProps = {
    auction: Auction
}

export const AuctionAction = (props: AuctionActionProps) => {
    const { address } = useAccount()
    const navigate = useNavigate()
    const { t } = useTranslation()

    const [debouncedBidValue, setDebouncedBidValue] = useDebounceValue<bigint>(
        0n,
        500
    )

    const {
        hash: createBidHash,
        isPending: createBidIsPending,
        createBid,
        error: createBidError,
    } = useCreateBid(props.auction.id)

    const {
        hash: settleAuctionHash,
        isPending: settleAuctionIsPending,
        settleAuction,
        error: settleAuctionError,
    } = useSettleAuction(props.auction.id)

    const [isAuctionFinished, setIsAuctionFinished] = useState<boolean>(false)

    useEffect(() => {
        if (props.auction === undefined || props.auction === null) return

        updateAuctionStatus()

        if (isAuctionFinished) return

        const interval = setInterval(() => {
            updateAuctionStatus()
        }, 1000)

        return () => clearInterval(interval)
    }, [props.auction])

    function updateAuctionStatus() {
        if (props.auction.firstBidTime > 0) {
            const secondsUntilEnd = Number(
                props.auction.firstBidTime +
                    props.auction.duration -
                    Math.round(Date.now() / 1000)
            )
            setIsAuctionFinished(secondsUntilEnd <= 0)
        } else {
            setIsAuctionFinished(false)
        }
    }

    const minBidValue = () => {
        if (props.auction.amount > 0n) {
            return (props.auction.amount * 105n) / 100n
        } else {
            return props.auction.reservePrice
        }
    }

    function reloadLocation() {
        window.location.reload()
    }

    function gotoHeroPage() {
        navigate(`/heroes/${props.auction.tokenId!.toString()}`)
    }

    if (address === undefined || address === null) return null

    return (
        <>
            <ErrorDialog
                error={
                    createBidError !== null && createBidError !== undefined
                        ? createBidError
                        : settleAuctionError
                }
                onClose={reloadLocation}
            />

            <WaitForTransactionDialog
                transactionHash={
                    createBidHash !== undefined && createBidHash !== null
                        ? createBidHash
                        : settleAuctionHash
                }
                onClose={() =>
                    createBidHash !== undefined
                        ? reloadLocation()
                        : gotoHeroPage()
                }
            />

            {!isAuctionFinished ? (
                <div className="flex gap-1">
                    <div className="flex flex-1 flex-col">
                        <Input
                            className="border-2 border-solid border-gray-500 rounded-lg"
                            placeholder="0.00"
                            onValueChange={(value) => {
                                if (
                                    (value &&
                                        value.length > 0 &&
                                        !isNaN(Number(value))) as boolean
                                ) {
                                    setDebouncedBidValue(parseEther(value))
                                } else {
                                    setDebouncedBidValue(0n)
                                }
                            }}
                            isInvalid={
                                debouncedBidValue > 0n &&
                                debouncedBidValue < minBidValue()
                            }
                            errorMessage={
                                debouncedBidValue > 0n &&
                                debouncedBidValue < minBidValue() &&
                                `Please increase the bid value to at least ${formatEther(
                                    minBidValue()
                                )} POL.`
                            }
                            startContent={
                                <div className="pointer-events-none flex items-center">
                                    <span className="text-default-500">
                                        POL
                                    </span>
                                </div>
                            }
                        />
                        <p
                            className={`text-sm ${debouncedBidValue >= minBidValue() ? 'text-default-500' : 'text-danger-500'}`}
                        >
                            <>
                                {`Minimum bid POL ${formatEther(minBidValue())}`}
                            </>
                        </p>
                    </div>

                    <Button3D
                        color="warning"
                        size="lg"
                        isDisabled={debouncedBidValue < minBidValue()}
                        isLoading={createBidIsPending}
                        onClick={() => {
                            createBid(debouncedBidValue)
                        }}
                    >
                        {createBidIsPending
                            ? 'Create Tx'
                            : t('button.place_bid')}
                    </Button3D>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-2">
                    <p className="text-warning">
                        Auction is finished. Settle auction to mint a new hero
                        and start a new auction.
                    </p>

                    <Button3D
                        color="warning"
                        size="lg"
                        onClick={() => {
                            settleAuction()
                        }}
                        isLoading={settleAuctionIsPending}
                        isDisabled={!isAuctionFinished}
                    >
                        {settleAuctionIsPending ? 'Create Tx' : 'Settle'}
                    </Button3D>
                </div>
            )}
        </>
    )
}
