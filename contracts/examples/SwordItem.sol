// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';

import '../interfaces/IItem.sol';

contract SwordItem is ERC721, ERC721Enumerable, IItem {
    uint256 private _nextTokenId = 0;

    ItemAttributes private _demoSword =
        ItemAttributes({
            strength: 0,
            constitution: 0,
            dexterity: -5,
            intelligence: 0,
            wisdom: 0,
            charisma: 0,
            cost: 5,
            damage: 11,
            weight: 2
        });

    string private _imageData =
        string(
            abi.encodePacked(
                'data:image/svg+xml;base64,',
                Base64.encode(
                    bytes(
                        string(
                            abi.encodePacked(
                                '<svg width="320" height="320" xmlns="http://www.w3.org/2000/svg" shape-rendering="crispEdges" viewBox="0 0 320 320">',
                                '<rect width="100%" height="100%" fill="#FF3300" />',
                                '<rect width="20" height="20" x="60" y="240" fill="#824a40ff"></rect><rect width="40" height="20" x="220" fill="#cbcbcbff" y="40"></rect><rect width="20" height="20" x="200" y="60" fill="#cbcbcbff"></rect><rect width="20" height="20" x="220" y="60" fill="#929292ff"></rect><rect width="20" height="20" x="240" y="60" fill="#3e3e3eff"></rect><rect width="20" height="20" x="180" y="80" fill="#cbcbcbff"></rect><rect width="20" height="20" x="200" y="80" fill="#929292ff"></rect><rect width="20" height="20" x="220" y="80" fill="#3e3e3eff"></rect><rect width="20" height="20" x="160" y="100" fill="#cbcbcbff"></rect><rect width="20" height="20" x="180" y="100" fill="#929292ff"></rect><rect width="20" height="20" x="200" y="100" fill="#3e3e3eff"></rect><rect width="20" height="20" x="140" y="120" fill="#cbcbcbff"></rect><rect width="20" height="20" x="160" y="120" fill="#929292ff"></rect><rect width="20" height="20" x="180" y="120" fill="#3e3e3eff"></rect><rect width="20" height="20" x="120" y="140" fill="#cbcbcbff"></rect><rect width="20" height="20" x="140" y="140" fill="#929292ff"></rect><rect width="20" height="20" x="160" y="140" fill="#3e3e3eff"></rect><rect width="20" height="20" x="80" y="160" fill="#41150dff"></rect><rect width="20" height="20" x="100" y="160" fill="#925146ff"></rect><rect width="20" height="20" x="120" y="160" fill="#929292ff"></rect><rect width="20" height="20" x="140" y="160" fill="#3e3e3eff"></rect><rect width="20" height="20" x="80" y="180" fill="#925146ff"></rect><rect width="20" height="20" x="100" y="180" fill="#41150dff"></rect><rect width="20" height="20" x="120" y="180" fill="#663931ff"></rect><rect width="20" height="20" x="60" y="200" fill="#925146ff"></rect><rect width="20" height="20" x="80" y="200" fill="#c37d70ff"></rect><rect width="20" height="20" x="100" y="200" fill="#663931ff"></rect><rect width="20" height="20" x="120" y="200" fill="#41150dff"></rect><rect width="20" height="20" y="220" fill="#925146ff" x="40"></rect><rect width="20" height="20" x="60" y="220" fill="#c37d70ff"></rect><rect width="20" height="20" x="80" y="220" fill="#663931ff"></rect>',
                                '</svg>'
                            )
                        )
                    )
                )
            )
        );

    constructor() ERC721('0xSword', '0xS') {}

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Enumerable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721Enumerable, IERC165) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function mint(address to) public returns (uint256) {
        _nextTokenId += 1;
        _safeMint(to, _nextTokenId);

        return _nextTokenId;
    }

    function getItemAttributes(
        uint256
    ) external view returns (ItemAttributes memory) {
        return _demoSword;
    }

    function getImagePart(uint256) external pure returns (IPart memory) {
        return
            IPart({
                palette: abi.encodePacked(
                    hex'0000000000000000cbcbcbff929292ff3e3e3eff41150dff925146ff663931ffc37d70ff'
                ),
                data: abi.encodePacked(
                    hex'00030e0d030900020208000102010301040700010201030104070001020103010407000102010301040700010201030104060001050106010301040700010601050107070001060108010701050600010601080107080002070900'
                ),
                offsetX: 16,
                offsetY: 8
            });
    }

    function _intToString(int value) private pure returns (string memory) {
        if (value < 0) {
            return
                string(
                    abi.encodePacked('-', Strings.toString(uint256(-1 * value)))
                );
        }
        return Strings.toString(uint256(value));
    }

    function tokenURI_(uint256) public pure returns (string memory) {
        return 'https://metadata.proof.xyz/diamond-exhibition/1353';
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            '0xSwordItem: URI query for nonexistent hero'
        );

        // prettier-ignore
        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name": "', 'Sword',
                            '", "id": "', Strings.toString(tokenId), 
                            '", "description": "', 'Test Item to showcase equipable 0xHeroes Items', 
                            '", "image": "', _imageData,
                            '", "external_url": "http://localhost:5173/heroes/', Strings.toString(tokenId),
                            '", "attributes": [',
                            '{"trait_type": "Strength", "max_value": 255, "value":', _intToString(_demoSword.strength), '},',
                            '{"trait_type": "Constitution", "max_value": 255, "value":', _intToString(_demoSword.constitution), '},',
                            '{"trait_type": "Dexterity", "max_value": 255, "value":', _intToString(_demoSword.dexterity), '},',
                            '{"trait_type": "Intelligence", "max_value": 255, "value":', _intToString(_demoSword.intelligence), '},',
                            '{"trait_type": "Wisdom", "max_value": 255, "value":', _intToString(_demoSword.wisdom), '},',
                            '{"trait_type": "Charisma", "max_value": 255, "value":', _intToString(_demoSword.charisma), '},',

                            '{"trait_type": "Cost", "max_value": 255, "value":', Strings.toString(_demoSword.cost), '},',
                            '{"trait_type": "Damage", "max_value": 255, "value":', Strings.toString(_demoSword.damage), '},',
                            '{"trait_type": "Weight", "max_value": 255, "value":', Strings.toString(_demoSword.weight), '}',
                        ']}')
                    )
                )
            )
        );
    }
}
