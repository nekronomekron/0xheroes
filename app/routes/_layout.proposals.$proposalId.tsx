import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'

import { redirect, useLoaderData, useParams } from '@remix-run/react'
import {
    decodeFunctionData,
    useProposalDetailsWithDescription,
    useProposalProposer,
    useProposalSnapshot,
    useProposalState,
} from '~/components/wagmi/hooks'
import { ProposalSnapshotCard } from '~/components/dao/ProposalSnapshotCard'
import { ProposalStateButton } from '~/components/dao/ProposalStateButton'
import { ProposalQuorumCard } from '~/components/dao/ProposalQuorumCard'
import { ProposalVotingTimeslotCard } from '~/components/dao/ProposalVotingTimeslotCard'
import { ProposalVoteCard } from '~/components/dao/ProposalVoteCard'
import { ProposalState } from '~/components/types/ProposalState'
import { ProposalActionsCard } from '~/components/dao/ProposalActionsCard'
import { ClientOnly } from 'remix-utils/client-only'

import appConfig from '~/app.config.json'

import { useCallback } from 'react'
import { Chip, Code, Link } from '@nextui-org/react'
import { UserIcon } from '~/components/icons'

import {
    MDXEditor,
    directivesPlugin,
    diffSourcePlugin,
    listsPlugin,
    AdmonitionDirectiveDescriptor,
    codeBlockPlugin,
    quotePlugin,
    thematicBreakPlugin,
    codeMirrorPlugin,
    markdownShortcutPlugin,
    linkPlugin,
    linkDialogPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes - Proposal' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export async function loader({ params }: LoaderFunctionArgs) {
    if (
        params.proposalId === undefined ||
        params.proposalId === null ||
        isNaN(Number(params.proposalId))
    )
        throw redirect('/dao')

    return params.proposalId
}

export default function ProposalPage() {
    const proposalId = BigInt(useLoaderData<typeof loader>())

    const { proposalState, isFetching } = useProposalState(proposalId)
    const { proposalDetails } = useProposalDetailsWithDescription(proposalId)
    const { proposalProposer } = useProposalProposer(proposalId)

    const { proposalSnapshot } = useProposalSnapshot(proposalId)

    const isActive =
        !isFetching &&
        proposalState !== ProposalState.Canceled &&
        proposalState !== ProposalState.Pending

    const renderAction = useCallback(
        (target: `0x${string}`, calldata: `0x${string}`) => {
            const decodedFunctionData = decodeFunctionData(target, calldata)

            if (decodedFunctionData === undefined) return null

            for (let [key, value] of Object.entries(appConfig.addresses)) {
                if (value === target) {
                    return (
                        <Code size="lg">
                            {key}.{decodedFunctionData.functionName}(
                            {decodedFunctionData.args?.map((arg) => (
                                <>
                                    <p>
                                        &nbsp;&nbsp;&nbsp;&nbsp;
                                        {arg!.toString()},
                                    </p>
                                </>
                            ))}
                            )
                        </Code>
                    )
                }
            }

            return null
        },
        []
    )

    if (proposalDetails === undefined) return null

    return (
        <div className={`grid gap-4 sm:grid-cols-${isActive ? '3' : '2'}`}>
            <div className="flex flex-col sm:col-span-3 gap-2">
                <div className="flex items-center gap-2">
                    <p className="text-4xl">
                        #{(proposalDetails.index + 1n).toString()}
                    </p>

                    <ProposalStateButton proposalState={proposalState} />
                </div>

                <div className="flex flex-1 align-middle">
                    <p className="text-small text-default-500 pr-2">
                        Proposed by
                    </p>
                    <Chip
                        as={Link}
                        href={`/users/${proposalProposer}`}
                        variant="bordered"
                        startContent={<UserIcon className="w-4" />}
                    >
                        {`${proposalProposer!.slice(0, 4)}...${proposalProposer!.slice(-4)}`}
                    </Chip>
                </div>
            </div>

            {isActive && (
                <>
                    <div
                        className={`flex flex-col ${proposalState === ProposalState.Executed || proposalState === ProposalState.Defeated ? 'sm:col-span-3' : 'sm:col-span-2'} gap-2`}
                    >
                        <ProposalVoteCard proposalId={proposalId} />
                    </div>
                    <ProposalActionsCard
                        proposalDetails={proposalDetails}
                        proposalSnapshot={proposalSnapshot}
                        proposalState={proposalState}
                    />
                </>
            )}

            {isActive && <ProposalQuorumCard proposalId={proposalId} />}
            <ProposalVotingTimeslotCard
                proposalId={proposalId}
                proposalState={proposalState}
            />
            <ProposalSnapshotCard proposalId={proposalId} />

            <div className="flex flex-col sm:col-span-3 gap-2">
                <div className="text-4xl">{proposalDetails.subject}</div>

                <p className="text-2xl">Description</p>

                <ClientOnly fallback="Loading...">
                    {() => (
                        <MDXEditor
                            className="readonly"
                            markdown={proposalDetails.description}
                            readOnly={true}
                            contentEditableClassName="prose"
                            plugins={[
                                listsPlugin(),
                                linkPlugin(),
                                linkDialogPlugin(),
                                quotePlugin(),
                                thematicBreakPlugin(),
                                codeBlockPlugin({}),
                                codeMirrorPlugin({
                                    codeBlockLanguages: {
                                        js: 'JavaScript',
                                        css: 'CSS',
                                        txt: 'Text',
                                    },
                                    codeMirrorExtensions: [],
                                }),
                                directivesPlugin({
                                    directiveDescriptors: [
                                        AdmonitionDirectiveDescriptor,
                                    ],
                                }),
                                markdownShortcutPlugin(),
                            ]}
                        />
                    )}
                </ClientOnly>
            </div>

            {proposalDetails.targets.length > 0 && (
                <div className="flex flex-1 flex-col gap-2">
                    <p className="text-2xl">Actions</p>
                    {proposalDetails.targets.map((target, index) =>
                        renderAction(target, proposalDetails.calldatas[index])
                    )}
                </div>
            )}
        </div>
    )
}
