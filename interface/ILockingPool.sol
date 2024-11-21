// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity ^0.8.9;

import "./ILockingInfo.sol";
import "./ISequencerInfo.sol";

interface ILockingPool is ISequencerInfo {
    struct SequencerData {
        uint256 amount; // sequencer current locked
        uint256 reward; // sequencer current reward that have not cleamed
        uint256 activationBatch; // sequencer activation batch id
        uint256 updatedBatch; // batch id of the last updated
        uint256 deactivationBatch; // sequencer deactivation batch id
        uint256 deactivationTime; // sequencer deactivation timestamp
        uint256 unlockClaimTime; // timestamp that sequencer can claim unlocked token, it's equal to deactivationTime + WITHDRAWAL_DELAY
        uint256 nonce; // sequencer operations number, starts from 1, and used internally by the Metis consencus client
        address owner; // the operator address, owns this sequencer node, it controls lock/relock/unlock/claim functions
        address signer; // sequencer signer, an address to sign L2 blocks, if you want to update it, you must have the privkey of this address
    }

    function lockFor(address _signer, uint256 _amount, bytes calldata _signerPubkey) external;
    function lockWithRewardRecipient(address _signer, address _rewardRecipient, uint256 _amount, bytes calldata _signerPubkey) external;
    function relock(uint256 _seqId, uint256 _amount, bool _lockReward) external;
    function withdrawRewards(uint256 _seqId, uint32 _l2Gas) external payable;
    function unlock( uint256 _seqId, uint32 _l2Gas) external payable;
    function unlockClaim(uint256 _seqId, uint32 _l2Gas) external payable;
    function escrow() external view returns (ILockingInfo);
    function sequencers(uint256 seqId) external view returns (SequencerData memory);
    function seqSigners(address signer) external view returns (uint256 seqId);

    /**
     * @dev Emitted when WITHDRAWAL_DELAY is updated.
     * @param _cur current withdraw delay time
     * @param _prev previours withdraw delay time
     */
    event WithrawDelayTimeChange(uint256 _cur, uint256 _prev);

    /**
     * @dev Emitted when the proxy update threshold in 'updateBlockReward()'.
     * @param newReward new block reward
     * @param oldReward  old block reward
     */
    event RewardUpdate(uint256 newReward, uint256 oldReward);

    /**
     * @dev Emitted when mpc address update in 'UpdateMpc'
     * @param _newMpc new min lock.
     */
    event UpdateMpc(address _newMpc);

    /**
     * @dev Emitted when SignerUpdateThrottle is updated
     * @param _n new min value
     */
    event SetSignerUpdateThrottle(uint256 _n);
    function withdraw(uint256 _seqId, uint256 _amount) external;
}