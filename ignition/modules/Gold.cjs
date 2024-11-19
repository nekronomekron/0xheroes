const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

module.exports = buildModule('OxGold', (m) => {
    const token = m.contract('OxGold', [])

    const minterRole = m.staticCall(token, 'MINTER_ROLE', [])
    m.call(token, 'grantRole', [
        minterRole,
        '0x43cDCBEC2Be900B4765036403E59f6cE848efF36',
    ])

    return { token }
})
