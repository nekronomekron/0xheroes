const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

const Gold = require('./Gold.cjs')

module.exports = buildModule('GoldMine', (m) => {
    const { token } = m.useModule(Gold)
    const goldMine = m.contract('GoldMine', [])

    m.call(goldMine, 'setRewardToken', [token])

    const minterRole = m.staticCall(token, 'MINTER_ROLE', [])
    m.call(token, 'grantRole', [minterRole, goldMine])

    return { goldMine }
})
