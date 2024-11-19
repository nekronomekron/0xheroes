const daoSettings = {
    31337: {
        timelockControllerMinDelay: 60,
        governorInitialVotingDelay: 60,
        governorInitialVotingPeriod: 60,
        governorInitialProposalThreshold: 0,
    },
}

const wethContractAddresses = {
    80002: '0xc66Df93f040CEBa19b873Fc429e9F63200D1Fd6A',
    11155111: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9',
    137: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
}

const proxyRegistryAddresses = {
    31337: '0x0000000000000000000000000000000000000000',
    11155111: '0x0000000000000000000000000000000000000000',
    80002: '0x0000000000000000000000000000000000000000',
}

const auctionHouseSettings = {
    31337: {
        auctionDuration: 1 * 60,
        timeBuffer: 1 * 60,
    },
    80002: {
        auctionDuration: 1 * 60,
        timeBuffer: 1 * 60,
    },
    11155111: {
        auctionDuration: 1 * 60,
        timeBuffer: 1 * 60,
    },
    137: {
        auctionDuration: 12 * 60 * 60,
        timeBuffer: 15 * 60,
    },
}

module.exports = {
    daoSettings,
    auctionHouseSettings,
    wethContractAddresses,
    proxyRegistryAddresses,
}
