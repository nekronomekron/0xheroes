import { ProposalArgument } from './ProposalActionArgumentType'

export type ProposalAction = {
    id: number
    target: `0x${string}` | undefined
    function: string | undefined
    args: ProposalArgument[]
}
