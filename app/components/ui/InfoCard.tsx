import { Button, Card, CardBody, Link } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { AlertIcon } from '../icons'

import { useProposalQuorum, useProposalSnapshot } from '../wagmi/hooks'
import { useAccount } from 'wagmi'
import { formatEther } from 'ethers/utils'
import { Children, PropsWithChildren } from 'react'

type InfoCardProps = PropsWithChildren & {
    title: string
    isError?: boolean
    isFetching?: boolean
}

export const InfoCard = ({
    title,
    isError = false,
    isFetching = false,
    children,
}: InfoCardProps) => {
    return (
        <Card
            fullWidth={true}
            classNames={{
                base: 'bg-gradient-to-tl from-cyan-100 to-lime-100',
            }}
        >
            <CardBody className="flex flex-col gap-2 p-4">
                <p className="text-sm">{title}</p>

                {isError || isFetching ? (
                    <div className="flex justify-center items-center h-full">
                        {isError ? (
                            <AlertIcon className="w-10 text-danger" />
                        ) : (
                            <Spinner size="lg" color="default" />
                        )}
                    </div>
                ) : (
                    <div className="flex justify-start items-center h-full">
                        {children}
                    </div>
                )}
            </CardBody>
        </Card>
    )
}
