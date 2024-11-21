const { ethers } = require("hardhat")

const networkConfig = {
  sepolia: {
    name: "sepolia",
    PrivateKey:
      "",
    dealerAddress: "0x972C84B2d8a4678e4ee08DE19a027279847C6451",
    redemptionQueue: "0x6383b4CC63f2261B2bFB90Ebb2AE3587eC301218",
    sequencerSignerAddress: "0xFA35530a8B62bab8Eb0E92B5E7c4eD0F2Cea7f7F",
    amountToLock: ethers.parseEther("20100"), // 20000 METIS
    signerPubKey:"0xf1e24546ea042780a62e262098153dc866095de200eb933f6bb53eb0c0cab3f5417798989deb7c552355835b9fcb00fe2ebcc777e3b427cf0355b75f67eeb247",
    rpcUrl:"https://eth-sepolia.g.alchemy.com/v2/3jI6emkNhmGRZ86-E7RJtkIE4qLwqMzh",
  },
};

module.exports = {
    networkConfig
}