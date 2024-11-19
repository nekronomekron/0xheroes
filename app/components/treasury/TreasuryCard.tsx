import { Card, CardBody, Link } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { AlertIcon } from '../icons'

import { formatEther } from 'ethers/utils'

import { useTreasury } from '../wagmi/hooks'
import { InfoCard } from '../ui/InfoCard'

export const TreasuryCard = () => {
    const { data, isError, isLoading } = useTreasury()

    return (
        <InfoCard title="Votes" isError={isError} isFetching={isLoading}>
            {data !== null && data?.value !== undefined && (
                <div className="flex flex-1 flex-col h-full items-start gap-2">
                    <div className="text-4xl bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
                        {formatEther(data?.value)} {data?.symbol}
                    </div>
                    This treasury exists for 0xHeroes DAO participants to
                    allocate resources for the long-term growth and prosperity
                    of the 0xHeroes project.
                </div>
            )}
        </InfoCard>
    )
}
