import { useState, useEffect } from 'react'
import {
    useReadContract,
    usePublicClient,
    useWriteContract,
    useBalance,
} from 'wagmi'
import { readContract } from '@wagmi/core'
import {
    parseAbiItem,
    GetLogsReturnType,
    isAddress,
    encodeFunctionData as encodeFunctionDataViem,
    decodeFunctionData as decodeFunctionDataViem,
} from 'viem'

import auctionHouse from '~/contracts/AuctionHouse.json'
import heroContract from '~/contracts/Hero.json'
import goldContract from '~/contracts/Gold.json'
import goldMineContract from '~/contracts/GoldMine.json'
import governorContract from '~/contracts/OxGovernor.json'
import iitem from '~/contracts/IItem.json'

import { Hero, jsonToHero } from '../types/Hero'
import { jsonToAuction } from '../types/Auction'

import appConfig from '~/app.config.json'
import { config } from '~/wagmi.config'
import { arrayToProposalDetails } from '../types/ProposalDetails'
import { arrayToProposalVotes, ProposalVoteType } from '../types/ProposalVotes'
import {
    jsonToHeroItemAttributes,
    jsonToHeroItemMetadata,
    tokenUriToHeroItem,
} from '../types/HeroItem'

/*
 * Utils
 */

function abiForAddress(address: `0x${string}`) {
    if (address === appConfig.addresses['0xAuctionHouse']) {
        return auctionHouse.abi
    } else if (address === appConfig.addresses['0xHero']) {
        return heroContract.abi
    } else if (address === appConfig.addresses['0xGold']) {
        return goldContract.abi
    } else if (address === appConfig.addresses['0xGoldMine']) {
        return goldMineContract.abi
    } else if (address === appConfig.addresses['0xGovernor']) {
        return governorContract.abi
    } else {
        return undefined
    }
}

export function encodeFunctionData(
    target: `0x${string}`,
    functionName: string,
    args?: readonly unknown[] | undefined
) {
    const abi = abiForAddress(target)
    if (abi === undefined) return undefined

    return encodeFunctionDataViem({
        abi: abi,
        functionName: functionName,
        args: args,
    })
}

export function decodeFunctionData(
    target: `0x${string}`,
    calldata: `0x${string}`
) {
    const abi = abiForAddress(target)
    if (abi === undefined) return undefined

    return decodeFunctionDataViem({
        abi: abi,
        data: calldata,
    })
}

/*
 * AuctionHouse
 */

export function useTreasury() {
    return useBalance({
        address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
    })
}

export function useActiveAuctions() {
    const {
        data: activeAuctions,
        isSuccess,
        isError,
        isFetching,
    } = useReadContract({
        abi: auctionHouse.abi,
        address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
        functionName: 'getActiveAuctions',
        query: {
            select: (data) => data as bigint[],
        },
    })

    return {
        activeAuctions,
        isSuccess,
        isError,
        isFetching,
    }
}

export function useAuctionIdForTokenId(tokenId: bigint | string | undefined) {
    const {
        data: auctionIdForTokenId,
        isSuccess,
        isError,
        isFetching,
    } = useReadContract({
        abi: auctionHouse.abi,
        address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
        functionName: 'auctionIdForTokenId',
        args: [tokenId],
        query: {
            select: (data) => data as bigint,
        },
    })

    return {
        auctionIdForTokenId,
        isSuccess,
        isError,
        isFetching,
    }
}

