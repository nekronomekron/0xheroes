const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules')
const ArtPackageModule = require('./ArtPackage.cjs')
const WethModule = require('./WETH10.cjs')
const HeroNamesManager = require('./HeroNamesManager.cjs')
const GoldMine = require('./GoldMine.cjs')

const {
    wethContractAddresses,
    proxyRegistryAddresses,
    auctionHouseSettings,
} = require('../../heroes.config.cjs')

module.exports = buildModule('OxHero', (m) => {
    const chainId = hre.network.config.chainId

    let wethAddress = hre.ethers.ZeroAddress
    if (chainId === 31337) {
        const { wethToken } = m.useModule(WethModule)
        wethAddress = wethToken
    } else {
        wethAddress = wethContractAddresses[chainId]
    }

    const { artManager } = m.useModule(ArtPackageModule)
    const { heroNamesManager } = m.useModule(HeroNamesManager)
    const { goldMine } = m.useModule(GoldMine)

    const svgRenderer = m.contract('SVGRenderer', [])
    const auctionHouse = m.contract('AuctionHouse', [wethAddress])
    const heroToken = m.contract('OxHero', [proxyRegistryAddresses[chainId]])

    const setTokenContractCall = m.call(auctionHouse, 'setTokenContract', [
        heroToken,
    ])

    const setAuctionDurationCall = m.call(auctionHouse, 'setAuctionDuration', [
        BigInt(auctionHouseSettings[chainId].auctionDuration),
    ])
    const setTimeBufferCall = m.call(auctionHouse, 'setTimeBuffer', [
        BigInt(auctionHouseSettings[chainId].timeBuffer),
    ])

    const heroMinterRole = m.staticCall(heroToken, 'MINTER_ROLE', [])
    const heroStatsUpdaterRole = m.staticCall(
        heroToken,
        'HERO_STATS_UPDATER_ROLE',
        []
    )

    const grantRoleMinter = m.call(
        heroToken,
        'grantRole',
        [heroMinterRole, auctionHouse],
        {
            id: 'grantRole_hero_minter',
        }
    )
    const grantRoleHeroStatsUpdater = m.call(
        heroToken,
        'grantRole',
        [heroStatsUpdaterRole, goldMine],
        {
            id: 'grantRole_hero_stats_updater',
        }
    )

    const setSVGRendererCall = m.call(heroToken, 'setSVGRenderer', [
        svgRenderer,
    ])
    const setHeroArtManagerCall = m.call(heroToken, 'setHeroArtManager', [
        artManager,
    ])
    const setHeroNamesManagerCall = m.call(heroToken, 'setHeroNamesManager', [
        heroNamesManager,
    ])

    const setAuctionHouseCall = m.call(heroToken, 'setAuctionHouse', [
        auctionHouse,
    ])
    const addHeroHandlerCall = m.call(heroToken, 'addHeroHandler', [goldMine])

    const goldMineSetHeroContractCall = m.call(goldMine, 'setHeroContract', [
        heroToken,
    ])

    m.call(auctionHouse, 'initialize', [], {
        after: [
            setTokenContractCall,
            setAuctionDurationCall,
            setTimeBufferCall,
            setSVGRendererCall,
            setHeroArtManagerCall,
            setHeroNamesManagerCall,
            grantRoleMinter,
            grantRoleHeroStatsUpdater,
            setAuctionHouseCall,
            addHeroHandlerCall,
            goldMineSetHeroContractCall,
        ],
    })

    return { heroToken, auctionHouse, svgRenderer }
})
