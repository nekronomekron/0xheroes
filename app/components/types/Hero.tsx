export type Hero = {
    id: bigint
    name: string
    description: string
    imageData: string
    isInAuction: boolean
    owningHeroHandler: string
    attributes: any[]
}

export function jsonToHero(json: any): Hero | undefined {
    if (json === undefined || json === null) return undefined

    const hero: Hero = {
        id: BigInt(json.id),
        name: json.name,
        description: json.description,
        imageData: json.image,
        attributes: json.attributes,
        isInAuction: json.isInAuction === 'true',
        owningHeroHandler: json.owningHeroHandler,
    }

    return hero
}

export function getAttributeValue(
    hero: Hero | undefined,
    attributeName: string
) {
    if (hero === undefined) return null

    for (var trait of hero.attributes) {
        if (trait.trait_type === attributeName) return trait.value
    }
    return null
}

export function getAttributeMaxValue(
    hero: Hero | undefined,
    attributeName: string
) {
    if (hero === undefined) return null

    for (var trait of hero.attributes) {
        if (trait.trait_type === attributeName) return trait.max_value
    }
    return null
}
