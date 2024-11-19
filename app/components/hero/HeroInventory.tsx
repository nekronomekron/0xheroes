import { Card, CardBody } from '@nextui-org/react'
import { getAttributeValue, Hero } from '../types/Hero'
import { CloseIcon } from '../icons'
import { useBalanceOfItems } from '../wagmi/hooks'
import { HeroItemCard } from './HeroItemCard'

type HeroInventoryProps = {
    hero: Hero
}

export const HeroInventory = ({ hero }: HeroInventoryProps) => {
    const { balanceOfItems } = useBalanceOfItems(hero.id)
    const inventorySize = getAttributeValue(hero, 'Inventory')

    const emptySlots =
        balanceOfItems !== undefined && inventorySize !== undefined
            ? inventorySize - balanceOfItems
            : 0

    return (
        <>
            <p className="text-xl">
                Inventory ({balanceOfItems}/{inventorySize})
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                {[...Array(balanceOfItems)].map((x, i) => (
                    <HeroItemCard key={i} hero={hero} itemIndex={i} />
                ))}

                {[...Array(emptySlots)].map((x, i) => (
                    <Card className="aspect-square" key={`empty_${i}`}>
                        <CardBody className="flex justify-center items-center text-default-500">
                            <CloseIcon className="w-12" />
                            <p>Empty</p>
                        </CardBody>
                    </Card>
                ))}

                {}
            </div>
        </>
    )
}
