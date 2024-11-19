const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')

const Gold = require('./OxGold.cjs')
const Hero = require('./OxHero.cjs')

const { daoSettings } = require('../../heroes.config.cjs')

module.exports = buildModule('OxGovernor', (m) => {
    const deployer = m.getAccount(0)
    const chainId = hre.network.config.chainId

    const { token: goldToken } = m.useModule(Gold)
    const { heroToken } = m.useModule(Hero)

    const timelockController = m.contract('OxTimelockController', [
        daoSettings[chainId].timelockControllerMinDelay,
        [],
        [],
        deployer,
    ])
    const governor = m.contract('OxGovernor', [
        goldToken,
        timelockController,
        daoSettings[chainId].governorInitialVotingDelay,
        daoSettings[chainId].governorInitialVotingPeriod,
        daoSettings[chainId].governorInitialProposalThreshold,
    ])

    const goldAdminRole = m.staticCall(goldToken, 'DEFAULT_ADMIN_ROLE', [])
    const heroAdminRole = m.staticCall(heroToken, 'DEFAULT_ADMIN_ROLE', [])

    const proposerRole = m.staticCall(timelockController, 'PROPOSER_ROLE', [])
    const cancellerRole = m.staticCall(timelockController, 'CANCELLER_ROLE', [])
    const executorRole = m.staticCall(timelockController, 'EXECUTOR_ROLE', [])

    m.call(goldToken, 'grantRole', [goldAdminRole, timelockController], {
        id: 'grantRole_gold_admin',
    })

    m.call(heroToken, 'grantRole', [heroAdminRole, timelockController], {
        id: 'grantRole_hero_admin',
    })

    m.call(timelockController, 'grantRole', [proposerRole, governor], {
        id: 'grantRole_governor_proposer',
    })
    m.call(timelockController, 'grantRole', [cancellerRole, governor], {
        id: 'grantRole_governor_canceller',
    })
    m.call(timelockController, 'grantRole', [executorRole, governor], {
        id: 'grantRole_governor_executor',
    })

    return { governor }
})
