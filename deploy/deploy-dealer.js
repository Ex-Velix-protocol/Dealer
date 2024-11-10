const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const arguments = [
    "0x7f49160EB9BB068101d445fe77E17ecDb37D0B47",
    "0x7591940125cC0344a65D60319d1ADcD463B2D4c3",
    "0x9848dE505e6Aa301cEecfCf23A0a150140fc996e",
    59902,
    30000000,
    "0xaF5f00Eb9418fa24a28B8CbF568C259D3678201f",
    "0x77be5d0814164596d5558c6f4d3ef68a9af16366",
  ];

  const dealer = await deploy("Dealer", {
    from: deployer,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: arguments,
        },
      },
    },
    waitConfirmations: 1,
  });

  console.log("========Deploying Dealer========");
  console.log("Contract address: ", dealer.address);
  log("Verifying...");
    await run("verify:verify", {
      address: dealer.address,
      // address: "0xe61285459ec4fba022f70247c7fb0a28c84efd4d",
      constructorArguments: arguments,
    });
};

module.exports.tags = ["all", "dealer"];

// verifying Dealer_Implementation (0x3fe40C3903831Ca42A81cCCde8868da1e5823bef) ...
// waiting for result...
//  => contract Dealer_Implementation is now verified
// already verified: Dealer_Proxy (0x972C84B2d8a4678e4ee08DE19a027279847C6451), skipping.
// already verified: DefaultProxyAdmin (0xE1E77D21fD320FEA5519B0EFb1F37d24237A943a), skipping.
// already verified: SequencerAgent (0xc7961c5856c77431726698b266b7e4241451f07A), skipping.