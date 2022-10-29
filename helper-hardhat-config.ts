import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { PromiseOrValue } from "./typechain-types/common";
import "dotenv/config";

interface networkConfigItemInterface {
  name: string;
  ethUsdPriceFeed?: string;
  vrfCoordinatorV2?: string;
  entranceFee: BigNumber;
  gasLane: string;
  subscriptionId: string | PromiseOrValue<BigNumberish> | undefined;
  callBackGasLimit?: string;
  interval: string;
  blockConfirmations: number;
}

interface networkConfigInfoInterface {
  [id: number]: networkConfigItemInterface;
}

export const networkConfig: networkConfigInfoInterface = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D",
    entranceFee: ethers.utils.parseEther("0.01"),
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: process!.env!.SUBSCRIPTION_ID,
    callBackGasLimit: "500000", // 500 000
    interval: "30", // 30 seconds
    blockConfirmations: 6,
  },
  31337: {
    name: "hardhat",
    blockConfirmations: 1,
    gasLane:
      "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
    subscriptionId: "123123",
    callBackGasLimit: "500000",
    interval: "30",
    entranceFee: ethers.utils.parseEther("0.01"),
  },
};

export const developmentChains = ["hardhat", "localhost"];

export const frontEndContractsFile =
  "../nextjs-smart-contract-lottery/constants/contractAddresses.json";
export const frontEndAbiFile =
  "../nextjs-smart-contract-lottery/constants/abi.json";

export const DECIMALS = 8;
export const INITIAL_ANSWER = 200000000000;
