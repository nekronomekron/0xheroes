export type ProposalDetails = {
    index: bigint
    id: bigint
    targets: `0x${string}`[]
    values: bigint[]
    calldatas: `0x${string}`[]
    subject: string
    description: string
}

export function arrayToProposalDetails(value: any) {
    if (value === undefined || value === null) return undefined

    const proposalDetails: ProposalDetails = {
        index: BigInt(value[0]),
        id: BigInt(value[1]),
        targets: value[2],
        values: (value[3] as string[]).map((item) => BigInt(item)),
        calldatas: value[4],
        subject: value[5],
        description: value[6],
    }

    return proposalDetails
}
