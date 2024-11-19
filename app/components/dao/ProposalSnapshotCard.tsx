import { Button, Card, CardBody, Link } from '@nextui-org/react'
import { Spinner } from '@nextui-org/react'

import { AlertIcon } from '../icons'

import { useDelegate, useProposalSnapshot, useVotesCount } from '../wagmi/hooks'
import { useAccount } from 'wagmi'
import { formatEther } from 'ethers/utils'
import { InfoCard } from '../ui/InfoCard'

type ProposalSnapshotCardProps = {
    proposalId: bigint
}

export const ProposalSnapshotCard = ({
    proposalId,
}: ProposalSnapshotCardProps) => {
    const { proposalSnapshot, isError, isFetching } =
        useProposalSnapshot(proposalId)

    return (
        <InfoCard
            title="Snapshot taken"
            isError={isError}
            isFetching={isFetching}
        >
            {!isFetching &&
            proposalSnapshot !== null &&
            proposalSnapshot !== undefined ? (
                <div className="grid grid-cols-1 w-full gap-2 content-end h-full text-4xl">
                    {proposalSnapshot.toString()}
                </div>
            ) : (
                <p>No data</p>
            )}
        </InfoCard>
    )
}
