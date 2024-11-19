import { Button } from '@nextui-org/button'
import { Link } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { AlertIcon } from '../icons'

import { formatEther } from 'ethers/utils'

import appConfig from '~/app.config.json'
import { useTreasury } from '../wagmi/hooks'

export const TreasuryButton = () => {
    const { data, isError, isLoading } = useTreasury()

    return (
        <Button
            variant="bordered"
            as={Link}
            href={`${appConfig.explorerUri}/address/${appConfig.addresses['0xAuctionHouse']}`}
            isExternal
        >
            <p className="hidden text-default-500 md:inline">Treasury</p>{' '}
            {isError ? (
                <AlertIcon className="w-6 text-danger" />
            ) : !isLoading && data !== null && data?.value !== undefined ? (
                <div className="font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                    {formatEther(data?.value)} {data?.symbol}
                </div>
            ) : (
                <Spinner size="sm" color="default" />
            )}
        </Button>
    )
}
