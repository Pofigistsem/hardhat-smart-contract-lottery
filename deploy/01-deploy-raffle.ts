import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { ethers, getChainId, network } from "hardhat";
import verify from "../utils/verify";
import { VRFCoordinatorV2Mock } from "../typechain-types";
import { PromiseOrValue } from "../typechain-types/common";
import { BigNumberish, Contract } from "ethers";

const VRF_SUB_FUND_AMOUNT = ethers.utils.parseEther("2");

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  //const chainId = (await hre.getChainId()) as unknown as number;
  const chainId = (await getChainId()) as unknown as number;
  const networkName = network.name;
  const { getNamedAccounts, deployments } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  let VRFCoordinatorV2Address: string | undefined,
    subscriptionId: string | PromiseOrValue<BigNumberish> | undefined;
  let VRFCoordinatorV2Mock: Contract | VRFCoordinatorV2Mock | undefined;

  if (developmentChains.includes(networkName)) {
    VRFCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    VRFCoordinatorV2Address = VRFCoordinatorV2Mock!.address;
    const transactionResponse =
      await VRFCoordinatorV2Mock!.createSubscription();
    const transactionReceipt = await transactionResponse.wait(1);
    subscriptionId = transactionReceipt.events![0].args!.subId;
    await VRFCoordinatorV2Mock!.fundSubscription(
      subscriptionId,
      VRF_SUB_FUND_AMOUNT
    );
  } else {
    VRFCoordinatorV2Address = networkConfig[chainId!].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId!].subscriptionId;
  }

  const entranceFee = networkConfig[chainId!].entranceFee;
  const gasLane = networkConfig[chainId!].gasLane; // gasLane sets limit on how much to spend on each request to vrf. reason chainlink uses a Gas lane is because the lanes are important for setting the ceiling limit of each request... think of it as your entry into the bet.
  const callBackGasLimit = networkConfig[chainId!].callBackGasLimit;
  const interval = networkConfig[chainId!].interval;

  const args = [
    VRFCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionId,
    callBackGasLimit,
    interval,
  ];
  const raffle = await deploy("Raffle", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: networkConfig[chainId!].blockConfirmations,
  });
  const raffleAddress = raffle.address;

  if (
    typeof VRFCoordinatorV2Mock !== undefined &&
    developmentChains.includes(networkName)
  ) {
    await VRFCoordinatorV2Mock!.addConsumer(subscriptionId, raffleAddress);
  }

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying....");
    verify(raffle.address, args);
  }

  log("----------------------------------");
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
