import { useEffect, useState } from 'react'
import { useParams } from '@remix-run/react'

import * as blockies from 'blockies-ts'

import { redirect } from '@remix-run/node'

import { isAddress } from 'viem'

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node'

import {
    useBalanceOf,
    getTokenOfOwnerByIndex,
    useBalanceOfInGoldMine,
    getTokenOfOwnerByIndexInGoldMine,
} from '~/components/wagmi/hooks'
import { HeroesGrid } from '~/components/hero/HeroesGrid'

export async function loader({ params }: LoaderFunctionArgs) {
    if (
        params.address === undefined ||
        params.address === null ||
        !isAddress(params.address)
    ) {
        throw redirect('/explore', 301)
    }
    return null
}

export const meta: MetaFunction = () => {
    return [
        { title: '0xHeroes - User' },
        { name: 'description', content: 'Welcome to Remix!' },
    ]
}

export default function UserPage() {
    const params = useParams()

    const [inClientMode, setInClientMode] = useState<boolean>(false)

    const [heroIds, setHeroIds] = useState<bigint[]>([])
    const [goldMineHeroIds, setGoldMineHeroIds] = useState<bigint[]>([])

    const { balance } = useBalanceOf(params.address)
    const { balance: balanceInGoldMine } = useBalanceOfInGoldMine(
        params.address
    )

    useEffect(() => {
        setInClientMode(true)
    }, [])

    useEffect(() => {
        async function updateTokens() {
            let result: bigint[] = []

            for (let index = 0; index < balance!; index++) {
                result.push(
                    (await getTokenOfOwnerByIndex(
                        params.address,
                        index
                    )) as bigint
                )
            }

            setHeroIds(result)
        }

        if (balance === undefined) {
            setHeroIds([])
            return
        }

        updateTokens()
    }, [balance])

    useEffect(() => {
        async function updateTokens() {
            let result: bigint[] = []

            for (let index = 0; index < balanceInGoldMine!; index++) {
                result.push(
                    (await getTokenOfOwnerByIndexInGoldMine(
                        params.address,
                        index
                    )) as bigint
                )
            }

            setGoldMineHeroIds(result)
        }

        if (balanceInGoldMine === undefined) {
            setGoldMineHeroIds([])
            return
        }

        updateTokens()
    }, [balanceInGoldMine])

    const totalHeroIds = heroIds.concat(goldMineHeroIds).sort((a, b) => {
        if (a > b) {
            return 1
        } else if (a < b) {
            return -1
        } else {
            return 0
        }
    })

    return (
        <>
            <div className="flex items-center text-4xl gap-2">
                {inClientMode && (
                    <img
                        src={blockies
                            .create({ seed: params.address })
                            .toDataURL()}
                        style={{
                            borderRadius: 999,
                            width: 32,
                            height: 32,
                        }}
                    />
                )}
                {`${params.address!.slice(0, 4)}...${params.address!.slice(-4)}`}
            </div>

            <HeroesGrid heroIds={totalHeroIds} showHeroesInGoldMine={true} />
        </>
    )
}
