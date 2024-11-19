import { CoinIcon } from '../icons'

import { formatEther } from 'ethers/utils'

import { useGoldBalanceOf } from '../wagmi/hooks'
import { Chip } from '@nextui-org/react'

type UserGoldBalance = {
    owner: `0x${string}` | undefined
}

export const UserGoldBalance = ({ owner }: UserGoldBalance) => {
    const { balance, isError, isFetching } = useGoldBalanceOf(owner)

    if (isFetching) return null

    if (balance !== undefined)
        return (
            <Chip color="warning" variant="bordered">
                <div className="flex gap-2 content-around">
                    {formatEther(balance)} 0xG
                </div>
            </Chip>
        )
}