export function useAuction(auctionId: bigint | string | undefined) {
    const {
        data: auction,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: auctionHouse.abi,
        address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
        args: [auctionId],
        functionName: 'auction',
        query: {
            select: (data) => jsonToAuction(JSON.parse(data!.toString())),
        },
    })

    return {
        auction,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useAuctionBidLogs(
    auctionId: bigint | undefined,
    tokenId: bigint
) {
    const publicClient = usePublicClient()

    const [logs, setLogs] = useState<GetLogsReturnType | null>(null)

    useEffect(() => {
        async function fetchLogs() {
            if (auctionId === undefined) return

            const updatedLogs = await publicClient!.getLogs({
                address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
                event: parseAbiItem(
                    'event AuctionBid(uint256 indexed auctionId, uint256 indexed tokenId, address sender, uint256 value, bool firstBid, bool extended)'
                ),
                args: {
                    auctionId: auctionId,
                    tokenId: tokenId,
                },
                strict: true,
                fromBlock: BigInt(appConfig.blockNumber),
            })

            setLogs(updatedLogs)
        }

        if (publicClient === undefined || publicClient === null) return

        fetchLogs()

        const interval = setInterval(() => {
            fetchLogs()
        }, 10000)
        return () => clearInterval(interval)
    }, [publicClient, auctionId])

    return logs
}

export function useAuctionEndedLog(tokenId: bigint | undefined) {
    const publicClient = usePublicClient()

    const [logs, setLogs] = useState<GetLogsReturnType | null>(null)

    useEffect(() => {
        async function fetchLogs() {
            if (tokenId === undefined) return

            const auctionEndedLogs = await publicClient!.getLogs({
                address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
                event: parseAbiItem(
                    'event AuctionEnded(uint256 indexed auctionId, uint256 indexed tokenId, address tokenOwner, address winner, uint256 amount)'
                ),
                args: {
                    tokenId: tokenId,
                },
                strict: true,
                fromBlock: BigInt(appConfig.blockNumber),
            })

            setLogs(auctionEndedLogs)
        }

        if (publicClient === undefined || publicClient === null) return

        fetchLogs()
    }, [publicClient, tokenId])

    return logs
}

export function useCreateBid(auctionId: bigint | undefined) {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function createBid(value: bigint) {
        if (auctionId === undefined) return

        writeContract({
            address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
            abi: auctionHouse.abi,
            functionName: 'createBid',
            args: [auctionId, value],
            value: value,
        })
    }

    return {
        hash,
        error,
        isPending,
        createBid,
    }
}

export function useSettleAuction(auctionId: bigint | undefined) {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function settleAuction() {
        if (auctionId === undefined) return

        writeContract({
            address: appConfig.addresses['0xAuctionHouse'] as `0x${string}`,
            abi: auctionHouse.abi,
            functionName: 'endCurrentAndCreateNewAuction',
            args: [auctionId],
        })
    }

    return {
        hash,
        error,
        isPending,
        settleAuction,
    }
}

/*
 * Hero
 */

export function useHero(
    tokenId: bigint | string | undefined,
    enabled: boolean
) {
    const {
        data: hero,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'tokenURI',
        args: [tokenId],
        query: {
            select: (data) => {
                return jsonToHero(
                    JSON.parse(
                        atob(
                            data!
                                .toString()
                                .replace(/^data:\w+\/\w+;base64,/, '')
                        )
                    )
                )
            },
        },
    })

    return {
        hero,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useTotalSupply() {
    const {
        data: totalSupply,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'totalSupply',
        args: [],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        totalSupply,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export async function getTokenByIndex(index: bigint | number | string) {
    const result = await readContract(config, {
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'tokenByIndex',
        args: [index],
    })

    return result
}

export async function getTokenOfOwnerByIndex(
    owner: `0x${string}` | string | undefined,
    index: bigint | number | string
) {
    const result = await readContract(config, {
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'tokenOfOwnerByIndex',
        args: [owner, index],
    })

    return result
}

export function useOwnerOfHero(tokenId: bigint | string | undefined) {
    const {
        data: owner,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'ownerOf',
        args: [tokenId],
        query: {
            select: (data) => data as `0x${string}`,
        },
    })

    return {
        owner,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useBurnHero(tokenId: bigint | undefined) {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function burn() {
        if (tokenId === undefined) return

        writeContract({
            address: appConfig.addresses['0xHero'] as `0x${string}`,
            abi: heroContract.abi,
            functionName: 'burn',
            args: [tokenId],
        })
    }

    return {
        hash,
        error,
        isPending,
        burn,
    }
}

export function useSendHeroToGoldMine(
    tokenId: bigint | undefined,
    owner: `0x${string}` | string | undefined
) {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function sendHeroToGoldMine() {
        if (tokenId === undefined) return

        writeContract({
            address: appConfig.addresses['0xHero'] as `0x${string}`,
            abi: heroContract.abi,
            functionName: 'safeTransferFrom',
            args: [
                owner,
                appConfig.addresses['0xGoldMine'] as `0x${string}`,
                tokenId,
            ],
        })
    }

    return {
        hash,
        error,
        isPending,
        sendHeroToGoldMine,
    }
}

export function useBalanceOf(owner: `0x${string}` | string | undefined) {
    const {
        data: balance,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'balanceOf',
        args: [owner],
        query: {
            select: (data) => Number(data),
            enabled: isAddress(owner!),
        },
    })

    return {
        balance,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function isHeroInGoldMine(hero: Hero | undefined) {
    return (
        hero?.owningHeroHandler ===
        appConfig.addresses['0xGoldMine'].toLowerCase()
    )
}

/*
 * Hero Items
 */

export function useBalanceOfItems(
    tokenId: bigint | number | string | undefined
) {
    const {
        data: balanceOfItems,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'balanceOfItems',
        args: [tokenId],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        balanceOfItems,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useItemOfHero(
    itemId: bigint | number | string | undefined,
    itemContract: `0x${string}` | undefined
) {
    const {
        data: itemOfHero,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: iitem.abi,
        address: itemContract,

        functionName: 'tokenURI',
        args: [itemId],
        query: {
            select: async (data) => {
                return await tokenUriToHeroItem(data!.toString())
            },
        },
    })

    return {
        itemOfHero,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useItemAttributes(
    itemId: bigint | number | string | undefined,
    itemContract: `0x${string}` | undefined
) {
    const {
        data: itemAttributes,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: iitem.abi,
        address: itemContract,

        functionName: 'getItemAttributes',
        args: [itemId],
        query: {
            select: (data) => jsonToHeroItemAttributes(data),
        },
    })

    return {
        itemAttributes,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useItemOfHeroByIndex(
    tokenId: bigint | number | string | undefined,
    index: number
) {
    const {
        data: itemOfHeroByIndex,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: heroContract.abi,
        address: appConfig.addresses['0xHero'] as `0x${string}`,
        functionName: 'itemOfHeroByIndex',
        args: [tokenId, index],
        query: {
            select: (data) => jsonToHeroItemMetadata(data),
        },
    })

    return {
        itemOfHeroByIndex,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useUnequipItem() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function unequipItem(
        tokenId: bigint | undefined,
        itemContract: `0x${string}` | undefined,
        itemId: bigint | number | string | undefined
    ) {
        if (
            tokenId === undefined ||
            itemContract === undefined ||
            itemId === undefined
        )
            return

        writeContract({
            address: appConfig.addresses['0xHero'] as `0x${string}`,
            abi: heroContract.abi,
            functionName: 'unequipItem',
            args: [tokenId, itemContract, itemId],
        })
    }

    return {
        hash,
        error,
        isPending,
        unequipItem,
    }
}

/*
 * Gold
 */

export function useGoldBalanceOf(owner: `0x${string}` | string | undefined) {
    const {
        data: balance,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: goldContract.abi,
        address: appConfig.addresses['0xGold'] as `0x${string}`,
        functionName: 'balanceOf',
        args: [owner],
        query: {
            select: (data) => data as bigint,
            enabled: isAddress(owner!),
        },
    })

    return {
        balance,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useDelegate() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function delegate(delegatee: `0x${string}` | string | undefined) {
        if (delegatee === undefined) return

        writeContract({
            address: appConfig.addresses['0xGold'] as `0x${string}`,
            abi: goldContract.abi,
            functionName: 'delegate',
            args: [delegatee],
        })
    }

    return {
        hash,
        error,
        isPending,
        delegate,
    }
}

/*
 * Gold Mine
 */

export function useLeaveGoldMine(tokenId: bigint | undefined) {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function leave() {
        if (tokenId === undefined) return

        writeContract({
            address: appConfig.addresses['0xGoldMine'] as `0x${string}`,
            abi: goldMineContract.abi,
            functionName: 'leave',
            args: [tokenId],
        })
    }

    return {
        hash,
        error,
        isPending,
        leave,
    }
}

export function useOwnerOfHeroInGoldMine(tokenId: bigint | string | undefined) {
    const {
        data: owner,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: goldMineContract.abi,
        address: appConfig.addresses['0xGoldMine'] as `0x${string}`,
        functionName: 'ownerOf',
        args: [tokenId],
        query: {
            select: (data) => data as `0x${string}`,
            enabled: tokenId !== undefined,
        },
    })

    return {
        owner,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useStakedGold(
    tokenId: bigint | string | undefined,
    watch?: boolean
) {
    const {
        data: stakedGold,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: goldMineContract.abi,
        address: appConfig.addresses['0xGoldMine'] as `0x${string}`,
        functionName: 'stakedGold',
        args: [tokenId],
        query: {
            select: (data) => data as bigint,
            enabled: tokenId !== undefined,
            refetchInterval: watch === true ? 2500 : false,
        },
    })

    return {
        stakedGold,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useBalanceOfInGoldMine(
    owner: `0x${string}` | string | undefined
) {
    const {
        data: balance,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: goldMineContract.abi,
        address: appConfig.addresses['0xGoldMine'] as `0x${string}`,
        functionName: 'balanceOf',
        args: [owner],
        query: {
            select: (data) => Number(data),
            enabled: isAddress(owner!),
        },
    })

    return {
        balance,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export async function getTokenOfOwnerByIndexInGoldMine(
    owner: `0x${string}` | string | undefined,
    index: bigint | number | string
) {
    const result = await readContract(config, {
        abi: goldMineContract.abi,
        address: appConfig.addresses['0xGoldMine'] as `0x${string}`,
        functionName: 'tokenOfOwnerByIndex',
        args: [owner, index],
    })

    return result
}

/*
 * DAO
 */

export function useProposalCount() {
    const {
        data: proposalCount,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalCount',
        args: [],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        proposalCount,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export async function getProposalDetailsAt(index: bigint | number | string) {
    const result = await readContract(config, {
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalDetailsAt',
        args: [index],
    })

    return result
}

export function useProposalDetailsWithDescription(
    proposalId: bigint | number | string
) {
    const {
        data: proposalDetails,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalDetailsWithDescription',
        args: [proposalId],
        query: {
            select: (data) => arrayToProposalDetails(data),
        },
    })

    return {
        proposalDetails,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalProposer(proposalId: bigint | number | string) {
    const {
        data: proposalProposer,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalProposer',
        args: [proposalId],
        query: {
            select: (data) => data as string,
        },
    })

    return {
        proposalProposer,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalEta(proposalId: bigint | number | string) {
    const {
        data: proposalEta,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalEta',
        args: [proposalId],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        proposalEta,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalSnapshot(proposalId: bigint | number | string) {
    const {
        data: proposalSnapshot,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalSnapshot',
        args: [proposalId],
        query: {
            select: (data) => data as bigint,
        },
    })

    return {
        proposalSnapshot,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalVotes(proposalId: bigint | number | string) {
    const {
        data: proposalVotes,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalVotes',
        args: [proposalId],
        query: {
            select: (data) => arrayToProposalVotes(data),
        },
    })

    return {
        proposalVotes,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalDeadline(proposalId: bigint | number | string) {
    const {
        data: proposalDeadline,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalDeadline',
        args: [proposalId],
        query: {
            select: (data) => data as bigint,
        },
    })

    return {
        proposalDeadline,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalNeedsQueuing(proposalId: bigint | number | string) {
    const {
        data: proposalNeedsQueuing,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalNeedsQueuing',
        args: [proposalId],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        proposalNeedsQueuing,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalState(proposalId: bigint | number | string) {
    const {
        data: proposalState,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'state',
        args: [proposalId],
        query: {
            select: (data) => Number(data),
        },
    })

    return {
        proposalState,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export function useProposalQuorum(
    snapshot: bigint | number | string | undefined
) {
    const {
        data: proposalQuorum,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'quorum',
        args: [snapshot],
        query: {
            select: (data) => data as bigint,
            enabled: snapshot !== undefined,
        },
    })

    return {
        proposalQuorum,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}

export async function getProposalDetailsWithDescription(
    proposalId: bigint | number | string
) {
    const result = await readContract(config, {
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'proposalDetailsWithDescription',
        args: [proposalId],
    })

    return arrayToProposalDetails(result)
}

export function usePropose() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function propose(
        targets: string[],
        values: string[] | bigint[],
        calldatas: string[],
        subject: string,
        description: string
    ) {
        writeContract({
            address: appConfig.addresses['0xGovernor'] as `0x${string}`,
            abi: governorContract.abi,
            functionName: 'propose',
            args: [targets, values, calldatas, subject, description],
        })
    }

    return {
        hash,
        error,
        isPending,
        propose,
    }
}

export function useQueue() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function queue(proposalId: bigint | number) {
        writeContract({
            address: appConfig.addresses['0xGovernor'] as `0x${string}`,
            abi: governorContract.abi,
            functionName: 'queue',
            args: [proposalId],
        })
    }

    return {
        hash,
        error,
        isPending,
        queue,
    }
}

export function useExecute() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function execute(proposalId: bigint | number) {
        writeContract({
            address: appConfig.addresses['0xGovernor'] as `0x${string}`,
            abi: governorContract.abi,
            functionName: 'execute',
            args: [proposalId],
        })
    }

    return {
        hash,
        error,
        isPending,
        execute,
    }
}

export function useCastVoteWithReason() {
    const { data: hash, error, isPending, writeContract } = useWriteContract()

    async function castVoteWithReason(
        proposalId: bigint | number | string,
        voteType: ProposalVoteType,
        reason?: string
    ) {
        writeContract({
            address: appConfig.addresses['0xGovernor'] as `0x${string}`,
            abi: governorContract.abi,
            functionName: 'castVoteWithReason',
            args: [proposalId, voteType, reason !== undefined ? reason : ''],
        })
    }

    return {
        hash,
        error,
        isPending,
        castVoteWithReason,
    }
}

export function useVotesCount(
    account: `0x${string}` | string | undefined,
    timestamp: bigint | boolean | undefined
) {
    const publicClient = usePublicClient()

    const [blockTimestamp, setBlockTimestamp] = useState<bigint | undefined>(
        undefined
    )

    useEffect(() => {
        async function fetchBlockTimestamp() {
            const block = await publicClient?.getBlock({
                blockTag: 'safe',
            })
            setBlockTimestamp(block?.timestamp)
        }

        if (
            publicClient === undefined ||
            publicClient === null ||
            timestamp === undefined
        )
            return

        if (typeof timestamp == 'boolean') {
            fetchBlockTimestamp()
        } else {
            setBlockTimestamp(timestamp)
        }
    }, [publicClient, account])

    const {
        data: votesCount,
        isSuccess,
        isError,
        isFetching,
        error,
    } = useReadContract({
        abi: governorContract.abi,
        address: appConfig.addresses['0xGovernor'] as `0x${string}`,
        functionName: 'getVotes',
        args: [account, blockTimestamp],
        query: {
            select: (data) => data as bigint,
            enabled: blockTimestamp !== undefined,
        },
    })

    return {
        votesCount,
        isSuccess,
        isError,
        isFetching,
        error,
    }
}
