// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/IHeroArtManager.sol';
import './libraries/ArtPackage.sol';

contract HeroArtManager is IHeroArtManager, ArtPackage {
    event BodiesAdded(uint16 count);
    event SkinsAdded(uint16 count);
    event FeetAdded(uint16 count);
    event FloorsAdded(uint16 count);
    event HairAdded(uint16 count);

    Trait public bodiesTrait;
    Trait public skinsTrait;
    Trait public feetTrait;
    Trait public floorsTrait;
    Trait public hairTrait;

    function getSVGImageData(
        HeroSkin memory heroSkin,
        IPart[] memory additionalParts
    ) external view returns (SVGImage memory) {
        HSLColor memory background = HSLColor({
            hue: uint16(heroSkin.background),
            saturation: uint8(heroSkin.background >> 16),
            luminance: uint8(heroSkin.background >> 8)
        });

        bytes memory floorData = this.floors(
            heroSkin.floor % this.floorsCount()
        );
        bytes memory bodyData = this.bodies(heroSkin.body % this.bodyCount());
        bytes memory skinData = this.skins(heroSkin.skin % this.skinCount());
        bytes memory feetData = this.feet(heroSkin.feet % this.feetCount());
        bytes memory hairData = this.hair(heroSkin.hair % this.hairCount());

        IPart[] memory parts = new IPart[](5 + additionalParts.length);

        parts[0] = IPart({
            data: floorData,
            palette: this.palette(uint8(floorData[0])),
            offsetX: 0,
            offsetY: 0
        });
        parts[1] = IPart({
            data: bodyData,
            palette: this.palette(uint8(bodyData[0])),
            offsetX: 0,
            offsetY: 0
        });
        parts[2] = IPart({
            data: feetData,
            palette: this.palette(uint8(feetData[0])),
            offsetX: 0,
            offsetY: 0
        });
        parts[3] = IPart({
            data: skinData,
            palette: this.palette(uint8(skinData[0])),
            offsetX: 0,
            offsetY: 0
        });
        parts[4] = IPart({
            data: hairData,
            palette: this.palette(uint8(hairData[0])),
            offsetX: 0,
            offsetY: 0
        });

        for (
            uint256 additionalPartIndex = 0;
            additionalPartIndex < additionalParts.length;
            additionalPartIndex++
        ) {
            parts[5 + additionalPartIndex] = additionalParts[
                additionalPartIndex
            ];
        }

        return SVGImage({background: background, parts: parts});
    }

    /*
     * Palette
     */
    function palette(uint8 paletteIndex) external view returns (bytes memory) {
        return artPackagePalette(paletteIndex);
    }

    /*
     * Bodies
     */
    function addBodies(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external onlyOwner {
        addPage(bodiesTrait, encodedCompressed, decompressedLength, imageCount);
        emit BodiesAdded(imageCount);
    }

    function bodyCount() external view returns (uint256) {
        return bodiesTrait.storedImagesCount;
    }

    function bodies(uint256 index) public view returns (bytes memory) {
        return imageByIndex(bodiesTrait, index);
    }

    /*
     * Skins
     */
    function addSkins(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external onlyOwner {
        addPage(skinsTrait, encodedCompressed, decompressedLength, imageCount);
        emit SkinsAdded(imageCount);
    }

    function skinCount() external view returns (uint256) {
        return skinsTrait.storedImagesCount;
    }

    function skins(uint256 index) public view returns (bytes memory) {
        return imageByIndex(skinsTrait, index);
    }

    /*
     * Feet
     */
    function addFeet(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external onlyOwner {
        addPage(feetTrait, encodedCompressed, decompressedLength, imageCount);
        emit FeetAdded(imageCount);
    }

    function feetCount() external view returns (uint256) {
        return feetTrait.storedImagesCount;
    }

    function feet(uint256 index) public view returns (bytes memory) {
        return imageByIndex(feetTrait, index);
    }

    /*
     * Floor
     */
    function addFloors(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external onlyOwner {
        addPage(floorsTrait, encodedCompressed, decompressedLength, imageCount);
        emit FloorsAdded(imageCount);
    }

    function floorsCount() external view returns (uint256) {
        return floorsTrait.storedImagesCount;
    }

    function floors(uint256 index) public view returns (bytes memory) {
        return imageByIndex(floorsTrait, index);
    }

    /*
     * Hair
     */
    function addHair(
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) external onlyOwner {
        addPage(hairTrait, encodedCompressed, decompressedLength, imageCount);
        emit HairAdded(imageCount);
    }

    function hairCount() external view returns (uint256) {
        return hairTrait.storedImagesCount;
    }

    function hair(uint256 index) public view returns (bytes memory) {
        return imageByIndex(hairTrait, index);
    }
}
