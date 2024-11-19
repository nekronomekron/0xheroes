import { Hero, getAttributeValue, getAttributeMaxValue } from '../types/Hero'
import { AttributesGrid } from '../ui/AttributesGrid'

type HeroStatsProps = React.HTMLAttributes<HTMLDivElement> & {
    hero: Hero | undefined
    showId?: boolean
    removeWrapper?: boolean
}

export const HeroStats = ({
    hero,
    showId = false,
    removeWrapper = false,
    ...rest
}: HeroStatsProps) => {
    return (
        <AttributesGrid
            {...rest}
            life={getAttributeValue(hero, 'Life')}
            health={getAttributeValue(hero, 'Health')}
            strength={getAttributeValue(hero, 'Strength')}
            constitution={getAttributeValue(hero, 'Constitution')}
            dexterity={getAttributeValue(hero, 'Dexterity')}
            intelligence={getAttributeValue(hero, 'Intelligence')}
            wisdom={getAttributeValue(hero, 'Wisdom')}
            charisma={getAttributeValue(hero, 'Charisma')}
        />
    )
}
