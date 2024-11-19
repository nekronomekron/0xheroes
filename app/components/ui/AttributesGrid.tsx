import { Card, CardBody } from '@nextui-org/react'

type AttributesGridProps = React.HTMLAttributes<HTMLDivElement> & {
    life?: number
    health?: number
    strength?: number
    constitution?: number
    dexterity?: number
    intelligence?: number
    wisdom?: number
    charisma?: number
    cost?: number
    damage?: number
    weight?: number
}

export const AttributesGrid = ({
    life = undefined,
    health = undefined,
    strength = undefined,
    constitution = undefined,
    dexterity = undefined,
    intelligence = undefined,
    wisdom = undefined,
    charisma = undefined,
    cost = undefined,
    damage = undefined,
    weight = undefined,
    ...rest
}: AttributesGridProps) => {
    function renderCard(
        background: string,
        name: string,
        value: number | undefined,
        showMaxValue: boolean = true
    ) {
        if (value === undefined || value === 0) return null

        return (
            <Card
                classNames={{
                    base: background,
                }}
            >
                <CardBody>
                    <div className="flex flex-1 justify-between text-default-100">
                        <p className="text-2xl">{name}</p>
                        <div className="flex items-end">
                            <p className="text-2xl">{value}</p>
                            {showMaxValue && (
                                <p className="text-small text-default-300">
                                    /255
                                </p>
                            )}
                        </div>
                    </div>
                </CardBody>
            </Card>
        )
    }

    return (
        <div className={`grid grid-cols-2 gap-4 ${rest.className}`}>
            {life !== undefined && health !== undefined && (
                <Card
                    classNames={{
                        base: 'bg-gradient-to-br from-green-500 to-green-800 col-span-2',
                    }}
                >
                    <CardBody>
                        <div className="flex flex-1 justify-between text-default-100">
                            <p className="text-2xl">Health</p>
                            <div className="flex items-end">
                                <p className="text-2xl">{health}</p>
                                <p className="text-small text-default-300">
                                    /{life}
                                </p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            )}

            {renderCard(
                'bg-gradient-to-br from-red-400 to-red-900',
                'STR',
                strength
            )}
            {renderCard(
                'bg-gradient-to-br from-blue-400 to-sky-700',
                'CON',
                constitution
            )}
            {renderCard(
                'bg-gradient-to-br from-slate-300 to-cyan-700',
                'DEX',
                dexterity
            )}
            {renderCard(
                'bg-gradient-to-br from-teal-300 to-cyan-600',
                'INT',
                intelligence
            )}
            {renderCard(
                'bg-gradient-to-br from-violet-300 to-violet-600',
                'WIS',
                wisdom
            )}
            {renderCard(
                'bg-gradient-to-br from-amber-300 to-amber-600',
                'CHA',
                charisma
            )}

            {renderCard(
                'bg-gradient-to-br from-orange-300 to-yellow-400',
                'Cost',
                cost,
                false
            )}
            {renderCard(
                'bg-gradient-to-br from-fuchsia-300 to-fuchsia-700',
                'Damage',
                damage,
                false
            )}
            {renderCard(
                'bg-gradient-to-br from-zinc-400 to-zinc-700',
                'Weight',
                weight,
                false
            )}
        </div>
    )
}
