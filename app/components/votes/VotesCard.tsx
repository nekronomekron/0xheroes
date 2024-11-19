import { useDelegate, useVotesCount } from '../wagmi/hooks'
import { useAccount } from 'wagmi'
import { formatEther } from 'ethers/utils'
import { InfoCard } from '../ui/InfoCard'
import { Button3D } from '../buttons/Button3D'
import { WaitForTransactionDialog } from '../dialogs/WaitForTransaction'
import { ErrorDialog } from '../dialogs/ErrorDialog'

import appConfig from '~/app.config.json'

export const VotesCard = () => {
    const account = useAccount()

    const { votesCount, isFetching, isError } = useVotesCount(
        account.address,
        false
    )

    const { delegate, hash, isPending, error: delegateError } = useDelegate()

    function reloadLocation() {
        window.location.reload()
    }

    if (!account.isConnected) return null

    return (
        <InfoCard title="Your Votes" isError={isError} isFetching={isFetching}>
            <ErrorDialog error={delegateError} onClose={reloadLocation} />

            <WaitForTransactionDialog
                transactionHash={hash}
                onClose={reloadLocation}
            />

            <div className="flex flex-col w-full gap-4">
                {!isFetching &&
                votesCount !== null &&
                votesCount !== undefined ? (
                    <div className="text-4xl text-warning">
                        {formatEther(votesCount)} OxG
                    </div>
                ) : (
                    <p>No data</p>
                )}
                <Button3D
                    size="lg"
                    onClick={() => delegate(account.address)}
                    isLoading={isPending}
                    color="warning"
                >
                    {isPending ? 'Create Tx' : 'Delegate'}
                </Button3D>
                <div>
                    0xGold govern 0xHeroes DAO. You can vote on proposals or
                    delegate your vote to a third party. A minimum of{' '}
                    <b>
                        {
                            appConfig['daoSettings'][
                                'governorInitialProposalThreshold'
                            ]
                        }{' '}
                        0xG
                    </b>{' '}
                    is required to submit proposals.
                </div>
            </div>
        </InfoCard>
    )
}
