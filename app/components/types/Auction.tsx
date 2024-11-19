export type Auction = {
    id: bigint
    amount: bigint
    bidder: string
    duration: number
    firstBidTime: number
    reservePrice: bigint
    tokenId: bigint
    tokenOwner: string
}

export function jsonToAuction(json: any): Auction | undefined {
    if (json === undefined || json === null) return undefined

    const auction: Auction = {
        id: BigInt(json.auctionId),
        amount: BigInt(json.amount),
        bidder: json.bidder,
        duration: parseInt(json.duration),
        firstBidTime: parseInt(json.firstBidTime),
        reservePrice: BigInt(json.reservePrice),
        tokenId: BigInt(json.tokenId),
        tokenOwner: json.tokenOwner,
    }

    return auction
}
