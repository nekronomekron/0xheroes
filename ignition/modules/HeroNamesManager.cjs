const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

module.exports = buildModule('HeroNamesManager', (m) => {
    const heroNamesManager = m.contract('HeroNamesManager', [])

    m.call(heroNamesManager, 'setMalePrefixes', [['Mr.', 'Sir']])
    m.call(heroNamesManager, 'setMaleForenames', [['Hans', 'Peter', 'Paul']])

    m.call(heroNamesManager, 'setFemalePrefixes', [['Mrs.', 'Lady']])
    m.call(heroNamesManager, 'setFemaleForenames', [
        ['Bella', 'Sandra', 'Sophie'],
    ])

    m.call(heroNamesManager, 'setSurnames', [['Woods', 'Schmidt', 'Reif']])

    return { heroNamesManager }
})
