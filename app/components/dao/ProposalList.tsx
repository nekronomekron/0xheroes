import { useEffect, useState } from 'react'
import { Key } from '@react-types/shared'

import { useSearchParams } from '@remix-run/react'

import { MoodSadIcon } from '../icons'
import { Button3D } from '../buttons/Button3D'

import { Link } from '@nextui-org/react'

import {
    useProposalCount,
    getProposalDetailsAt,
    useVotesCount,
} from '../wagmi/hooks'

import { ProposalCell } from './ProposalCell'

import { Select, SelectItem, Selection, Spinner } from '@nextui-org/react'
import { useAccount } from 'wagmi'

import appConfig from '~/app.config.json'

type ProposalListProps = React.HTMLAttributes<HTMLDivElement> & {}

export const ProposalList = ({ className }: ProposalListProps) => {
    const account = useAccount()

    const [urlParams, setUrlParams] = useSearchParams()
    const { proposalCount, isFetching } = useProposalCount()
    const [selectedOrder, setSelectedOrder] = useState<Selection>(
        new Set<Key>(['0'])
    )
    const [proposalIds, setProposalIds] = useState<bigint[] | undefined>(
        undefined
    )

    const {
        votesCount,
        isFetching: isFetchingVotesCount,
        isError,
    } = useVotesCount(account.address, false)

    useEffect(() => {
        async function onLoadData() {
            const proposalIds: bigint[] = []
            for (let index = 0n; index < proposalCount!; index++) {
                const proposalDetails = await getProposalDetailsAt(index)
                if (
                    proposalDetails !== undefined &&
                    proposalDetails !== null &&
                    Array.isArray(proposalDetails)
                )
                    proposalIds.push(proposalDetails[0] as bigint)
            }
            setProposalIds(proposalIds)
        }

        if (proposalCount === undefined) return

        onLoadData()
    }, [proposalCount])

    useEffect(() => {
        const value = urlParams.get('order') as '0' | '1'
        setSelectedOrder(new Set<Key>([value !== null ? value : '0']))
    }, [urlParams])

    const sortedProposalIds =
        proposalIds === undefined
            ? undefined
            : (selectedOrder.valueOf() as Set<Key>).has('0')
              ? [...proposalIds!].reverse()
              : [...proposalIds!]

    function updateSortOrder(selection: Selection) {
        const order = (selection.valueOf() as Set<Key>).has('0') ? '0' : '1'

        setSelectedOrder(selection)

        urlParams.set('order', order)
        setUrlParams(urlParams, {
            preventScrollReset: true,
        })
    }

    return (
        <div className={className}>
            <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex sm:justify-start">
                        {account.address !== undefined && (
                            <Button3D
                                size="lg"
                                color="warning"
                                className="w-full sm:max-w-xs"
                                as={Link}
                                href="/proposals/create"
                                isLoading={isFetchingVotesCount}
                                isDisabled={
                                    votesCount === undefined ||
                                    votesCount <
                                        appConfig['daoSettings'][
                                            'governorInitialProposalThreshold'
                                        ]
                                }
                            >
                                Create Proposal
                            </Button3D>
                        )}
                    </div>

                    <div className="flex sm:justify-end">
                        <Select
                            label="Order Proposals"
                            className="w-full sm:max-w-xs rounded-lg border-2 border-solid border-gray-500"
                            defaultSelectedKeys={['0']}
                            selectedKeys={selectedOrder}
                            onSelectionChange={updateSortOrder}
                        >
                            <SelectItem key="0" value="0">
                                Latest Proposal
                            </SelectItem>
                            <SelectItem key="1" value="1">
                                Oldest Proposal
                            </SelectItem>
                        </Select>
                    </div>
                </div>

                {isFetching || proposalIds === undefined ? (
                    <div className="flex items-center justify-center py-24">
                        <Spinner size="lg" color="default" />
                    </div>
                ) : proposalIds.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <MoodSadIcon className="w-12" />
                        <p className="text-2xl">No proposals found</p>
                    </div>
                ) : (
                    sortedProposalIds!.map((proposalId, index) => (
                        <ProposalCell key={index} proposalId={proposalId} />
                    ))
                )}
            </div>
        </div>
    )
}
