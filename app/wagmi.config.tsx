import { http } from '@wagmi/core'
import { polygon, polygonAmoy, sepolia } from 'wagmi/chains'
import { type Chain } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

import secretData from '~/../.secret.json'

export const localhost = {
    id: 31337,
    name: 'Localhost',
    nativeCurrency: {
        decimals: 18,
        name: 'POL',
        symbol: 'POL',
    },
    rpcUrls: {
        default: { http: ['http://127.0.0.1:8545'] },
        public: { http: ['http://127.0.0.1:8545'] },
    },
} as const satisfies Chain

export const config = getDefaultConfig({
    appName: '0xHeroes',
    projectId: '0f1b86b0663e359b4510e10705d9b7d3',
    chains: [sepolia, localhost, polygon, polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR),

    transports: {
        [localhost.id]: http('http://127.0.0.1:8545'),
        [polygonAmoy.id]: http(
            `https://polygon-amoy.infura.io/v3/${secretData.infura}`
        ),
        [sepolia.id]: http(`https://sepolia.infura.io/v3/${secretData.infura}`),
        [polygon.id]: http(
            `https://polygon-mainnet.infura.io/v3/${secretData.infura}`
        ),
    },
})
