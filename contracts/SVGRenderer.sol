// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/ISVGRenderer.sol';

contract SVGRenderer is ISVGRenderer, Ownable {
    bytes16 private constant _HEX_SYMBOLS = '0123456789abcdef';
    uint256 private constant _INDEX_TO_BYTES4_FACTOR = 4;

    string[33] private _LOOKUP_TABLE = [
        '0',
        '20',
        '40',
        '60',
        '80',
        '100',
        '120',
        '140',
        '160',
        '180',
        '200',
        '220',
        '240',
        '260',
        '280',
        '300',
        '320',
        '340',
        '360',
        '380',
        '400',
        '420',
        '440',
        '460',
        '480',
        '500',
        '520',
        '540',
        '560',
        '580',
        '600',
        '620',
        '640'
    ];

    struct ContentBounds {
        uint8 top;
        uint8 right;
        uint8 bottom;
        uint8 left;
    }

    struct Draw {
        uint8 length;
        uint8 color;
    }

    struct DecodedImage {
        ContentBounds bounds;
        Draw[] draws;
    }

    constructor() Ownable(_msgSender()) {}

    function generateSVG(
        SVGImage memory svgImage,
        uint16 viewboxSize,
        bool transparent,
        bool grayscale
    ) external view returns (string memory svg) {
        string memory backgroundRect = '';
        if (!transparent) {
            backgroundRect = string(
                abi.encodePacked(
                    '<rect width="100%" height="100%" fill="',
                    getHSLString(svgImage.background, 45, 255, grayscale),
                    '" />'
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    '<svg width="640" height="640" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 ',
                    Strings.toString(viewboxSize),
                    ' ',
                    Strings.toString(viewboxSize),
                    '">',
                    backgroundRect,
                    generateSVGRects(svgImage, grayscale),
                    '</svg>'
                )
            );
    }

    function getHSLString(
        HSLColor memory color,
        uint8 baseLuminance,
        uint8 alpha,
        bool grayscale
    ) private pure returns (string memory) {
        uint16 hue = uint16(color.hue % 360);
        uint8 saturation = 25 + uint8(color.saturation % 70);
        uint8 luminance = baseLuminance + uint8(color.luminance % 10);

        if (grayscale) saturation = 0;

        string memory alphaFactor = '1.0';
        if (alpha < 255) {
            alphaFactor = string(
                abi.encodePacked(
                    '0.',
                    Strings.toString((uint(alpha) * 100) / 255)
                )
            );
        }

        return
            string(
                abi.encodePacked(
                    'hsla(',
                    Strings.toString(hue),
                    ',',
                    Strings.toString(saturation),
                    '%,',
                    Strings.toString(luminance),
                    '%,',
                    alphaFactor,
                    ')'
                )
            );
    }

    function generateSVGRects(
        SVGImage memory svgImage,
        bool grayscale
    ) private view returns (string memory svg) {
        string memory rects;
        string[] memory cache;
        for (uint8 p = 0; p < svgImage.parts.length; p++) {
            if (
                svgImage.parts[p].data.length == 0 ||
                svgImage.parts[p].palette.length == 0
            ) continue;

            cache = new string[](256); // Initialize color cache

            DecodedImage memory image = _decodeRLEImage(svgImage.parts[p].data);

            uint256 currentX = image.bounds.left;
            uint256 currentY = image.bounds.top;
            uint256 cursor;
            string[16] memory buffer;

            string memory part;
            for (uint256 i = 0; i < image.draws.length; i++) {
                Draw memory draw = image.draws[i];

                uint8 length = _getRectLength(
                    currentX,
                    draw.length,
                    image.bounds.right
                );

                while (length > 0) {
                    if (draw.color != 0) {
                        {
                            buffer[cursor] = _LOOKUP_TABLE[length];
                            buffer[cursor + 1] = _LOOKUP_TABLE[
                                currentX + svgImage.parts[p].offsetX
                            ];
                            buffer[cursor + 2] = _LOOKUP_TABLE[
                                currentY + svgImage.parts[p].offsetY
                            ];
                            if (grayscale) {
                                buffer[cursor + 3] = _getGrayscaleColor(
                                    svgImage.parts[p].palette,
                                    draw.color,
                                    cache
                                );
                            } else {
                                buffer[cursor + 3] = _getColor(
                                    svgImage.parts[p].palette,
                                    draw.color,
                                    cache
                                );
                            }
                            cursor += 4;
                        }

                        if (cursor >= 16) {
                            part = string(
                                abi.encodePacked(
                                    part,
                                    _getChunk(cursor, buffer)
                                )
                            );
                            cursor = 0;
                        }
                    }

                    {
                        currentX += length;
                        if (currentX == image.bounds.right) {
                            currentX = image.bounds.left;
                            currentY++;
                        }

                        draw.length -= length;
                        length = _getRectLength(
                            currentX,
                            draw.length,
                            image.bounds.right
                        );
                    }
                }
            }

            if (cursor != 0) {
                part = string(
                    abi.encodePacked(part, _getChunk(cursor, buffer))
                );
            }
            rects = string(abi.encodePacked(rects, part));
        }
        return rects;
    }

    function _getGrayscaleColor(
        bytes memory palette,
        uint256 index,
        string[] memory cache
    ) private pure returns (string memory) {
        if (bytes(cache[index]).length == 0) {
            uint256 i = index * _INDEX_TO_BYTES4_FACTOR;
            cache[index] = _toHexString(
                abi.encodePacked(
                    palette[i],
                    palette[i],
                    palette[i],
                    palette[i + 3]
                )
            );
        }
        return cache[index];
    }

    function _getColor(
        bytes memory palette,
        uint256 index,
        string[] memory cache
    ) private pure returns (string memory) {
        if (bytes(cache[index]).length == 0) {
            uint256 i = index * _INDEX_TO_BYTES4_FACTOR;
            cache[index] = _toHexString(
                abi.encodePacked(
                    palette[i],
                    palette[i + 1],
                    palette[i + 2],
                    palette[i + 3]
                )
            );
        }
        return cache[index];
    }

    function _decodeRLEImage(
        bytes memory image
    ) private pure returns (DecodedImage memory) {
        ContentBounds memory bounds = ContentBounds({
            top: uint8(image[1]),
            right: uint8(image[2]),
            bottom: uint8(image[3]),
            left: uint8(image[4])
        });

        uint256 cursor;
        Draw[] memory draws = new Draw[]((image.length - 5) / 2);
        for (uint256 i = 5; i < image.length; i += 2) {
            draws[cursor] = Draw({
                length: uint8(image[i]),
                color: uint8(image[i + 1])
            });

            cursor++;
        }
        return DecodedImage({bounds: bounds, draws: draws});
    }

    function _toHexString(bytes memory b) private pure returns (string memory) {
        uint32 value = uint32(bytes4(b));

        bytes memory buffer = new bytes(8);
        buffer[7] = _HEX_SYMBOLS[value & 0xf];
        buffer[6] = _HEX_SYMBOLS[(value >> 4) & 0xf];
        buffer[5] = _HEX_SYMBOLS[(value >> 8) & 0xf];
        buffer[4] = _HEX_SYMBOLS[(value >> 12) & 0xf];
        buffer[3] = _HEX_SYMBOLS[(value >> 16) & 0xf];
        buffer[2] = _HEX_SYMBOLS[(value >> 20) & 0xf];
        buffer[1] = _HEX_SYMBOLS[(value >> 24) & 0xf];
        buffer[0] = _HEX_SYMBOLS[(value >> 28) & 0xf];
        return string(buffer);
    }

    function _getRectLength(
        uint256 currentX,
        uint8 drawLength,
        uint8 rightBound
    ) private pure returns (uint8) {
        uint8 remainingPixelsInLine = rightBound - uint8(currentX);
        return
            drawLength <= remainingPixelsInLine
                ? drawLength
                : remainingPixelsInLine;
    }

    function _getChunk(
        uint256 cursor,
        string[16] memory buffer
    ) private pure returns (string memory) {
        string memory chunk;
        for (uint256 i = 0; i < cursor; i += 4) {
            chunk = string(
                abi.encodePacked(
                    chunk,
                    '<rect width="',
                    buffer[i],
                    '" height="20" x="',
                    buffer[i + 1],
                    '" y="',
                    buffer[i + 2],
                    '" fill="#',
                    buffer[i + 3],
                    '" />'
                )
            );
        }
        return chunk;
    }
}
