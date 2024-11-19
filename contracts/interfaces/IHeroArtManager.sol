// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import '../interfaces/IHero.sol';
import '../interfaces/ISVGRenderer.sol';

interface IHeroArtManager {
    function getSVGImageData(
        HeroSkin memory heroSkin,
        IPart[] memory additionalParts
    ) external view returns (SVGImage memory);
}
