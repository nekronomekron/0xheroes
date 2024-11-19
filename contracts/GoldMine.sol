// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import './interfaces/IERC20Mintable.sol';
import {IHeroHandler} from './interfaces/IHeroHandler.sol';

/**
 * @title An open auction house, enabling collectors and curators to run their own auctions
 */
contract GoldMine is IHeroHandler {
    event RewardTokenUpdated(IERC20Mintable rewardToken);

    IERC20Mintable private _rewardToken;

    mapping(uint256 tokenId => uint256) private _enterTimestamps;

    uint256 private _stakingRatePerSecond = 10000 gwei;

    function setRewardToken(IERC20Mintable rewardToken) external onlyOwner {
        require(
            address(rewardToken) != address(0) && _rewardToken != rewardToken
        );

        _rewardToken = rewardToken;
        emit RewardTokenUpdated(_rewardToken);
    }

    function stakedGold(uint256 tokenId) external view returns (uint256) {
        if (
            heroContract.ownerOf(tokenId) != address(this) ||
            _enterTimestamps[tokenId] == 0
        ) {
            revert ERC721NonexistentToken(tokenId);
        }

        return
            (block.timestamp - _enterTimestamps[tokenId]) *
            heroContract.getHeroAttributes(tokenId).strength *
            _stakingRatePerSecond;
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes memory data
    ) public override returns (bytes4) {
        require(_enterTimestamps[tokenId] == 0);

        _enterTimestamps[tokenId] = block.timestamp;
        return super.onERC721Received(operator, from, tokenId, data);
    }

    function leave(uint256 tokenId) public override {
        _rewardToken.mint(ownerOf(tokenId), this.stakedGold(tokenId));
        _enterTimestamps[tokenId] = 0;

        super.leave(tokenId);
    }
}
