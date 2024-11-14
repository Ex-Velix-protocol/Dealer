const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Dealer Contract Tests", function () {

  let dealer;
  let owner;
  let DealerFactory;

  const dealerAddress = "0x972C84B2d8a4678e4ee08DE19a027279847C6451";
  const metisAddress = "0x7f49160EB9BB068101d445fe77E17ecDb37D0B47";
  const lockingPoolAddress = "0x7591940125cC0344a65D60319d1ADcD463B2D4c3";
  const l1BridgeAddress = "0x9848dE505e6Aa301cEecfCf23A0a150140fc996e";
  const l2ChainId = 59902;
  const l2Gas = 1000000;
  const l2MinterAddress = "0x82c6D49F563D87F8D95bDd7350174d0314401B18";
  const l2RewardDispatcherAddress =
    "0xC4708854dB13492C9411C17B97DC41bB9370eCD5";
  const sequencerSignerAddress = "0xFA35530a8B62bab8Eb0E92B5E7c4eD0F2Cea7f7F";
  const amountToLock = ethers.parseEther("20000"); // 20000 METIS
  const signerPubKey =
    "0xf1e24546ea042780a62e262098153dc866095de200eb933f6bb53eb0c0cab3f5417798989deb7c552355835b9fcb00fe2ebcc777e3b427cf0355b75f67eeb247";

  beforeEach(async function () {
    // Initialization logic
    [owner] = await ethers.getSigners();
    DealerFactory = await ethers.getContractFactory("Dealer");
    try {
      dealer = DealerFactory.attach(dealerAddress);
    } catch (error) {
      console.error("Error attaching contracts:", error);
    }
  });


  describe("lockFor", function () {
    it("Should fail if Dealer has insufficient Metis balance", async function () {
      await expect(
        dealer
          .connect(owner)
          .lockFor(sequencerSignerAddress, amountToLock, signerPubKey)
      ).to.be.revertedWith("Dealer: Insufficient Metis balance");
    });

    it("Should successfully lock Metis tokens for a new sequencer", async function () {
      // Act
      await expect(
        dealer
          .connect(owner)
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
      await dealer.connect(owner).lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      
      // Act
      await expect(dealer.connect(owner).unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);
      
      // Assert
      expect(await dealer.active()).to.equal(false);
    });

    it("Should fail to unlock if not the owner", async function () {
      await expect(
        dealer.connect(user).unlock()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    });
  
  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      // Act
      await expect(dealer.connect(owner).unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);

      // Assert
      expect(await dealer.active()).to.equal(false);
    });

    it("Should fail to unlock if not the owner", async function () {
      await expect(dealer.connect(user).unlock()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("unlock", function () {
    it("Should successfully unlock Metis tokens and terminate the sequencer", async function () {
      // Arrange: Lock tokens first
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      // Act
      await expect(dealer.connect(owner).unlock())
        .to.emit(dealer, "SequencerTerminated")
        .withArgs(sequencerSignerAddress);

      // Assert
      expect(await dealer.active()).to.equal(false);
    });

    it("Should fail to unlock if not the owner", async function () {
      await expect(dealer.connect(user).unlock()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("unlockClaim", function () {
    it("Should successfully claim unlocked Metis tokens", async function () {
      // Arrange: Unlock first
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      await dealer.connect(owner).unlock();

      // Act
      await expect(dealer.connect(owner).unlockClaim()).to.not.be.reverted;
    });

    it("Should fail to claim if not the owner", async function () {
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);
      await dealer.connect(owner).unlock();

      await expect(dealer.connect(user).unlockClaim()).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });
  });

  describe("relock", function () {
    it("Should fail to relock if there are no active sequencers", async function () {
      await expect(dealer.connect(owner).active()).to.be.revertedWith(
        "Dealer: no active sequencer"
      );
    });

    it("Should successfully relock Metis tokens for active sequencers", async function () {
      // Arrange: Lock tokens first
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      // Act
      await expect(dealer.connect(owner).relock())
        .to.emit(dealer, "IsSequencerRelocked")
        .withArgs(true); 
    });
  });


  describe("withdrawStakingAmount", function () {
    it("Should successfully withdraw staking amount and deposit to redemptionQueue", async function () {
      // Arrange: Lock tokens first
      await dealer
        .connect(owner)
        .lockFor(sequencerSignerAddress, amountToLock, signerPubKey);

      const withdrawAmount = ethers.parseEther("5000"); // Example amount

      // Act
      await expect(dealer.connect(owner).withdrawStakingAmount(withdrawAmount))
        .to.emit(dealer, "StakingAmountWithdrawn")
        .withArgs(redemptionQueue, withdrawAmount);
    });

    it("Should fail to withdraw staking amount if not the owner", async function () {
      await expect(
        dealer.connect(user).withdrawStakingAmount(ethers.parseEther("1000"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

});
