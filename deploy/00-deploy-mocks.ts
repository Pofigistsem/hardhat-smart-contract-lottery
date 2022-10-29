import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 is the premium. Cost is 0.25 LINK per request.
const GAS_PRICE_LINK = 1e9; // link per gas. calculated value based on the gas price of the chain.

const deployMocks: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const networkName = network.name;
  const { deployments, getNamedAccounts } = hre;
  const { deploy, log } = deployments;
  const deployer = (await getNamedAccounts()).deployer;
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(networkName)) {
    log("Local network, deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args, // contract constructor args
    });
    log("Mocks deployed");
    log("-------------------------");
  }
};

export default deployMocks;

deployMocks.tags = ["all", "mocks"];
