// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Enumerable.sol)

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

struct HeroSkin {
    uint32 background;
    uint8 floor;
    uint8 body;
    uint8 skin;
    uint8 feet;
    uint8 hair;
}

struct HeroName {
    uint8 prefix;
    uint8 forename;
    uint8 surname;
}

struct HeroAttributes {
    uint8 gender;
    uint8 life;
    uint8 health;
    uint8 inventorySize;
    uint8 strength;
    uint8 constitution;
    uint8 dexterity;
    uint8 intelligence;
    uint8 wisdom;
    uint8 charisma;
}

interface IHero is IERC721 {
    function getHeroAttributes(
        uint256 tokenId
    ) external view returns (HeroAttributes memory);
}
