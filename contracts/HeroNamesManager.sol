// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Strings.sol';

import './interfaces/IHeroNamesManager.sol';
import './libraries/ArtPackage.sol';

contract HeroNamesManager is IHeroNamesManager, Ownable {
    event MalePrefixesUpdated(string[] prefixes);
    event MaleForenamesUpdated(string[] forenames);

    event FemalePrefixesUpdated(string[] prefixes);
    event FemaleForenamesUpdated(string[] forenames);

    event SurnamesUpdated(string[] surnames);

    constructor() Ownable(msg.sender) {}

    string[] private _malePrefixes;
    string[] private _maleForenames;

    string[] private _femalePrefixes;
    string[] private _femaleForenames;

    string[] private _surnames;

    function setMalePrefixes(string[] memory prefixes) external onlyOwner {
        _malePrefixes = prefixes;
        emit MalePrefixesUpdated(prefixes);
    }

    function setMaleForenames(string[] memory forenames) external onlyOwner {
        _maleForenames = forenames;
        emit MaleForenamesUpdated(forenames);
    }

    function setFemalePrefixes(string[] memory prefixes) external onlyOwner {
        _femalePrefixes = prefixes;
        emit FemalePrefixesUpdated(prefixes);
    }

    function setFemaleForenames(string[] memory forenames) external onlyOwner {
        _femaleForenames = forenames;
        emit FemaleForenamesUpdated(forenames);
    }

    function setSurnames(string[] memory surnames) external onlyOwner {
        _surnames = surnames;
        emit SurnamesUpdated(surnames);
    }

    function getFullName(
        HeroName memory heroName,
        uint8 gender
    ) external view returns (string memory) {
        if (gender == 0) {
            return
                string(
                    abi.encodePacked(
                        _malePrefixes[heroName.prefix % _malePrefixes.length],
                        ' ',
                        _maleForenames[
                            heroName.forename % _maleForenames.length
                        ],
                        ' ',
                        _surnames[heroName.surname % _surnames.length]
                    )
                );
        } else {
            return
                string(
                    abi.encodePacked(
                        _femalePrefixes[
                            heroName.prefix % _femalePrefixes.length
                        ],
                        ' ',
                        _femaleForenames[
                            heroName.forename % _femaleForenames.length
                        ],
                        ' ',
                        _surnames[heroName.surname % _surnames.length]
                    )
                );
        }
    }
}
