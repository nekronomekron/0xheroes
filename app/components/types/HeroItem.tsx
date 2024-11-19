export type HeroItemMetadata = {
    itemId: number
    itemContract: `0x${string}`
}

export type HeroItemAttributes = {
    strength: number
    constitution: number
    dexterity: number
    intelligence: number
    wisdom: number
    charisma: number
    cost: number
    damage: number
    weight: number
}

export type HeroItem = {
    id: bigint
    name: string
    description: string
    image: string
    externalUrl: string
    attributes: any[]
}

export function jsonToHeroItemMetadata(
    json: any
): HeroItemMetadata | undefined {
    if (json === undefined || json === null) return undefined

    const heroItemMetadata: HeroItemMetadata = {
        itemId: json.itemId,
        itemContract: json.itemContract as `0x${string}`,
    }

    return heroItemMetadata
}

export function jsonToHeroItemAttributes(
    json: any
): HeroItemAttributes | undefined {
    if (json === undefined || json === null) return undefined

    const heroItemAttributes: HeroItemAttributes = {
        strength: Number(json.strength),
        constitution: Number(json.constitution),
        dexterity: Number(json.dexterity),
        intelligence: Number(json.intelligence),
        wisdom: Number(json.wisdom),
        charisma: Number(json.charisma),
        cost: Number(json.cost),
        damage: Number(json.damage),
        weight: Number(json.weight),
    }

    return heroItemAttributes
}

export function tokenUriToHeroItem(
    data: string
): Promise<HeroItem | undefined> {
    return new Promise<HeroItem | undefined>(async (resolve, reject) => {
        var json

        if (data.startsWith('data:application/json;base64,')) {
            json = JSON.parse(atob(data.replace(/^data:\w+\/\w+;base64,/, '')))
        } else {
            const response = await fetch(data)
            if (!response.ok) reject()

            json = await response.json()
        }

        if (json === undefined) {
            resolve(undefined)
        } else {
            const heroItem: HeroItem = {
                id: json.id,
                name: json.name,
                description: json.description,
                image: json.image,
                externalUrl: json.external_url,
                attributes: json.attributes,
            }

            resolve(heroItem)
        }

        reject()
    })
}
