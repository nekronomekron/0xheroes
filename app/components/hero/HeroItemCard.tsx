import {
    Accordion,
    AccordionItem,
    Button,
    Card,
    CardBody,
    Image,
    Link,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    Spinner,
    useDisclosure,
} from '@nextui-org/react'
import { Hero } from '../types/Hero'
import {
    useItemAttributes,
    useItemOfHero,
    useItemOfHeroByIndex,
    useUnequipItem,
} from '../wagmi/hooks'
import { useEffect, useState } from 'react'
import { HeroItem } from '../types/HeroItem'
import { AttributesGrid } from '../ui/AttributesGrid'
import { WaitForTransactionDialog } from '../dialogs/WaitForTransaction'
import { ErrorDialog } from '../dialogs/ErrorDialog'
import { MessageDialog } from '../dialogs/MessageDialog'

type HeroItemCardProps = {
    hero: Hero
    itemIndex: number
}

export const HeroItemCard = ({ hero, itemIndex }: HeroItemCardProps) => {
    const { itemOfHeroByIndex } = useItemOfHeroByIndex(hero.id, itemIndex)

    const { isOpen, onOpen, onOpenChange } = useDisclosure()
    const {
        isOpen: isOpenUnequipDialog,
        onOpen: onOpenUnequipDialog,
        onClose: onCloseUnequipDialog,
    } = useDisclosure()

    const { hash, error, isPending, unequipItem } = useUnequipItem()

    const { itemAttributes } = useItemAttributes(
        itemOfHeroByIndex?.itemId,
        itemOfHeroByIndex?.itemContract
    )

    const { itemOfHero, isFetching } = useItemOfHero(
        itemOfHeroByIndex?.itemId,
        itemOfHeroByIndex?.itemContract
    )

    const [itemMetadata, setItemMetadata] = useState<HeroItem | undefined>(
        undefined
    )

    console.log(itemMetadata)

    useEffect(() => {
        const fetchMetadata = async () => {
            setItemMetadata(await itemOfHero)
        }

        fetchMetadata()
    }, [itemOfHero])

    function reloadLocation() {
        window.location.reload()
    }

    return (
        <>
            <MessageDialog
                isOpen={isOpenUnequipDialog}
                header="Unequip Item"
                message="The unequiped item will be removed from your 0xHero. To equip the item again, go to the website of the item contract."
                onClose={() => {
                    onCloseUnequipDialog()
                    unequipItem(
                        hero.id,
                        itemOfHeroByIndex?.itemContract,
                        itemOfHeroByIndex?.itemId
                    )
                }}
                onAccept={onCloseUnequipDialog}
                okButtonLabel="Cancel"
                cancelButtonLabel="Unequip"
            />

            <ErrorDialog error={error} onClose={reloadLocation} />

            <WaitForTransactionDialog
                transactionHash={hash}
                onClose={reloadLocation}
            />

            <Modal
                isOpen={isOpen}
                placement="auto"
                size="xl"
                onOpenChange={onOpenChange}
                hideCloseButton={true}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalBody className="flex flex-1 flex-col p-4">
                                <div className="text-4xl">
                                    {itemMetadata?.name}
                                </div>
                                <div className="w-full flex justify-center">
                                    <Image src={itemMetadata?.image} />
                                </div>
                                <Accordion variant="bordered">
                                    <AccordionItem
                                        key="description"
                                        aria-label="Description"
                                        title="Description"
                                    >
                                        {itemMetadata?.description}
                                    </AccordionItem>
                                </Accordion>

                                <AttributesGrid
                                    strength={itemAttributes?.strength}
                                    constitution={itemAttributes?.constitution}
                                    dexterity={itemAttributes?.dexterity}
                                    intelligence={itemAttributes?.intelligence}
                                    wisdom={itemAttributes?.wisdom}
                                    charisma={itemAttributes?.charisma}
                                    cost={itemAttributes?.cost}
                                    damage={itemAttributes?.damage}
                                    weight={itemAttributes?.weight}
                                />
                            </ModalBody>
                            <ModalFooter>
                                {itemMetadata?.externalUrl && (
                                    <Link
                                        href={itemMetadata?.externalUrl}
                                        isExternal={true}
                                        showAnchorIcon={true}
                                        size="sm"
                                    >
                                        External
                                    </Link>
                                )}
                                <Button
                                    color="danger"
                                    variant="light"
                                    isDisabled={isPending}
                                    onPress={onOpenUnequipDialog}
                                >
                                    Unequip
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={onClose}
                                    isDisabled={isPending}
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <Card className="aspect-square" isPressable={true} onPress={onOpen}>
                {isFetching || itemMetadata === undefined ? (
                    <CardBody className="flex justify-center items-center text-default-500">
                        <Spinner size="lg" color="default" />
                    </CardBody>
                ) : (
                    <Image
                        className="object-cover aspect-square"
                        src={itemMetadata.image}
                    />
                )}
            </Card>
        </>
    )
}
