// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Enumerable.sol)

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import './ISVGRenderer.sol';

struct ItemAttributes {
    int8 strength;
    int8 constitution;
    int8 dexterity;
    int8 intelligence;
    int8 wisdom;
    int8 charisma;
    uint8 cost;
    uint8 damage;
    uint8 weight;
}

interface IItem is IERC721 {
    function getItemAttributes(
        uint256 tokenId
    ) external view returns (ItemAttributes memory);

    function getImagePart(uint256 tokenId) external view returns (IPart memory);
}
