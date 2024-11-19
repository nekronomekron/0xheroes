// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.20;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

import {ERC20Permit} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol';
import {ERC20Votes} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import {Nonces} from '@openzeppelin/contracts/utils/Nonces.sol';

import './interfaces/IERC20Mintable.sol';

contract OxGold is
    AccessControl,
    ERC20Pausable,
    ERC20Burnable,
    ERC20Permit,
    ERC20Votes,
    IERC20Mintable
{
    bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

    constructor() ERC20('0xGold', '0xG') ERC20Permit('0xGold') {
        _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    }

    function _update(
        address from,
        address to,
        uint256 value
    )
        internal
        virtual
        override(ERC20, ERC20Pausable, ERC20Votes)
        whenNotPaused
    {
        super._update(from, to, value);
    }

    function nonces(
        address owner
    ) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }

    function clock() public view override returns (uint48) {
        return uint48(block.timestamp);
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() public pure override returns (string memory) {
        return 'mode=timestamp';
    }

    function mint(
        address account,
        uint256 value
    ) external onlyRole(MINTER_ROLE) {
        _mint(account, value);
    }
}
