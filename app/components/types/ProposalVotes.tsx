export type ProposalVotes = {
    for: bigint
    abstain: bigint
    against: bigint
}

export enum ProposalVoteType {
    AGAINST,
    FOR,
    ABSTAIN,
}

export function arrayToProposalVotes(value: any) {
    if (value === undefined || value === null) return undefined

    const proposalVotes: ProposalVotes = {
        against: BigInt(value[0]),
        for: BigInt(value[1]),
        abstain: BigInt(value[2]),
    }

    return proposalVotes
}
