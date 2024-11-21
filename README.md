# Dealer Contract

## Overview

The **Dealer** contract is responsible for managing the allocation of Metis tokens from Layer 2 (L2) to the LockingPool for sequencers, facilitated through sequencer agents. This contract ensures the secure locking, relocking, and withdrawal of Metis tokens, alongside handling rewards distribution and interaction with Layer 2 components.

## Contract Initialization

Before interacting with the contract, initialize it with the following parameters:

- **Metis Token Address:** `0x7f49160EB9BB068101d445fe77E17ecDb37D0B47`
- **LockingPool Address:** `0x7591940125cC0344a65D60319d1ADcD463B2D4c3`
- **L1 Bridge Address:** `0x9848dE505e6Aa301cEecfCf23A0a150140fc996e`
- **Layer 2 Chain ID:** `59902`
- **Layer 2 Gas Limit:** `1000000`
- **Layer 2 Minter Address:** `0x82c6D49F563D87F8D95bDd7350174d0314401B18`
- **Layer 2 RewardDispatcher Address:** `0xC4708854dB13492C9411C17B97DC41bB9370eCD5`

These configurations are typically defined in a separate configuration file, such as `hello.txt`.

## Key Functions

### `lockFor`

**Purpose:**  
Locks a specified amount of Metis tokens for a new sequencer, setting up the initial stake and enabling the sequencer's participation.

**Parameters:**
- `_sequencerSigner` (`address`): Address of the sequencer signer.
- `_amount` (`uint256`): Amount of Metis tokens to lock.
- `_signerPubKey` (`bytes`): Public key of the sequencer signer.

**Usage Example:**
```solidity
dealer.lockFor(
"0xFA35530a8B62bab8Eb0E92B5E7c4eD0F2Cea7f7F",
ethers.parseEther("20000"),
"0xf1e24546ea042780a62e262098153dc866095de200eb933f6bb53eb0c0cab3f5417798989deb7c552355835b9fcb00fe2ebcc777e3b427cf0355b75f67eeb247"
);
```


### `relock`

**Purpose:**  
Augments the locked Metis tokens and and invoking their relock functions.




**Usage Example:**
```solidity
dealer.relock();
```


### `unlock`

**Purpose:**  
Unlocks Metis tokens and terminates the associated sequencer. This effectively removes the sequencer's stake from the LockingPool.

**Usage Example:**
```solidity
dealer.unlock();
```


### `unlockClaim`

**Purpose:**  
Allows a sequencer to claim their unlocked Metis tokens after the mandatory waiting period has passed.

**Usage Example:**
```solidity
dealer.unlockClaim{value: msg.value}();
```


### `withdrawStakingAmount`

**Purpose:**  
Withdraws locked Metis tokens and deposits them into the redemptionQueue contract, facilitating the withdrawal process from Layer 2 to Layer 1.

**Parameters:**
- `amount` (`uint256`): Amount of Metis tokens to withdraw.

**Usage Example:**
```solidity
dealer.withdrawStakingAmount(amount);
```


## Events

The Dealer contract emits several events to signal state changes and actions, including:

- `SequencerAgentAdded`
- `SequencerRelocked`
- `L2MetisMinted`
- `SequencerAgentTemplateSet`
- `L2GasSet`
- `WithdrawRewardsSet`
- `StakingAmountWithdrawn`
- `SequencerInitialBalanceLocked`
- `SequencerTerminated`
- `RewardsWithdrawn`
- `IsSequencerRelocked`

These events can be monitored to track the contract's activities and state changes.
