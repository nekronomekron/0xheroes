import {
    useCastVoteWithReason,
    useExecute,
    useProposalEta,
    useQueue,
    useVotesCount,
} from '../wagmi/hooks'

import { InfoCard } from '../ui/InfoCard'
import { Button3D } from '../buttons/Button3D'
import { ProposalVoteType } from '../types/ProposalVotes'
import { useAccount } from 'wagmi'
import { formatEther } from 'ethers/utils'
import { ProposalDetails } from '../types/ProposalDetails'
import { ProposalState } from '../types/ProposalState'

type ProposalActionsCardProps = {
    proposalDetails: ProposalDetails
    proposalSnapshot: bigint | undefined
    proposalState: ProposalState | undefined
}

export const ProposalActionsCard = ({
    proposalDetails,
    proposalSnapshot,
    proposalState,
}: ProposalActionsCardProps) => {
    const account = useAccount()

    const { votesCount } = useVotesCount(account.address, proposalSnapshot)

    const { castVoteWithReason } = useCastVoteWithReason()
    const { queue } = useQueue()
    const { execute, error } = useExecute()

    const { proposalEta } = useProposalEta(proposalDetails.id)

    if (proposalState === ProposalState.Active) {
        return (
            <InfoCard title="Cast Vote">
                <div className="flex flex-col w-full gap-2">
                    {votesCount !== undefined && formatEther(votesCount)} Votes
                    <Button3D
                        isDisabled={account.address === undefined}
                        color="success"
                        onPress={() => {
                            castVoteWithReason(
                                proposalDetails.id,
                                ProposalVoteType.FOR
                            )
                        }}
                    >
                        For
                    </Button3D>
                    <Button3D
                        isDisabled={account.address === undefined}
                        color="default"
                        onPress={() => {
                            castVoteWithReason(
                                proposalDetails.id,
                                ProposalVoteType.ABSTAIN
                            )
                        }}
                    >
                        Abstain
                    </Button3D>
                    <Button3D
                        isDisabled={account.address === undefined}
                        color="danger"
                        onPress={() => {
                            castVoteWithReason(
                                proposalDetails.id,
                                ProposalVoteType.AGAINST
                            )
                        }}
                    >
                        Against
                    </Button3D>
                </div>
            </InfoCard>
        )
    } else if (proposalState === ProposalState.Succeeded) {
        return (
            <InfoCard title="Queue">
                <div className="grid grid-cols-1 w-full gap-2 content-between h-full">
                    <p>
                        Send the proposal to the execution queue.
                        <br />
                        After a delay, the proposal will be ready for execution.
                    </p>

                    <Button3D
                        isDisabled={account.address === undefined}
                        size="lg"
                        color="success"
                        onPress={() => {
                            queue(proposalDetails.id)
                        }}
                    >
                        Queue Proposal
                    </Button3D>
                </div>
            </InfoCard>
        )
    } else if (proposalState === ProposalState.Queued) {
        return (
            <InfoCard title="Queue">
                <div className="flex flex-col w-full gap-2">
                    <Button3D
                        isDisabled={
                            account.address === undefined ||
                            proposalEta === undefined ||
                            Number(proposalEta) * 1000 > Date.now()
                        }
                        color="success"
                        onPress={() => {
                            execute(proposalDetails.id)
                        }}
                    >
                        Execute Proposal
                    </Button3D>
                </div>
            </InfoCard>
        )
    } else return null
}
