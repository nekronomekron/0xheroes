// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/math/Math.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol';
import '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/IERC721Mintable.sol';

interface IWETH {
    function deposit() external payable;
    function withdraw(uint wad) external;

    function transfer(address to, uint256 value) external returns (bool);
}

/**
 * @title An open auction house, enabling collectors and curators to run their own auctions
 */
contract AuctionHouse is
    ERC721Holder,
    ReentrancyGuard,
    Pausable,
    AccessControl
{
    struct Auction {
        // ID for the ERC721 token
        uint256 tokenId;
        // The current highest bid amount
        uint256 amount;
        // The length of time to run the auction for, after the first bid was made
        uint256 duration;
        // The minimum price of the first bid
        uint256 reservePrice;
        // The time of the first bid
        uint256 firstBidTime;
        // The address that should receive the funds once the NFT is sold.
        address tokenOwner;
        // The address of the current highest bid
        address payable bidder;
    }

    event AuctionCreated(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        uint256 duration,
        uint256 reservePrice,
        address tokenOwner
    );

    event AuctionBid(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        address sender,
        uint256 value,
        bool firstBid,
        bool extended
    );

    event AuctionDurationExtended(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        uint256 duration
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        address tokenOwner,
        address winner,
        uint256 amount
    );

    event TokenContractUpdated(IERC721Mintable tokenContract);
    event AuctionDurationUpdated(uint256 auctionDuration);
    event TimeBufferUpdated(uint256 timeBuffer);

    using Math for uint256;
    using SafeERC20 for IERC20;

    uint256 private _nextAuctionId;

    // The minimum amount of time left in an auction after a new bid is created
    uint256 public timeBuffer;

    // The minimum percentage difference between the last bid amount and the current bid.
    uint8 public minBidIncrementPercentage;

    uint8 public maxAuctions;

    // / The address of the WETH contract, so that any ETH transferred can be handled as an ERC-20
    address public wethAddress;

    // A mapping of all of the auctions currently running.
    mapping(uint256 => Auction) private auctions;
    uint256[] private activeAuctions;

    bytes4 constant interfaceId = 0x80ac58cd; // 721 interface id

    IERC721Mintable private _tokenContract;

    uint256 auctionDuration;
    uint256 reservePrice;

    bool private _initializationDone = false;

    /**
     * @notice Require that the specified auction exists
     */
    modifier auctionExists(uint256 auctionId) {
        require(_exists(auctionId), "Auction doesn't exist");
        _;
    }

    /*
     * Constructor
     */
    constructor(address _weth) {
        wethAddress = _weth;
        timeBuffer = 15 * 60; // extend 15 minutes after every bid made in last 15 minutes
        auctionDuration = 7 * 24 * 3600; // 7 days
        minBidIncrementPercentage = 5; // 5%
        maxAuctions = 3;
        reservePrice = 0.01 ether;
        activeAuctions = new uint256[](0);

        _nextAuctionId = 1;

        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function initialize() external nonReentrant onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            !_initializationDone,
            '0xAuctionHouse: auction house has been initialized already'
        );
        _initializationDone = true;

        for (uint8 index = 0; index < maxAuctions; index++) {
            _createAuction();
        }
    }

    function setAuctionDuration(
        uint256 _auctionDuration
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        auctionDuration = _auctionDuration;
        emit AuctionDurationUpdated(auctionDuration);
    }

    function setTimeBuffer(
        uint256 _timeBuffer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        timeBuffer = _timeBuffer;
        emit TimeBufferUpdated(_timeBuffer);
    }

    function getActiveAuctions() external view returns (uint256[] memory) {
        return activeAuctions;
    }

    function setTokenContract(
        IERC721Mintable tokenContract
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _tokenContract = tokenContract;
        emit TokenContractUpdated(_tokenContract);
    }

    function endCurrentAndCreateNewAuction(
        uint auctionId
    ) external nonReentrant whenNotPaused {
        _endAuction(auctionId);
        _createAuction();
    }

    function _addressToString(
        address _address
    ) private pure returns (string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_address)));
        bytes memory HEX = '0123456789abcdef';
        bytes memory _string = new bytes(42);
        _string[0] = '0';
        _string[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            _string[2 + i * 2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3 + i * 2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }

    function auctionIdForTokenId(
        uint256 tokenId
    ) public view returns (uint256) {
        for (uint index = 0; index < activeAuctions.length; index++) {
            if (auctions[activeAuctions[index]].tokenId == tokenId) {
                return activeAuctions[index];
            }
        }

        return 0;
    }

    function auction(
        uint auctionId
    ) external view auctionExists(auctionId) returns (string memory) {
        Auction memory entity = auctions[auctionId];

        return
            string(
                abi.encodePacked(
                    '{',
                    '"auctionId": "',
                    Strings.toString(auctionId),
                    '", "tokenId": "',
                    Strings.toString(entity.tokenId),
                    '", "amount": "',
                    Strings.toString(entity.amount),
                    '", "duration": "',
                    Strings.toString(entity.duration),
                    '", "reservePrice": "',
                    Strings.toString(entity.reservePrice),
                    '", "firstBidTime": "',
                    Strings.toString(entity.firstBidTime),
                    '", "tokenOwner": "',
                    _addressToString(entity.tokenOwner),
                    '", "bidder": "',
                    _addressToString(entity.bidder),
                    '"',
                    '}'
                )
            );
    }

    /**
     * @notice Create a bid on a token, with a given amount.
     * @dev If provided a valid bid, transfers the provided amount to this contract.
     * If the auction is run in native ETH, the ETH is wrapped so it can be identically to other
     * auction currencies in this contract.
     */
    function createBid(
        uint256 auctionId,
        uint256 amount
    ) external payable auctionExists(auctionId) nonReentrant {
        address payable lastBidder = auctions[auctionId].bidder;
        require(
            auctions[auctionId].firstBidTime == 0 ||
                block.timestamp <
                auctions[auctionId].firstBidTime + auctions[auctionId].duration,
            'Auction expired'
        );
        require(
            amount >= auctions[auctionId].reservePrice,
            'Must send at least reservePrice'
        );
        require(
            amount >=
                auctions[auctionId].amount +
                    auctions[auctionId].amount.mulDiv(
                        minBidIncrementPercentage,
                        100
                    ),
            'Must send more than last bid by minBidIncrementPercentage amount'
        );

        // If this is the first valid bid, we should set the starting time now.
        // If it's not, then we should refund the last bidder
        if (auctions[auctionId].firstBidTime == 0) {
            auctions[auctionId].firstBidTime = block.timestamp;
        } else if (lastBidder != address(0)) {
            _handleOutgoingBid(lastBidder, auctions[auctionId].amount);
        }

        _handleIncomingBid(amount);

        auctions[auctionId].amount = amount;
        auctions[auctionId].bidder = payable(_msgSender());

        bool extended = false;
        // at this point we know that the timestamp is less than start + duration (since the auction would be over, otherwise)
        // we want to know by how much the timestamp is less than start + duration
        // if the difference is less than the timeBuffer, increase the duration by the timeBuffer
        if (
            (auctions[auctionId].firstBidTime + auctions[auctionId].duration) -
                block.timestamp <
            timeBuffer
        ) {
            // Playing code golf for gas optimization:
            // uint256 expectedEnd = auctions[auctionId].firstBidTime.add(auctions[auctionId].duration);
            // uint256 timeRemaining = expectedEnd.sub(block.timestamp);
            // uint256 timeToAdd = timeBuffer.sub(timeRemaining);
            // uint256 newDuration = auctions[auctionId].duration.add(timeToAdd);
            uint256 oldDuration = auctions[auctionId].duration;
            auctions[auctionId].duration =
                oldDuration +
                (timeBuffer -
                    ((auctions[auctionId].firstBidTime + oldDuration) -
                        block.timestamp));
            extended = true;
        }

        emit AuctionBid(
            auctionId,
            auctions[auctionId].tokenId,
            _msgSender(),
            amount,
            lastBidder == address(0), // firstBid boolean
            extended
        );

        if (extended) {
            emit AuctionDurationExtended(
                auctionId,
                auctions[auctionId].tokenId,
                auctions[auctionId].duration
            );
        }
    }

    /**
     * @notice Create an auction.
     * @dev Store the auction details in the auctions mapping and emit an AuctionCreated event.
     * If there is no curator, or if the curator is the auction creator, automatically approve the auction.
     */
    function _createAuction() internal returns (uint256) {
        require(
            activeAuctions.length <= maxAuctions,
            '0xAuctionHouse: max. auctions exceeded.'
        );

        uint256 tokenId = _tokenContract.safeMint(address(this));
        uint256 auctionId = _nextAuctionId++;

        auctions[auctionId] = Auction({
            tokenId: tokenId,
            amount: 0,
            duration: auctionDuration,
            reservePrice: reservePrice,
            firstBidTime: 0,
            tokenOwner: address(this),
            bidder: payable(address(0))
        });

        emit AuctionCreated(
            auctionId,
            tokenId,
            auctionDuration,
            reservePrice,
            address(this)
        );

        activeAuctions.push(auctionId);

        return auctionId;
    }

    /**
     * @notice End an auction, finalizing the bid on Zora if applicable and paying out the respective parties.
     * @dev If for some reason the auction cannot be finalized (invalid token recipient, for example),
     * The auction is reset and the NFT is transferred back to the auction creator.
     */
    function _endAuction(uint256 auctionId) internal auctionExists(auctionId) {
        require(
            uint256(auctions[auctionId].firstBidTime) != 0,
            "Auction hasn't begun"
        );
        require(
            block.timestamp >=
                auctions[auctionId].firstBidTime + auctions[auctionId].duration,
            "Auction hasn't completed"
        );

        uint256 tokenOwnerProfit = auctions[auctionId].amount;

        // Otherwise, transfer the token to the winner and pay out the participants below
        try
            _tokenContract.safeTransferFrom(
                address(this),
                auctions[auctionId].bidder,
                auctions[auctionId].tokenId
            )
        {} catch {
            _handleOutgoingBid(
                auctions[auctionId].bidder,
                auctions[auctionId].amount
            );
            _stopAuction(auctionId);
            return;
        }

        _handleOutgoingBid(auctions[auctionId].tokenOwner, tokenOwnerProfit);

        emit AuctionEnded(
            auctionId,
            auctions[auctionId].tokenId,
            auctions[auctionId].tokenOwner,
            auctions[auctionId].bidder,
            tokenOwnerProfit
        );

        _stopAuction(auctionId);
    }

    function _stopAuction(uint256 auctionId) internal {
        _removeActiveAuction(auctionId);
        delete auctions[auctionId];
    }

    /**
     * @dev Given an amount and a currency, transfer the currency to this contract.
     * If the currency is ETH (0x0), attempt to wrap the amount as WETH
     */
    function _handleIncomingBid(uint256 amount) internal {
        require(
            msg.value == amount,
            'Sent ETH Value does not match specified bid amount'
        );
        IWETH(wethAddress).deposit{value: amount}();
    }

    function _handleOutgoingBid(address to, uint256 amount) internal {
        IWETH(wethAddress).withdraw(amount);

        // If the ETH transfer fails (sigh), rewrap the ETH and try send it as WETH.
        if (!_safeTransferETH(to, amount)) {
            IWETH(wethAddress).deposit{value: amount}();
            IERC20(wethAddress).safeTransfer(to, amount);
        }
    }

    function _safeTransferETH(
        address to,
        uint256 value
    ) internal returns (bool) {
        (bool success, ) = to.call{value: value}(new bytes(0));
        return success;
    }

    function _exists(uint256 auctionId) internal view returns (bool) {
        return auctions[auctionId].tokenOwner != address(0);
    }

    function _removeActiveAuction(uint256 _element) private {
        for (uint256 i; i < activeAuctions.length; i++) {
            if (activeAuctions[i] == _element) {
                activeAuctions[i] = activeAuctions[activeAuctions.length - 1];
                activeAuctions.pop();
                break;
            }
        }
    }

    // TODO: consider reverting if the message sender is not WETH
    receive() external payable {}

    fallback() external payable {}
}
