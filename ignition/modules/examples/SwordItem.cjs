const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

const Hero = require('../OxHero.cjs')

module.exports = buildModule('OxSword', (m) => {
    const { heroToken } = m.useModule(Hero)

    const item = m.contract('SwordItem', [])

    const deployer = m.getAccount(0)
    const mintCall = m.call(item, 'mint', [deployer])

    m.call(heroToken, 'equipItem', [1n, item, 1n], {
        after: [mintCall],
    })

    return { item }
})
