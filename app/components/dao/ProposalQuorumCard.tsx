import { Button, Card, CardBody, Link } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { AlertIcon } from '../icons'

import { useProposalQuorum, useProposalSnapshot } from '../wagmi/hooks'
import { useAccount } from 'wagmi'
import { formatEther } from 'ethers/utils'
import { InfoCard } from '../ui/InfoCard'

type ProposalQuorumCardProps = {
    proposalId: bigint
}

export const ProposalQuorumCard = ({ proposalId }: ProposalQuorumCardProps) => {
    const { proposalSnapshot } = useProposalSnapshot(proposalId)

    const { proposalQuorum, isError, isFetching } =
        useProposalQuorum(proposalSnapshot)

    return (
        <InfoCard
            title="Vote Threshold"
            isError={isError}
            isFetching={isFetching}
        >
            {!isFetching &&
            proposalQuorum !== null &&
            proposalQuorum !== undefined ? (
                <div className="grid grid-cols-1 w-full gap-2 content-end h-full text-4xl text-warning">
                    {formatEther(proposalQuorum.toString())} 0xG
                </div>
            ) : (
                <p>No data</p>
            )}
        </InfoCard>
    )
}
