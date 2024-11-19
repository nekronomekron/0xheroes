import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Link,
    Image,
} from '@nextui-org/react'

import { BaseError, UserRejectedRequestError } from 'viem'
import { Button3D } from '../buttons/Button3D'

import { CloseIcon } from '../icons'

type MessageDialogProps = {
    isOpen: boolean
    header: string
    message: string
    okButtonLabel?: string
    cancelButtonLabel?: string
    onAccept: () => void
    onClose: () => void
}

export const MessageDialog = ({
    isOpen,
    header,
    message,
    onAccept,
    onClose,
    okButtonLabel = 'OK',
    cancelButtonLabel = 'Cancel',
}: MessageDialogProps) => {
    return (
        <Modal
            isOpen={isOpen}
            isDismissable={false}
            hideCloseButton={true}
            backdrop="opaque"
        >
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1 text-2xl font-normal">
                    <div className="flex justify-center">{header}</div>
                </ModalHeader>
                <ModalBody className="py-4">{message}</ModalBody>
                <ModalFooter className="flex justify-center">
                    <Button3D color="success" onPress={onAccept}>
                        {okButtonLabel}
                    </Button3D>

                    <Link color="danger" href="#" onPress={onClose}>
                        {cancelButtonLabel}
                    </Link>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}
