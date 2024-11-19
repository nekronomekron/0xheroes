import { useAccount } from 'wagmi'

import {
    useOwnerOfHero,
    useLeaveGoldMine,
    useOwnerOfHeroInGoldMine,
} from '../wagmi/hooks'

import appConfig from '~/app.config.json'

import { Button3D } from '../buttons/Button3D'
import { Hero } from '../types/Hero'

import { WaitForTransactionDialog } from '../dialogs/WaitForTransaction'
import { ErrorDialog } from '../dialogs/ErrorDialog'
import { MessageDialog } from '../dialogs/MessageDialog'

import { UndoIcon } from '../icons'
import { useState } from 'react'

type GoldMineActionProps = {
    hero: Hero
}

export const GoldMineAction = ({ hero }: GoldMineActionProps) => {
    const { address } = useAccount()

    const { owner } = useOwnerOfHero(hero.id)
    const { owner: originalOwner } = useOwnerOfHeroInGoldMine(hero.id)

    const [showLeaveGoldMineMessage, setShowLeaveGoldMineMessage] =
        useState<boolean>(false)

    const {
        leave,
        error: escapeDungeonError,
        hash: escapeDungeonHash,
        isPending: escapeDungeonIsPending,
    } = useLeaveGoldMine(hero.id)

    function reloadLocation() {
        window.location.reload()
    }

    if (
        address === null ||
        address === undefined ||
        owner === undefined ||
        owner !== appConfig.addresses['0xGoldMine'] ||
        address !== originalOwner
    )
        return null

    return (
        <>
            <ErrorDialog error={escapeDungeonError} onClose={reloadLocation} />

            <MessageDialog
                isOpen={showLeaveGoldMineMessage}
                header="Leave Gold Mine"
                message="Heroes left from the Gold Mine are back under your control. All 0xGold tokens the hero staked are transfered to your wallet."
                onAccept={() => {
                    setShowLeaveGoldMineMessage(false)
                    leave()
                }}
                onClose={() => setShowLeaveGoldMineMessage(false)}
            />

            <WaitForTransactionDialog
                transactionHash={escapeDungeonHash}
                onClose={reloadLocation}
            />

            <div className="grid grid-cols-1 gap-2">
                <Button3D
                    color="danger"
                    size="lg"
                    onClick={() => setShowLeaveGoldMineMessage(true)}
                    isLoading={escapeDungeonIsPending}
                >
                    {escapeDungeonIsPending ? (
                        'Create Tx'
                    ) : (
                        <>
                            <UndoIcon className="w-12" /> Leave Gold Mine
                        </>
                    )}
                </Button3D>
            </div>
        </>
    )
}
