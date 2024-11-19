const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

module.exports = buildModule('WethModule', (m) => {
    const wethToken = m.contract('WETH10', [])
    return { wethToken }
})
