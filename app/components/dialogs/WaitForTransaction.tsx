import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react'

import { Spinner } from '@nextui-org/spinner'
import { Link } from '@nextui-org/react'

import { CloseIcon, CheckIcon } from '../icons'

import { useWaitForTransactionReceipt } from 'wagmi'

import { Button3D } from '../buttons/Button3D'

import appConfiguration from '~/app.config.json'

type WaitForTransactionDialogProps = {
    transactionHash: `0x${string}` | undefined
    onClose: () => void
}

export const WaitForTransactionDialog = (
    props: WaitForTransactionDialogProps
) => {
    const { isError, isLoading, isSuccess } = useWaitForTransactionReceipt({
        hash: props.transactionHash,
    })

    return (
        <Modal
            isOpen={props.transactionHash !== undefined}
            isDismissable={false}
            hideCloseButton={true}
            backdrop="opaque"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-normal">
                    <div className="flex justify-center">
                        Waiting for Confirmation
                    </div>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="flex justify-center">
                        {isLoading && <Spinner color="success" size="lg" />}
                        {isSuccess && (
                            <CheckIcon className="w-12 text-success" />
                        )}
                        {isError && <CloseIcon className="w-12 text-danger" />}
                    </div>

                    <div className="flex justify-center">
                        <p className="pr-2">Transaction:</p>
                        <Link
                            href={`${appConfiguration.explorerUri}/tx/${props.transactionHash}`}
                            isExternal
                            showAnchorIcon
                        >
                            {`${props.transactionHash?.slice(
                                0,
                                4
                            )}...${props.transactionHash?.slice(-4)}`}
                        </Link>
                    </div>

                    {(isError || isSuccess) && (
                        <div
                            className={`flex text-center text-primary-foreground ${
                                isError ? 'bg-danger' : 'bg-success'
                            } rounded-large px-4 py-2`}
                        >
                            {isError
                                ? 'An error occurred while confirming the transaction. Please check your wallet and try again.'
                                : 'Transaction successfully confirmed.'}
                        </div>
                    )}
                </ModalBody>
                {(isSuccess || isError) && (
                    <ModalFooter className="flex justify-center">
                        <Button3D color="success" onPress={props.onClose}>
                            Close
                        </Button3D>
                    </ModalFooter>
                )}
            </ModalContent>
        </Modal>
    )
}
