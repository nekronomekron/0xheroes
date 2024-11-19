// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v5.0.0) (token/ERC721/extensions/IERC721Enumerable.sol)

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface IERC721Mintable is IERC721 {
    function safeMint(address to) external returns (uint256);
}
