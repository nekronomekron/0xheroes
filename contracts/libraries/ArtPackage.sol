// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';

import './SSTORE2.sol';
import './Inflate.sol';

contract ArtPackage is Ownable {
    error EmptyBytes();
    error BadDecompressedLength();
    error BadImageCount();
    error ImageNotFound();
    error PaletteNotFound();
    error EmptyPalette();
    error BadPaletteLength();

    event PaletteSet(uint8 index);

    struct ArtStoragePage {
        uint16 imageCount;
        uint80 decompressedLength;
        address pointer;
    }

    struct Trait {
        ArtStoragePage[] storagePages;
        uint256 storedImagesCount;
    }

    mapping(uint8 => address) private palettesPointers;

    constructor() Ownable(_msgSender()) {}

    function setPalette(
        uint8 paletteIndex,
        bytes calldata palette
    ) external onlyOwner {
        if (palette.length == 0) {
            revert EmptyPalette();
        }
        if (palette.length % 4 != 0 || palette.length > 256 * 4) {
            revert BadPaletteLength();
        }
        palettesPointers[paletteIndex] = SSTORE2.write(palette);

        emit PaletteSet(paletteIndex);
    }

    function artPackagePalette(
        uint8 paletteIndex
    ) internal view returns (bytes memory) {
        address pointer = palettesPointers[paletteIndex];
        if (pointer == address(0)) {
            revert PaletteNotFound();
        }
        return SSTORE2.read(palettesPointers[paletteIndex]);
    }

    function addPage(
        Trait storage trait,
        bytes calldata encodedCompressed,
        uint80 decompressedLength,
        uint16 imageCount
    ) internal {
        if (encodedCompressed.length == 0) {
            revert EmptyBytes();
        }
        address pointer = SSTORE2.write(encodedCompressed);
        addPage(trait, pointer, decompressedLength, imageCount);
    }

    function addPage(
        Trait storage trait,
        address pointer,
        uint80 decompressedLength,
        uint16 imageCount
    ) internal {
        if (decompressedLength == 0) {
            revert BadDecompressedLength();
        }
        if (imageCount == 0) {
            revert BadImageCount();
        }
        trait.storagePages.push(
            ArtStoragePage({
                pointer: pointer,
                decompressedLength: decompressedLength,
                imageCount: imageCount
            })
        );
        trait.storedImagesCount += imageCount;
    }

    function imageByIndex(
        Trait storage trait,
        uint256 index
    ) internal view returns (bytes memory) {
        (ArtStoragePage storage page, uint256 indexInPage) = getPage(
            trait.storagePages,
            index
        );
        bytes[] memory decompressedImages = decompressAndDecode(page);
        return decompressedImages[indexInPage];
    }

    function getPage(
        ArtStoragePage[] storage pages,
        uint256 index
    ) private view returns (ArtStoragePage storage, uint256) {
        uint256 len = pages.length;
        uint256 pageFirstImageIndex = 0;
        for (uint256 i = 0; i < len; i++) {
            ArtStoragePage storage page = pages[i];

            if (index < pageFirstImageIndex + page.imageCount) {
                return (page, index - pageFirstImageIndex);
            }

            pageFirstImageIndex += page.imageCount;
        }

        revert ImageNotFound();
    }

    function decompressAndDecode(
        ArtStoragePage storage page
    ) private view returns (bytes[] memory) {
        bytes memory compressedData = SSTORE2.read(page.pointer);
        (, bytes memory decompressedData) = Inflate.puff(
            compressedData,
            page.decompressedLength
        );
        return abi.decode(decompressedData, (bytes[]));
    }
}
