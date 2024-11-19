import { Progress } from '@nextui-org/react'

import {
    useProposalQuorum,
    useProposalSnapshot,
    useProposalVotes,
} from '../wagmi/hooks'

import { InfoCard } from '../ui/InfoCard'
import { formatEther } from 'viem'

type ProposalVoteCardProps = {
    proposalId: bigint
}

export const ProposalVoteCard = ({ proposalId }: ProposalVoteCardProps) => {
    const {
        proposalSnapshot,
        isError: isErrorSnapshot,
        isFetching: isFetchingSnapshot,
    } = useProposalSnapshot(proposalId)

    const {
        proposalQuorum,
        isError: isErrorQuorum,
        isFetching: isFetchingQuorum,
    } = useProposalQuorum(proposalSnapshot)

    const {
        proposalVotes,
        isError: isErrorVotes,
        isFetching: isFetchingVotes,
    } = useProposalVotes(proposalId)

    const isFetching = isFetchingQuorum || isFetchingVotes || isFetchingSnapshot
    const hasError = isErrorSnapshot || isErrorQuorum || isErrorVotes
    const resultsReceived =
        !hasError &&
        !isFetching &&
        proposalQuorum !== undefined &&
        proposalVotes !== undefined

    const totalVotes = resultsReceived
        ? proposalVotes!.for + proposalVotes!.abstain + proposalVotes!.against
        : 1n

    const forVotesPercentage =
        resultsReceived && proposalVotes!.for > 0n
            ? Math.min(100, Number((proposalVotes!.for * 100n) / totalVotes))
            : 0

    const abstainVotesPercentage =
        resultsReceived && proposalVotes!.abstain > 0n
            ? Math.min(
                  100,
                  Number((proposalVotes!.abstain * 100n) / totalVotes)
              )
            : 0
    const againstVotesPercentage =
        resultsReceived && proposalVotes!.against > 0n
            ? Math.min(
                  100,
                  Number((proposalVotes!.against * 100n) / totalVotes)
              )
            : 0

    if (proposalVotes === undefined) return null

    return (
        <InfoCard title="Votes" isError={hasError} isFetching={isFetching}>
            <div className="flex flex-col w-full gap-2">
                <Progress
                    label={`For (${formatEther(proposalVotes!.for)} 0xG)`}
                    value={forVotesPercentage}
                    color="success"
                    showValueLabel={true}
                />
                <Progress
                    label={`Abstain (${formatEther(proposalVotes!.abstain)} 0xG)`}
                    value={abstainVotesPercentage}
                    color="default"
                    showValueLabel={true}
                />
                <Progress
                    label={`Against (${formatEther(proposalVotes!.against)} 0xG)`}
                    value={againstVotesPercentage}
                    color="danger"
                    showValueLabel={true}
                />
            </div>
        </InfoCard>
    )
}
