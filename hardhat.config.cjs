require('@nomicfoundation/hardhat-toolbox')
require('@nomicfoundation/hardhat-ignition-ethers')
require('@nomicfoundation/hardhat-ledger')

const secretData = require('./.secret.json')

const { daoSettings } = require('./heroes.config.cjs')

const chainExplorerUrls = {
    31337: 'https://localhost',
    80002: 'https://amoy.polygonscan.com',
    11155111: 'https://sepolia.etherscan.io/',
    137: 'https://www.polygonscan.com',
}

const contracts = {
    'OxHero#AuctionHouse.json': 'AuctionHouse.json',
    'OxHero#OxHero.json': 'Hero.json',
    'OxGold#OxGold.json': 'Gold.json',
    'GoldMine#GoldMine.json': 'GoldMine.json',
    'OxGovernor#OxGovernor.json': 'OxGovernor.json',
}

task('create-config', 'Create application configuration').setAction(
    async (taskArguments, hre) => {
        const chainId = hre.network.config.chainId
        const latestBlock = await hre.ethers.provider.getBlock('latest')

        const deployedAddresses = require(
            `./ignition/deployments/chain-${chainId}/deployed_addresses.json`
        )

        const config = {
            blockNumber: latestBlock.number,
            explorerUri: chainExplorerUrls[chainId],

            daoSettings: daoSettings[chainId],

            addresses: {
                '0xAuctionHouse': deployedAddresses['OxHero#AuctionHouse'],
                '0xHero': deployedAddresses['OxHero#OxHero'],
                '0xGold': deployedAddresses['OxGold#OxGold'],
                '0xGoldMine': deployedAddresses['GoldMine#GoldMine'],
                '0xGovernor': deployedAddresses['OxGovernor#OxGovernor'],
            },
        }

        const jsonData = JSON.stringify(config)

        var fs = require('fs')
        fs.writeFileSync(
            './app/app.config.json',
            jsonData,
            {
                encoding: 'utf8',
                flag: 'w',
            },
            function (err) {
                if (err) {
                    console.log(err)
                }
            }
        )

        fs.rmSync('./app/contracts', { force: true, recursive: true })

        for (let source in contracts) {
            fs.cpSync(
                `./ignition/deployments/chain-${chainId}/artifacts/${source}`,
                `./app/contracts/${contracts[source]}`,
                {},
                (err) => {
                    if (err) {
                        console.error(err)
                    }
                }
            )
        }

        fs.cpSync(
            './contracts/abis/IItem.json',
            './app/contracts/IItem.json',
            {},
            (err) => {
                if (err) {
                    console.error(err)
                }
            }
        )
    }
)

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {
            loggingEnabled: true,
            mining: {
                auto: false,
                interval: 1000,
            },
        },
        localhost: {
            chainId: 31337,
        },

        sepolia: {
            chainId: 11155111,
            url: `https://sepolia.infura.io/v3/${secretData.infura}`,
            ledgerAccounts: ['0xe79D7b2C7a4d789F38C97482370c6D3C9192EA95'],
            gasPrice: 2000000000,
        },

        polygon: {
            chainId: 137,
            url: `https://polygon.infura.io/v3/${secretData.infura}`,
            ledgerAccounts: ['0xe79D7b2C7a4d789F38C97482370c6D3C9192EA95'],
        },
        ethereum: {
            chainId: 1,
            url: `https://mainnet.infura.io/v3/${secretData.infura}`,
            ledgerAccounts: ['0xe79D7b2C7a4d789F38C97482370c6D3C9192EA95'],
        },
    },
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 5000,
            },
            viaIR: process.env.PRODUCTION_BUILD !== '0' ? true : false,
        },
    },
    gasReporter: {
        currency: 'EUR',
    },
}
