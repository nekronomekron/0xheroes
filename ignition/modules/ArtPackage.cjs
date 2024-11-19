const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')
const { deflateRawSync } = require('zlib')

const HeroImageData = require('../../assets/image-data-hero-art.json')

function dataToDescriptorInput(data) {
    const abiEncoded = ethers.AbiCoder.defaultAbiCoder().encode(
        ['bytes[]'],
        [data]
    )
    const encodedCompressed = `0x${deflateRawSync(
        Buffer.from(abiEncoded.substring(2), 'hex')
    ).toString('hex')}`

    const originalLength = abiEncoded.substring(2).length / 2
    const itemCount = data.length

    return {
        encodedCompressed,
        originalLength,
        itemCount,
    }
}

function addPage(m, data, contract, setter, after) {
    const page = dataToDescriptorInput(data.map((item) => item.data))
    return m.call(
        contract,
        setter,
        [page.encodedCompressed, page.originalLength, page.itemCount],
        {
            after: after,
        }
    )
}

module.exports = buildModule('OxHeroArtPackage', (m) => {
    const artManager = m.contract('HeroArtManager', [])

    console.log('Provision HeroArtPackage')

    const { colors, images } = HeroImageData
    const { body, skin, feet, hair, floors } = images

    const setPaletteCall = m.call(artManager, 'setPalette', [
        0,
        `0x00000000${colors.join('')}`,
    ])

    addPage(m, body, artManager, 'addBodies', [setPaletteCall])
    addPage(m, skin, artManager, 'addSkins', [setPaletteCall])
    addPage(m, feet, artManager, 'addFeet', [setPaletteCall])
    addPage(m, hair, artManager, 'addHair', [setPaletteCall])
    addPage(m, floors, artManager, 'addFloors', [setPaletteCall])

    return { artManager }
})
