import {
    useProposalDeadline,
    useProposalEta,
    useProposalSnapshot,
} from '../wagmi/hooks'
import { InfoCard } from '../ui/InfoCard'
import { ProposalState } from '../types/ProposalState'
import { useCallback } from 'react'

type ProposalVotingTimeslotCardProps = {
    proposalId: bigint
    proposalState: ProposalState | undefined
}

export const ProposalVotingTimeslotCard = ({
    proposalId,
    proposalState,
}: ProposalVotingTimeslotCardProps) => {
    const {
        proposalSnapshot,
        isError: isErrorSnapshot,
        isFetching: isFetchingSnapshot,
    } = useProposalSnapshot(proposalId)

    const {
        proposalDeadline,
        isError: isErrorDeadline,
        isFetching: isFetchingDeadline,
    } = useProposalDeadline(proposalId)

    const { proposalEta } = useProposalEta(proposalId)

    const timestamp =
        Number(proposalSnapshot) * 1000 > Date.now()
            ? proposalSnapshot
            : proposalDeadline

    const renderTitle = useCallback(() => {
        if (proposalState === ProposalState.Active) return 'End'
        else if (proposalState === ProposalState.Pending) return 'Start'
        else return 'ETA'
    }, [timestamp, proposalState])

    const renderContent = useCallback(() => {
        if (
            proposalState === ProposalState.Canceled ||
            proposalState === ProposalState.Defeated ||
            proposalState === ProposalState.Succeeded ||
            proposalState === ProposalState.Executed ||
            proposalState === ProposalState.Expired
        ) {
            return (
                <div className="grid grid-cols-1 w-full gap-2 content-end h-full text-4xl">
                    Finished
                </div>
            )
        } else if (proposalState === ProposalState.Queued) {
            if (proposalEta === null || proposalEta === undefined)
                return <div className="text-4xl">No data</div>
            else
                return (
                    <div className="grid grid-cols-1 w-full gap-2 content-end h-full">
                        <div className="text-default-500">
                            {new Date(
                                Number(proposalEta) * 1000
                            ).toLocaleTimeString()}
                        </div>
                        <div className="text-4xl">
                            {new Date(
                                Number(proposalEta) * 1000
                            ).toLocaleDateString()}
                        </div>
                    </div>
                )
        } else {
            if (timestamp === null || timestamp === undefined)
                return <div className="text-4xl">No data</div>
            else
                return (
                    <div className="grid grid-cols-1 w-full gap-2 content-end h-full">
                        <div className="text-default-500">
                            {new Date(
                                Number(timestamp) * 1000
                            ).toLocaleTimeString()}
                        </div>
                        <div className="text-4xl">
                            {new Date(
                                Number(timestamp) * 1000
                            ).toLocaleDateString()}
                        </div>
                    </div>
                )
        }
    }, [timestamp, proposalState, proposalEta])

    return (
        <InfoCard
            title={renderTitle()}
            isError={isErrorSnapshot || isErrorDeadline}
            isFetching={isFetchingSnapshot || isFetchingDeadline}
        >
            {renderContent()}
        </InfoCard>
    )
}
