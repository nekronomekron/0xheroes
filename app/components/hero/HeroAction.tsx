import { useAccount } from 'wagmi'
import { useNavigate } from '@remix-run/react'

import {
    useOwnerOfHero,
    useBurnHero,
    useSendHeroToGoldMine,
} from '../wagmi/hooks'

import { Button3D } from '../buttons/Button3D'
import { Hero } from '../types/Hero'

import { WaitForTransactionDialog } from '../dialogs/WaitForTransaction'
import { ErrorDialog } from '../dialogs/ErrorDialog'
import { MessageDialog } from '../dialogs/MessageDialog'

import { TrashIcon, HumanRunIcon } from '../icons'
import { useState } from 'react'

type HeroActionProps = {
    hero: Hero
}

export const HeroAction = ({ hero }: HeroActionProps) => {
    const navigate = useNavigate()

    const { address } = useAccount()
    const { owner } = useOwnerOfHero(hero.id)

    const {
        hash: sendHeroToGoldMineHash,
        error: sendHeroToGoldMineError,
        isPending: sendHeroToGoldMineIsPending,
        sendHeroToGoldMine,
    } = useSendHeroToGoldMine(hero.id, owner)

    const [showSendToGoldMineMessage, setShowSendToGoldMineMessage] =
        useState<boolean>(false)

    const [showBurnHeroMessage, setShowBurnHeroMessage] =
        useState<boolean>(false)

    const {
        hash: burnHeroHash,
        error: burnHeroError,
        isPending: burnHeroIsPending,
        burn,
    } = useBurnHero(hero.id)

    function reloadLocation() {
        window.location.reload()
    }

    function gotoMyHeroes() {
        navigate(`/users/${address}`)
    }

    if (
        address === null ||
        address === undefined ||
        owner === undefined ||
        owner !== address
    )
        return null

    return (
        <>
            <ErrorDialog
                error={
                    burnHeroError !== null
                        ? burnHeroError
                        : sendHeroToGoldMineError
                }
                onClose={reloadLocation}
            />

            <MessageDialog
                isOpen={showBurnHeroMessage}
                header="Burn Hero"
                message="Burning your hero will permanently destroy it. This cannot be undone and will be permanent."
                onAccept={() => setShowBurnHeroMessage(false)}
                onClose={() => {
                    setShowBurnHeroMessage(false)
                    burn()
                }}
                okButtonLabel="Cancel"
                cancelButtonLabel="Burn"
            />

            <MessageDialog
                isOpen={showSendToGoldMineMessage}
                header="Send to Gold Mine"
                message="All heroes sent to the Gold Mine will stake 0xGold but are locked. In order to make them spendable again, you need to take the hero back and leave the Gold Mine."
                onAccept={() => {
                    setShowSendToGoldMineMessage(false)
                    sendHeroToGoldMine()
                }}
                onClose={() => setShowSendToGoldMineMessage(false)}
            />

            <WaitForTransactionDialog
                transactionHash={
                    burnHeroHash !== undefined
                        ? burnHeroHash
                        : sendHeroToGoldMineHash
                }
                onClose={
                    burnHeroHash !== undefined ? gotoMyHeroes : reloadLocation
                }
            />

            <div className="grid grid-cols-1 gap-2">
                <Button3D
                    color="warning"
                    size="lg"
                    onClick={() => setShowSendToGoldMineMessage(true)}
                    isLoading={sendHeroToGoldMineIsPending}
                >
                    {sendHeroToGoldMineIsPending ? (
                        'Create Tx'
                    ) : (
                        <>
                            <HumanRunIcon className="w-12" /> Send to Gold Mine
                        </>
                    )}
                </Button3D>

                <Button3D
                    color="danger"
                    size="lg"
                    onClick={() => setShowBurnHeroMessage(true)}
                    isLoading={burnHeroIsPending}
                >
                    {burnHeroIsPending ? (
                        'Create Tx'
                    ) : (
                        <>
                            <TrashIcon className="w-12" /> Burn Hero
                        </>
                    )}
                </Button3D>
            </div>
        </>
    )
}
