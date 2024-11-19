import { useState, useEffect } from 'react'

import { usePublicClient } from 'wagmi'

type BlockTimestampProps = {
    blockNumber: bigint
}

export const BlockTimestamp = (props: BlockTimestampProps) => {
    const [block, setBlock] = useState<any | null>(null)
    const publicClient = usePublicClient()

    useEffect(() => {
        async function getBlock() {
            const blockInfo = await publicClient!.getBlock({
                blockNumber: props.blockNumber,
            })

            setBlock(blockInfo)
        }

        if (
            props.blockNumber !== undefined &&
            props.blockNumber !== null &&
            publicClient !== undefined &&
            publicClient !== null
        )
            getBlock()
    }, [props.blockNumber, publicClient])

    return (
        <p className="text-sm tracking-tight text-default-500">
            {block !== null
                ? new Date(Number(block.timestamp * 1000n)).toLocaleString()
                : ''}
        </p>
    )
}
