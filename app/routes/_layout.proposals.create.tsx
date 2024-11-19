import { useState } from 'react'
import type { MetaFunction } from '@remix-run/node'

import { Input, Link } from '@nextui-org/react'
import { ActionList } from '~/components/dao/proposal/ActionList'
import { encodeFunctionData, usePropose } from '~/components/wagmi/hooks'
import { ProposalAction } from '~/components/dao/proposal/ProposalActionType'
import { Button3D } from '~/components/buttons/Button3D'
import { WaitForTransactionDialog } from '~/components/dialogs/WaitForTransaction'
import { useNavigate } from '@remix-run/react'
import { ErrorDialog } from '~/components/dialogs/ErrorDialog'
import { BaseError } from 'viem'
import { ClientOnly } from 'remix-utils/client-only'
import { Compartment } from '@codemirror/state'

import {
    MDXEditor,
    UndoRedo,
    BoldItalicUnderlineToggles,
    toolbarPlugin,
    directivesPlugin,
    diffSourcePlugin,
    ListsToggle,
    listsPlugin,
    DiffSourceToggleWrapper,
    AdmonitionDirectiveDescriptor,
    codeBlockPlugin,
    quotePlugin,
    thematicBreakPlugin,
    CreateLink,
    InsertThematicBreak,
    InsertCodeBlock,
    codeMirrorPlugin,
    markdownShortcutPlugin,
    InsertAdmonition,
    linkPlugin,
    linkDialogPlugin,
    ConditionalContents,
    ChangeCodeMirrorLanguage,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes - Create Proposal' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function CreateProposalPage() {
    const { propose, isPending, hash, error: proposeError } = usePropose()
    const navigate = useNavigate()

    const [subject, setSubject] = useState<string>('')
    const [description, setDescription] = useState<string>('')
    const [actions, setActions] = useState<ProposalAction[]>([])

    const [encodeError, setEncodeError] = useState<BaseError | undefined>(
        undefined
    )

    async function createProposal() {
        if (!canCreateProposal) return

        const targets: string[] = []
        const calldatas: string[] = []

        try {
            actions.forEach((action) => {
                targets.push(action.target!)

                const calldata = encodeFunctionData(
                    action.target!,
                    action.function!,
                    action.args.map((item) => item.value)
                )
                if (calldata === undefined) return

                calldatas.push(calldata)
            })

            propose(targets, [0n], calldatas, subject, description)
        } catch (error) {
            console.log(error as BaseError)
            setEncodeError(error as BaseError)
        }
    }

    const canCreateProposal =
        subject !== undefined &&
        subject.length >= 10 &&
        description !== undefined &&
        description.length >= 20 &&
        actions.length > 0 &&
        actions.reduce(
            (accumulatedActionResult, currentAction) =>
                accumulatedActionResult &&
                currentAction.target !== undefined &&
                currentAction.function !== undefined &&
                currentAction.function !== '' &&
                currentAction.args.reduce(
                    (accumulatedArgumentResult, currentArgument) =>
                        accumulatedArgumentResult &&
                        currentArgument.value !== '',
                    true
                ),
            true
        )

    function gotoDaoPage() {
        navigate(`/dao`)
    }

    function resetError() {
        setEncodeError(undefined)
    }

    return (
        <div className="flex flex-1 flex-col gap-4">
            <ErrorDialog
                error={encodeError !== undefined ? encodeError : proposeError}
                onClose={resetError}
            />

            <WaitForTransactionDialog
                transactionHash={hash}
                onClose={() => gotoDaoPage()}
            />

            <p className="text-2xl">Create Proposal</p>

            <div className="flex flex-1 flex-col">
                <Input
                    className="border-2 border-solid border-gray-500 rounded-lg"
                    type="text"
                    label="Subject"
                    value={subject}
                    onValueChange={setSubject}
                />
                <p
                    className={`text-sm ${subject.length > 20 ? 'text-default-500' : 'text-danger-500'}`}
                >
                    min. 10 characters
                </p>
            </div>

            <div className="flex flex-1 flex-col">
                <ClientOnly fallback="Loading...">
                    {() => (
                        <MDXEditor
                            className="border-1 rounded-large shadow-lg"
                            markdown={description}
                            onChange={setDescription}
                            contentEditableClassName="prose"
                            placeholder="Proposal Description"
                            plugins={[
                                listsPlugin(),
                                linkPlugin(),
                                linkDialogPlugin(),
                                quotePlugin(),
                                thematicBreakPlugin(),
                                codeBlockPlugin({
                                    defaultCodeBlockLanguage: 'txt',
                                }),
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
                                diffSourcePlugin({
                                    viewMode: 'rich-text',
                                }),
                                markdownShortcutPlugin(),
                                toolbarPlugin({
                                    toolbarContents: () => (
                                        <DiffSourceToggleWrapper
                                            options={['rich-text', 'source']}
                                        >
                                            <UndoRedo />
                                            <BoldItalicUnderlineToggles />
                                            <ListsToggle />
                                            <CreateLink />
                                            <InsertThematicBreak />
                                            <InsertAdmonition />

                                            <ConditionalContents
                                                options={[
                                                    {
                                                        when: (editor) =>
                                                            editor?.editorType ===
                                                            'codeblock',
                                                        contents: () => (
                                                            <ChangeCodeMirrorLanguage />
                                                        ),
                                                    },
                                                    {
                                                        fallback: () => (
                                                            <>
                                                                <InsertCodeBlock />
                                                            </>
                                                        ),
                                                    },
                                                ]}
                                            />
                                        </DiffSourceToggleWrapper>
                                    ),
                                }),
                            ]}
                        />
                    )}
                </ClientOnly>

                <p
                    className={`text-sm ${description.length > 20 ? 'text-default-500' : 'text-danger-500'}`}
                >
                    min. 20 characters
                </p>
            </div>
            <ActionList actions={actions} setActions={setActions} />

            <div className="flex flex-1 gap-4 justify-end">
                <Link color="danger" href="/dao">
                    Cancel
                </Link>
                <Button3D
                    size="lg"
                    color="warning"
                    isDisabled={!canCreateProposal}
                    isLoading={isPending}
                    onPress={() => createProposal()}
                >
                    {isPending ? 'Create Tx' : 'Create Proposal'}
                </Button3D>
            </div>
        </div>
    )
}
