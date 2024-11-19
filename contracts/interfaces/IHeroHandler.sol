// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {Context} from '@openzeppelin/contracts/utils/Context.sol';
import {IERC721Errors} from '@openzeppelin/contracts/interfaces/draft-IERC6093.sol';

import {IHero} from './IHero.sol';

/**
 * @title An open auction house, enabling collectors and curators to run their own auctions
 */
abstract contract IHeroHandler is
    IERC721Receiver,
    IERC721Errors,
    Ownable,
    ReentrancyGuard
{
    error TokenAlreadyTransferred(uint256 tokenId);
    error OutOfBoundsIndex(address owner, uint256 index);

    event HeroContractUpdated(IHero tokenContract);

    IHero public heroContract;

    mapping(uint256 tokenId => address) private _owners;
    mapping(address owner => mapping(uint256 index => uint256))
        private _ownedTokens;
    mapping(uint256 tokenId => uint256) private _ownedTokensIndex;
    mapping(address owner => uint256) private _balances;

    constructor() Ownable(_msgSender()) {}

    function setHeroContract(IHero _heroContract) external onlyOwner {
        require(
            address(_heroContract) != address(0) &&
                _heroContract != heroContract
        );

        heroContract = _heroContract;
        emit HeroContractUpdated(_heroContract);
    }

    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes memory
    ) public virtual nonReentrant returns (bytes4) {
        if (tx.origin != from) {
            revert ERC721InvalidOperator(tx.origin);
        }

        if (_owners[tokenId] != address(0)) {
            revert TokenAlreadyTransferred(tokenId);
        }

        unchecked {
            _balances[from] += 1;
        }

        _owners[tokenId] = from;

        _addTokenToOwnerEnumeration(from, tokenId);

        return this.onERC721Received.selector;
    }

    function leave(uint256 tokenId) public virtual nonReentrant {
        if (_owners[tokenId] != tx.origin) {
            revert ERC721IncorrectOwner(tx.origin, tokenId, _owners[tokenId]);
        }

        heroContract.safeTransferFrom(address(this), _owners[tokenId], tokenId);

        unchecked {
            _balances[_owners[tokenId]] -= 1;
        }

        _removeTokenFromOwnerEnumeration(_owners[tokenId], tokenId);
        _owners[tokenId] = address(0);
    }

    function balanceOf(address owner) public view virtual returns (uint256) {
        if (owner == address(0)) {
            revert ERC721InvalidOwner(address(0));
        }
        return _balances[owner];
    }

    function tokenOfOwnerByIndex(
        address owner,
        uint256 index
    ) public view virtual returns (uint256) {
        if (index >= balanceOf(owner)) {
            revert OutOfBoundsIndex(owner, index);
        }
        return _ownedTokens[owner][index];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        return _owners[tokenId];
    }

    function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
        uint256 length = balanceOf(to) - 1;
        _ownedTokens[to][length] = tokenId;
        _ownedTokensIndex[tokenId] = length;
    }

    function _removeTokenFromOwnerEnumeration(
        address from,
        uint256 tokenId
    ) private {
        uint256 lastTokenIndex = balanceOf(from);
        uint256 tokenIndex = _ownedTokensIndex[tokenId];

        if (tokenIndex != lastTokenIndex) {
            uint256 lastTokenId = _ownedTokens[from][lastTokenIndex];

            _ownedTokens[from][tokenIndex] = lastTokenId;
            _ownedTokensIndex[lastTokenId] = tokenIndex;
        }

        delete _ownedTokensIndex[tokenId];
        delete _ownedTokens[from][lastTokenIndex];
    }
}
