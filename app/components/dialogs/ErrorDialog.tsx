import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from '@nextui-org/react'

import {
    BaseError,
    UserRejectedRequestError,
    ContractFunctionExecutionErrorType,
} from 'viem'
import { Button3D } from '../buttons/Button3D'

import { CloseIcon } from '../icons'

type ErrorDialogProps = {
    error: any
    onClose: () => void
}

export const ErrorDialog = ({ error, onClose }: ErrorDialogProps) => {
    return (
        <Modal
            isOpen={
                error !== undefined &&
                error !== null &&
                !(error instanceof UserRejectedRequestError) &&
                !(error?.cause instanceof UserRejectedRequestError) &&
                !(error?.cause.cause instanceof UserRejectedRequestError)
            }
            isDismissable={false}
            hideCloseButton={true}
            backdrop="opaque"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-normal">
                    <div className="flex justify-center">Error</div>
                </ModalHeader>
                <ModalBody className="py-4">
                    <div className="flex justify-center">
                        <CloseIcon className="w-12 text-danger" />
                    </div>

                    <div>
                        {error instanceof BaseError ? (
                            error.shortMessage
                        ) : (
                            <>
                                An error occurred while performing the action.
                                Please check your wallet and your funds and try
                                again.
                            </>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter className="flex justify-center">
                    <Button3D color="danger" onPress={onClose}>
                        Close
                    </Button3D>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
