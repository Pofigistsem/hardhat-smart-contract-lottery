import { developmentChains } from "../../helper-hardhat-config";
import { getNamedAccounts, network, ethers } from "hardhat";
import { Raffle } from "../../typechain-types";
import { assert, expect } from "chai";
import { BigNumber } from "ethers";

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Raffle", function () {
      let raffle: Raffle, raffleEntranceFee: BigNumber, deployer: string;

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer;
        // no deploy fixtures since we run our deploy script to deploy our contract
        raffle = await ethers.getContract("Raffle", deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe("fulfillRandomWords", function () {
        it("works with live Chainlink Keepers and Chainlink VRF, we get a random winner", async function () {
          //enter the raffle
          const startingTimeStamp = await raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();
          console.log("setting up the listener");
          await new Promise<void>(async (resolve, reject) => {
            raffle.once("WinnerPicked", async () => {
              console.log("WinnerPicked event fired");
              try {
                // add asserts here
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted; // since our WinnerPicked event is fired after our players array is reset.
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString()
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (e) {
                reject(e);
              }
            });
            console.log("entering raffle");
            const tx = await raffle.enterRaffle({ value: raffleEntranceFee });
            await tx.wait(1);
            const winnerStartingBalance = await accounts[0].getBalance();
            // and this code wont complete until our listener has finished listening
          });

          // setup the listener before we enter the raffle
          // Just in case the blockchain moves very fast
        });
      });
    });
