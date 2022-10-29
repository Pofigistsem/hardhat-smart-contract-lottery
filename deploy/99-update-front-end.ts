import { DeployFunction } from "hardhat-deploy/types";
import { ethers, network } from "hardhat";
import * as fs from "fs";
import {
  frontEndContractsFile,
  frontEndAbiFile,
} from "../helper-hardhat-config";

const updateFrontEnd: DeployFunction = async () => {
  if (process.env.UPDATE_FRONT_END) {
    console.log("Updating front end");
    updateContractAddresses();
    updateAbi();
  }
};

const updateContractAddresses = async () => {
  const raffle = await ethers.getContract("Raffle");
  const chainId = network.config.chainId?.toString();
  const currentAddresses = JSON.parse(
    fs.readFileSync(frontEndContractsFile, "utf8")
  );
  if (
    chainId! in currentAddresses &&
    !currentAddresses[chainId!].includes(raffle.address)
  ) {
    currentAddresses[chainId!].push(raffle.address);
  } else {
    currentAddresses[chainId!] = [raffle.address];
  }
  fs.writeFileSync(frontEndContractsFile, JSON.stringify(currentAddresses));
};

const updateAbi = async () => {
  const raffle = await ethers.getContract("Raffle");
  fs.writeFileSync(
    frontEndAbiFile,
    raffle.interface.format(ethers.utils.FormatTypes.json) as
      | string
      | NodeJS.ArrayBufferView
  );
};

export default updateFrontEnd;
updateFrontEnd.tags = ["all", "frontend"];
