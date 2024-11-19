import { useEffect, useState } from 'react'
import { Key } from '@react-types/shared'

import { useSearchParams } from '@remix-run/react'

import { HeroCard } from '~/components/hero/HeroCard'
import {
    Image,
    Select,
    SelectItem,
    Selection,
    Spinner,
} from '@nextui-org/react'

import { MoodSadIcon } from '../icons'

type HeroesGridProps = {
    showHeroesInAuction?: boolean
    showHeroesInGoldMine?: boolean
    heroIds: bigint[]
}

export const HeroesGrid = ({
    heroIds,
    showHeroesInAuction = false,
    showHeroesInGoldMine = false,
}: HeroesGridProps) => {
    const [urlParams, setUrlParams] = useSearchParams()
    const [selectedOrder, setSelectedOrder] = useState<Selection>(
        new Set<Key>(['0'])
    )
    function updateSortOrder(selection: Selection) {
        const order = (selection.valueOf() as Set<Key>).has('0') ? '0' : '1'

        setSelectedOrder(selection)

        urlParams.set('order', order)
        setUrlParams(urlParams, {
            preventScrollReset: true,
        })
    }

    useEffect(() => {
        const value = urlParams.get('order') as '0' | '1'
        setSelectedOrder(new Set<Key>([value !== null ? value : '0']))
    }, [urlParams])

    const sortedTokenIds = (selectedOrder.valueOf() as Set<Key>).has('0')
        ? [...heroIds].reverse()
        : [...heroIds]

    return (
        <div className="grid gap-4">
            <div className="flex sm:justify-end">
                <Select
                    label="Order Heroes"
                    className="w-full sm:max-w-xs rounded-lg border-2 border-solid border-gray-500"
                    defaultSelectedKeys={['0']}
                    selectedKeys={selectedOrder}
                    onSelectionChange={updateSortOrder}
                >
                    <SelectItem key="0" value="0">
                        Latest Heroes
                    </SelectItem>
                    <SelectItem key="1" value="1">
                        Oldest Heroes
                    </SelectItem>
                </Select>
            </div>

            {sortedTokenIds === undefined ? (
                <div className="flex items-center justify-center py-24">
                    <Spinner size="lg" color="default" />
                </div>
            ) : sortedTokenIds?.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                    {sortedTokenIds?.map((tokenId, index) => (
                        <HeroCard
                            tokenId={tokenId}
                            size="sm"
                            key={index}
                            showHeroInAuction={showHeroesInAuction}
                            showHeroInGoldMine={showHeroesInGoldMine}
                        />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-16">
                    <MoodSadIcon className="w-12" />
                    <p className="text-2xl">No Heroes found</p>
                </div>
            )}
        </div>
    )
}
