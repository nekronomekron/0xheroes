// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/utils/Pausable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

import './interfaces/IProxyRegistry.sol';
import './interfaces/IERC721Mintable.sol';
import './interfaces/ISVGRenderer.sol';
import './interfaces/IHeroArtManager.sol';
import './interfaces/IHeroNamesManager.sol';
import './interfaces/IHero.sol';
import './interfaces/IItem.sol';

import {IHeroHandler} from './interfaces/IHeroHandler.sol';

/// @custom:security-contact reifialex@gmail.com
contract OxHero is
    ERC721,
    ERC721Enumerable,
    AccessControl,
    Pausable,
    IERC721Mintable,
    IHero
{
    event AuctionHouseUpdated(address);

    event AddedHeroHandler(IHeroHandler);
    event RemovedHeroHandler(IHeroHandler);

    event SVGRendererUpdated(ISVGRenderer svgRenderer);
    event HeroArtManagerUpdated(IHeroArtManager heroArtManager);
    event HeroNamesManagerUpdated(IHeroNamesManager heroNamesManager);
    event HeroAttributesUpdated(
        uint256 tokenId,
        HeroAttributes oldValues,
        HeroAttributes newValues
    );

    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');
    bytes32 public constant HERO_STATS_UPDATER_ROLE =
        keccak256('HERO_STATS_UPDATER_ROLE');

    uint256 private _nextTokenId;

    address private _auctionHouse;

    IHeroHandler[] private heroHandlers;

    IProxyRegistry private immutable _proxyRegistry;
    ISVGRenderer private _svgRenderer;
    IHeroArtManager private _heroArtManager;
    IHeroNamesManager private _heroNamesManager;

    mapping(uint256 => HeroSkin) private _heroSkins;
    mapping(uint256 => HeroAttributes) private _heroAttributes;
    mapping(uint256 => HeroName) private _heroNames;

    /*
     * Item Management
     */
    error HeroItemOutOfBoundsIndex(uint256 heroId, uint256 index);

    struct ItemMetadata {
        uint256 itemId;
        IItem itemContract;
    }

    mapping(uint256 tokenId => uint256) private _equippedItemBalances;
    mapping(uint256 tokenId => mapping(uint256 index => ItemMetadata))
        private _equippedItems;

    constructor(IProxyRegistry proxyRegistry) ERC721('0xHero', '0xH') {
        _proxyRegistry = proxyRegistry;
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());

        _nextTokenId = 1;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable)
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function _getHeroSkin(
        uint256 pseudorandomness
    ) internal pure returns (HeroSkin memory) {
        return
            HeroSkin({
                background: uint32(pseudorandomness),
                floor: uint8(pseudorandomness >> 32),
                body: uint8(pseudorandomness >> 40),
                skin: uint8(pseudorandomness >> 48),
                feet: uint8(pseudorandomness >> 56),
                hair: uint8(pseudorandomness >> 64)
            });
    }

    function _getHeroAttributes(
        uint256 pseudorandomness
    ) internal pure returns (HeroAttributes memory) {
        uint8 life = 5 + (uint8(pseudorandomness >> 80) % 20);

        return
            HeroAttributes({
                gender: uint8(pseudorandomness >> 72) % 2,
                life: life,
                health: life,
                strength: 1 + (uint8(pseudorandomness >> 88) % 20),
                constitution: 1 + (uint8(pseudorandomness >> 96) % 20),
                dexterity: 1 + (uint8(pseudorandomness >> 104) % 20),
                intelligence: 1 + (uint8(pseudorandomness >> 112) % 20),
                wisdom: 1 + (uint8(pseudorandomness >> 120) % 20),
                charisma: 1 + (uint8(pseudorandomness >> 128) % 20),
                inventorySize: 4 + (uint8(pseudorandomness >> 134) % 12)
            });
    }

    function _getHeroName(
        uint256 pseudorandomness
    ) internal pure returns (HeroName memory) {
        uint8 prefix = uint8(pseudorandomness >> 96);
        uint8 forename = uint8(pseudorandomness >> 104);
        uint8 surname = uint8(pseudorandomness >> 116);

        return HeroName({prefix: prefix, forename: forename, surname: surname});
    }

    function _getSVG(
        uint256 tokenId,
        HeroSkin memory heroSkin,
        bool transparent,
        bool grayscale
    ) internal view returns (string memory) {
        IPart[] memory additionalParts = new IPart[](balanceOfItems(tokenId));
        for (
            uint256 itemIndex = 0;
            itemIndex < balanceOfItems(tokenId);
            itemIndex++
        ) {
            ItemMetadata memory item = itemOfHeroByIndex(tokenId, itemIndex);
            additionalParts[itemIndex] = item.itemContract.getImagePart(
                item.itemId
            );
        }

        string memory image = Base64.encode(
            bytes(
                _svgRenderer.generateSVG(
                    _heroArtManager.getSVGImageData(heroSkin, additionalParts),
                    640,
                    transparent,
                    grayscale
                )
            )
        );
        return string(abi.encodePacked('data:image/svg+xml;base64,', image));
    }

    function isApprovedForAll(
        address _owner,
        address _operator
    ) public view override(ERC721, IERC721) returns (bool isOperator) {
        if (
            (address(_proxyRegistry) != address(0) &&
                _proxyRegistry.proxies(_owner) == _operator) ||
            hasRole(DEFAULT_ADMIN_ROLE, _operator)
        ) {
            return true;
        }

        // otherwise, use the default ERC721.isApprovedForAll()
        return ERC721.isApprovedForAll(_owner, _operator);
    }

    function pause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function setAuctionHouse(
        address newAuctionHouse
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _auctionHouse = newAuctionHouse;
        emit AuctionHouseUpdated(_auctionHouse);
    }

    function addHeroHandler(
        IHeroHandler heroHandler
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(heroHandler) != address(0));

        heroHandlers.push(heroHandler);
        emit AddedHeroHandler(heroHandler);
    }

    function removeHeroHandler(
        IHeroHandler heroHandler
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(address(heroHandler) != address(0));

        for (uint index = 0; index < heroHandlers.length; index++) {
            if (heroHandlers[index] == heroHandler) {
                if (index < heroHandlers.length - 1) {
                    heroHandlers[index] = heroHandlers[heroHandlers.length - 1];
                }

                heroHandlers.pop();
                emit RemovedHeroHandler(heroHandler);
                return;
            }
        }
    }

    function ownedByHeroHandler(
        uint256 tokenId
    ) external view returns (address) {
        address owner = _ownerOf(tokenId);
        for (uint index = 0; index < heroHandlers.length; index++) {
            if (owner == address(heroHandlers[index]))
                return address(heroHandlers[index]);
        }
        return address(0);
    }

    function setSVGRenderer(
        ISVGRenderer svgRenderer
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _svgRenderer = svgRenderer;
        emit SVGRendererUpdated(_svgRenderer);
    }

    function setHeroArtManager(
        IHeroArtManager heroArtManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _heroArtManager = heroArtManager;
        emit HeroArtManagerUpdated(_heroArtManager);
    }

    function setHeroNamesManager(
        IHeroNamesManager heroNamesManager
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _heroNamesManager = heroNamesManager;
        emit HeroNamesManagerUpdated(_heroNamesManager);
    }

    function safeMint(
        address to
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);

        uint256 pseudorandomness = uint256(
            keccak256(abi.encodePacked(blockhash(block.number - 1), tokenId))
        );

        _heroNames[tokenId] = _getHeroName(pseudorandomness);
        _heroSkins[tokenId] = _getHeroSkin(pseudorandomness);
        _heroAttributes[tokenId] = _getHeroAttributes(pseudorandomness);

        return tokenId;
    }

    function burn(uint256 tokenId) external virtual {
        // Setting an "auth" arguments enables the `_isAuthorized` check which verifies that the token exists
        // (from != 0). Therefore, it is not needed to verify that the return value is not 0 here.
        _update(address(0), tokenId, _msgSender());
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, IERC165, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function getHeroAttributes(
        uint256 tokenId
    ) external view returns (HeroAttributes memory) {
        require(
            _ownerOf(tokenId) != address(0),
            '0xHero: URI query for nonexistent hero'
        );

        return _heroAttributes[tokenId];
    }

    function updateHeroAttributes(
        uint256 tokenId,
        HeroAttributes memory newValues
    ) public onlyRole(HERO_STATS_UPDATER_ROLE) {
        require(
            _ownerOf(tokenId) != address(0),
            '0xHero: URI query for nonexistent hero'
        );

        HeroAttributes memory oldValues = _heroAttributes[tokenId];
        _heroAttributes[tokenId] = newValues;

        emit HeroAttributesUpdated(tokenId, oldValues, newValues);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            '0xHero: URI query for nonexistent hero'
        );

        HeroSkin memory heroSkin = _heroSkins[tokenId];
        HeroName memory heroName = _heroNames[tokenId];
        HeroAttributes memory heroAttributes = _heroAttributes[tokenId];

        string memory heroId = Strings.toString(tokenId);

        address owningHeroHandler = this.ownedByHeroHandler(tokenId);

        string memory image = _getSVG(
            tokenId,
            heroSkin,
            false,
            owningHeroHandler != address(0)
        );

        // prettier-ignore
        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                        abi.encodePacked(
                            '{"name": "', _heroNamesManager.getFullName(heroName, heroAttributes.gender),
                            '", "id": "', heroId, 
                            '", "description": "', string(abi.encodePacked('0xHero #', heroId, ' minted and auctioned from 0xHeroes.')), 
                            '", "image": "', image,
                            '", "external_url": "http://localhost:5173/heroes/', heroId,
                            '", "isInAuction": "', _ownerOf(tokenId) == address(_auctionHouse) ? "true" : "false",
                            '", "owningHeroHandler": "', Strings.toHexString(uint160(owningHeroHandler), 20),
                            '", "attributes": [',
                            '{"trait_type": "Gender", "value":"', heroAttributes.gender == 1 ? "Female" : "Male", '"},',
                            '{"trait_type": "Inventory", "max_value": 255, "value":', Strings.toString(heroAttributes.inventorySize), '},',
                            '{"trait_type": "Life", "max_value": 255, "value":', Strings.toString(heroAttributes.life), '},',
                            '{"trait_type": "Health", "max_value": 255, "value":', Strings.toString(heroAttributes.health), '},',
                            '{"trait_type": "Strength", "max_value": 255, "value":', Strings.toString(heroAttributes.strength), '},',
                            '{"trait_type": "Constitution", "max_value": 255, "value":', Strings.toString(heroAttributes.constitution), '},',
                            '{"trait_type": "Dexterity", "max_value": 255, "value":', Strings.toString(heroAttributes.dexterity), '},',
                            '{"trait_type": "Intelligence", "max_value": 255, "value":', Strings.toString(heroAttributes.intelligence), '},',
                            '{"trait_type": "Wisdom", "max_value": 255, "value":', Strings.toString(heroAttributes.wisdom), '},',
                            '{"trait_type": "Charisma", "max_value": 255, "value":', Strings.toString(heroAttributes.charisma), '}',                            
                        ']}')
                    )
                )
            )
        );
    }

    /*
     * Item Management
     */

    function equipItem(
        uint256 tokenId,
        IItem itemContract,
        uint256 itemId
    ) public {
        require(
            itemContract.ownerOf(itemId) == _ownerOf(tokenId),
            '0xHero: Owner of hero and item must be identical'
        );

        require(
            _isAuthorized(itemContract.ownerOf(itemId), _msgSender(), tokenId),
            '0xHero: Sender is not authorized for action'
        );

        HeroAttributes memory hero = this.getHeroAttributes(tokenId);
        require(
            balanceOfItems(tokenId) < hero.inventorySize,
            '0xHero: Inventory already full'
        );

        _addItemToHeroEnumeration(tokenId, itemContract, itemId);
    }

    function unequipItem(
        uint256 tokenId,
        IItem itemContract,
        uint256 itemId
    ) public {
        require(
            itemContract.ownerOf(itemId) == _ownerOf(tokenId),
            '0xHero: Owner of hero and item must be identical'
        );

        require(
            _isAuthorized(itemContract.ownerOf(itemId), _msgSender(), tokenId),
            '0xHero: Sender is not authorized for action'
        );

        _removeItemFromHeroEnumeration(tokenId, itemContract, itemId);
    }

    function balanceOfItems(uint256 tokenId) public view returns (uint256) {
        require(
            _ownerOf(tokenId) != address(0),
            '0xHero: Query for nonexistent hero'
        );

        return _equippedItemBalances[tokenId];
    }

    function itemOfHeroByIndex(
        uint256 tokenId,
        uint256 index
    ) public view returns (ItemMetadata memory) {
        if (index >= balanceOfItems(tokenId)) {
            revert HeroItemOutOfBoundsIndex(tokenId, index);
        }
        return _equippedItems[tokenId][index];
    }

    function _addItemToHeroEnumeration(
        uint256 tokenId,
        IItem itemContract,
        uint256 itemId
    ) private {
        uint256 length = balanceOfItems(tokenId);
        _equippedItems[tokenId][length] = ItemMetadata({
            itemId: itemId,
            itemContract: itemContract
        });
        _equippedItemBalances[tokenId] += 1;
    }

    function _removeItemFromHeroEnumeration(
        uint256 tokenId,
        IItem itemContract,
        uint256 itemId
    ) private {
        for (
            uint256 itemIndex;
            itemIndex < balanceOfItems(tokenId);
            itemIndex++
        ) {
            ItemMetadata memory currentItem = itemOfHeroByIndex(
                tokenId,
                itemIndex
            );

            if (
                currentItem.itemId != itemId ||
                address(currentItem.itemContract) != address(itemContract)
            ) continue;

            uint256 lastItemIndex = balanceOfItems(tokenId) - 1;
            if (itemIndex != lastItemIndex) {
                _equippedItems[tokenId][itemIndex] = _equippedItems[tokenId][
                    lastItemIndex
                ];
            }

            _equippedItemBalances[tokenId] -= 1;
            delete _equippedItems[tokenId][lastItemIndex];

            break;
        }
    }
}
