import {
    useProposalDetailsWithDescription,
    useProposalProposer,
    useProposalState,
} from '../wagmi/hooks'
import { ProposalStateButton } from './ProposalStateButton'

import { Card, CardBody, Link } from '@nextui-org/react'

type ProposalCellProps = {
    proposalId: bigint
}

export const ProposalCell = ({ proposalId }: ProposalCellProps) => {
    const { proposalDetails } = useProposalDetailsWithDescription(proposalId)
    const { proposalProposer } = useProposalProposer(proposalId)
    const { proposalState } = useProposalState(proposalId)

    if (proposalDetails === undefined) return null

    return (
        <Card
            isPressable
            as={Link}
            href={`/proposals/${proposalDetails.id}`}
            fullWidth
        >
            <CardBody>
                <div className="flex gap-2">
                    <div className="text-4xl">
                        #{(proposalDetails.index + 1n).toString()}
                    </div>
                    <div className="flex flex-col gap-2">
                        <p className="text-xl">{proposalDetails.subject}</p>
                        <p className="text-small text-default-500">
                            Proposed by: {proposalProposer}
                        </p>
                    </div>
                    <div className="grow flex justify-end items-center">
                        <ProposalStateButton proposalState={proposalState} />
                    </div>
                </div>
            </CardBody>
        </Card>
    )
}
