import { useProposalState } from '../wagmi/hooks'

import { Chip } from '@nextui-org/react'
import { ProposalState } from '../types/ProposalState'

type ProposalStateButtonProps = {
    proposalState: ProposalState | undefined
}

export const ProposalStateButton = ({
    proposalState,
}: ProposalStateButtonProps) => {
    if (proposalState === undefined) return null

    const buttonColor = () => {
        switch (proposalState) {
            case ProposalState.Defeated:
            case ProposalState.Expired:
                return 'danger'

            case ProposalState.Queued:
                return 'warning'

            case ProposalState.Succeeded:
            case ProposalState.Active:
                return 'success'

            case ProposalState.Executed:
                return 'primary'

            case ProposalState.Pending:
            case ProposalState.Canceled:
            default:
                return 'default'
        }
    }

    return (
        <Chip size="lg" color={buttonColor()}>
            {ProposalState[proposalState]}
        </Chip>
    )
}
