const { expect } = require("chai");
const { ethers } = require("hardhat");
const {abi} = require("../../artifacts/contracts/Dealer.sol/Dealer.json");
const Metis = require("../abis/Metis.json");


describe("Dealer Contract Tests", function () {
  let dealerContract;
  let metisContract;
  let user;

  const dealerAddress = networkConfig[network.name].dealerAddress;
  const metisAddress = networkConfig[network.name].metisAddress;
  const redemptionQueue = networkConfig[network.name].redemptionQueue;
  const sequencerSignerAddress =
    networkConfig[network.name].sequencerSignerAddress;
  const amountToLock = networkConfig[network.name].amountToLock;
  const signerPubKey = networkConfig[network.name].signerPubKey;
  const amountToRelock = ethers.parseEther("1");

  beforeEach(async function () {
    user = new ethers.Wallet(
      networkConfig[network.name].PrivateKey,
      new ethers.JsonRpcProvider(networkConfig[network.name].rpcUrl)
    );
    dealerContract = new ethers.Contract(dealerAddress, abi, user);
    metisContract = new ethers.Contract(metisAddress, Metis, user);
  });

  describe("lockFor", function () {
    it("Should fail if Dealer has insufficient Metis balance", async function () {
      await expect(
        dealerContract.lockFor(
          sequencerSignerAddress,
          amountToLock,
          signerPubKey
        )
      ).to.be.revertedWith("Dealer: Insufficient Metis balance");
    });

    it("Should successfully lock Metis tokens for a new sequencer", async function () {
      // Act
      await expect(
        dealerContract.lockFor(sequencerSignerAddress, amountToLock, signerPubKey)
      )
        .to.emit(dealerContract, "SequencerInitialBalanceLocked")
        .withArgs(sequencerSignerAddress, amountToLock, true);

      // Assert
      expect(await dealerContract.sequencerSigner()).to.equal(sequencerSignerAddress);
      expect(await dealerContract.active()).to.equal(true);
    });
  });
  
  describe("relock", function () {
    it("should revert if dealer balance is insufficient", async () => {
       const dealerBalance = await metisContract.balanceOf(dealerAddress);
      await expect(dealerContract.relock({value: dealerBalance}))
        .to.be.revertedWith("Dealer: insufficient balance");
    });

    it("Should successfully relock Metis tokens for active sequencers", async function () {
      expect(await dealerContract.active()).to.equal(true);
      // Act
      await expect(dealer.relock())
      .to.emit(dealerContract, "SequencerRelocked")
      .withArgs(sequencerId, dealerBalance);
    });
  });
  
  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      await dealerContract.lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      // Act
      await expect(dealerContract.unlock())
        .to.emit(dealerContract, "SequencerTerminated")
        .withArgs(17,false);

      // Assert
      expect(await dealerContract.active()).to.equal(false);
    });
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      const lockTx = await dealerContract.lockFor(
        sequencerSignerAddress,
        amountToLock,
        signerPubKey
      );
      await lockTx.wait(1);
  
      // Act
      await expect(dealerContract.unlock())
        .to.emit(dealerContract, "SequencerTerminated")
        .withArgs(17, false);
  
      // Assert
      expect(await dealerContract.active()).to.equal(false);
    });
  });


  describe("unlockClaim", function () {
    it("Should successfully claim unlocked Metis tokens", async function () {
      // Act
      await expect(dealerContract.unlockClaim()).to.not.be.reverted;
    });

    it("Should fail to claim if not the deployer", async function () {

      await expect(dealerContract.unlockClaim()).to.be.revertedWith(
        "Ownable: caller is not the deployer"
      );
    });
  });

  describe("withdrawStakingAmount", function () {
    it("Should successfully withdraw staking amount and deposit to redemptionQueue", async function () {
      const withdrawAmount = ethers.parseEther("0.1");
      // Act
      await expect(dealerContract.withdrawStakingAmount(withdrawAmount))
        .to.emit(dealerContract, "StakingAmountWithdrawn")
        .withArgs(redemptionQueue, withdrawAmount);
    });

    it("Should fail to withdraw staking amount if not the deployer", async function () {
      await expect(
        dealerContract.withdrawStakingAmount(ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the deployer");
    });
  });
});
