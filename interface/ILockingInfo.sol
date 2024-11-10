// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ISequencerInfo} from "./ISequencerInfo.sol";
import {ILockingInfo as ILockingInfoRaw} from "./ILockingInfoRaw.sol";

interface ILockingInfo is ILockingInfoRaw {
    function bridge() external view returns(address);
    function l1Token() external view returns(address);
    function l2Token() external view returns(address);
    function minLock() external view returns(uint256);
    function maxLock() external view returns(uint256);
}