// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import '../interfaces/IHero.sol';

interface IHeroNamesManager {
    function getFullName(
        HeroName memory heroName,
        uint8 gender
    ) external view returns (string memory);
}
