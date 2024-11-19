// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

struct HSLColor {
    uint16 hue;
    uint8 saturation;
    uint8 luminance;
}

struct IPart {
    bytes palette;
    bytes data;
    uint8 offsetX;
    uint8 offsetY;
}

struct SVGImage {
    HSLColor background;
    IPart[] parts;
}

interface ISVGRenderer {
    function generateSVG(
        SVGImage memory svgImage,
        uint16 viewboxSize,
        bool transparent,
        bool grayscale
    ) external view returns (string memory svg);
}
