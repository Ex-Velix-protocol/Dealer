const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dealer Contract Tests", function () {

  let dealer;
  let deployer;
  let DealerFactory;

  const dealerAddress = "0x972C84B2d8a4678e4ee08DE19a027279847C6451";
  const sequencerSignerAddress = "0xFA35530a8B62bab8Eb0E92B5E7c4eD0F2Cea7f7F";
  const amountToLock = ethers.parseEther("20000"); // 20000 METIS
  const signerPubKey =
    "0xf1e24546ea042780a62e262098153dc866095de200eb933f6bb53eb0c0cab3f5417798989deb7c552355835b9fcb00fe2ebcc777e3b427cf0355b75f67eeb247";

  beforeEach(async function () {
    [deployer] = await ethers.getSigners();
    DealerFactory = await ethers.getContractAt("Dealer", dealerAddress, deployer);
      dealer = DealerFactory.connect(deployer);
  });


  describe("lockFor", function () {
    it("Should fail if Dealer has insufficient Metis balance", async function () {
      await expect(
        dealer
          .lockFor(sequencerSignerAddress, amountToLock, signerPubKey)
      ).to.be.revertedWith("Dealer: Insufficient Metis balance");
    });

    it("Should successfully lock Metis tokens for a new sequencer", async function () {
      // Act
      await expect(
        dealer
          .lockFor(sequencerSignerAddress, amountToLock, signerPubKey)
      )
        .to.emit(dealer, "SequencerInitialBalanceLocked")
        .withArgs(sequencerSignerAddress, amountToLock, true);

      // Assert
      expect(await dealer.sequencerSigner()).to.equal(sequencerSignerAddress);
      expect(await dealer.active()).to.equal(true);
    });
  });

  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      await dealer.lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      
      // Act
      await expect(dealer.unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);
      
      // Assert
      expect(await dealer.active()).to.equal(false);
    });

  });
  
  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      const lockTx = await dealer
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      await lockTx.wait(1);

      // Act
      await expect(dealer.unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);

      // Assert
      expect(await dealer.active()).to.equal(false);
    });

    it("Should fail to unlock if not the deployer", async function () {
      await expect(dealer.connect(user).unlock()).to.be.revertedWith(
        "Ownable: caller is not the deployer"
      );
    });
  });

  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      await dealer
        .connect(deployer)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      // Act
      await expect(dealer.connect(deployer).unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);

      // Assert
      expect(await dealer.active()).to.equal(false);
    });

    it("Should fail to unlock if not the deployer", async function () {
      await expect(dealer.connect(user).unlock()).to.be.revertedWith(
        "Ownable: caller is not the deployer"
      );
    });
  });

  describe("unlockClaim", function () {
    it("Should successfully claim unlocked Metis tokens", async function () {
      // Arrange: Unlock first
      await dealer
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      await dealer.connect(deployer).unlock();

      // Act
      await expect(dealer.unlockClaim()).to.not.be.reverted;
    });

    it("Should fail to claim if not the deployer", async function () {
      await dealer
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      await dealer.unlock();

      await expect(dealer.connect(user).unlockClaim()).to.be.revertedWith(
        "Ownable: caller is not the deployer"
      );
    });
  });

  describe("relock", function () {
    it("Should successfully relock Metis tokens for active sequencers", async function () {
      const dealerUser = DealerFactory.connect(deployer);
      console.log("Dealer user: ", dealerUser);
      expect(await dealerUser.active()).to.equal(true);
      // Act
      const depositTx = await dealerUser.relock();
      // await depositTx.wait(1);
      console.log("Deposit tx: ",await depositTx);
    });
  });


  describe("withdrawStakingAmount", function () {
    it("Should successfully withdraw staking amount and deposit to redemptionQueue", async function () {
      const withdrawAmount = ethers.parseEther("0.1"); 
      // Act
      await expect(dealer.withdrawStakingAmount(withdrawAmount))
        .to.emit(dealer, "StakingAmountWithdrawn")
        .withArgs(redemptionQueue, withdrawAmount);
    });

    it("Should fail to withdraw staking amount if not the deployer", async function () {
      await expect(
        dealer.withdrawStakingAmount(ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the deployer");
    });
  });

});
