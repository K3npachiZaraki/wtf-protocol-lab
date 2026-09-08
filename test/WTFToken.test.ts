import { expect } from "chai";
import { ethers } from "hardhat";

describe("WTFToken", function () {
  it("sets the correct name and symbol", async function () {
    const [deployer] = await ethers.getSigners();

    const WTFToken = await ethers.getContractFactory("WTFToken");
    const token = await WTFToken.deploy(1_000_000);

    expect(await token.name()).to.equal("WTF Token");
    expect(await token.symbol()).to.equal("WTF");
  });

  it("assigns the initial supply to the deployer", async function () {
    const [deployer] = await ethers.getSigners();

    const WTFToken = await ethers.getContractFactory("WTFToken");
    const token = await WTFToken.deploy(1_000_000);

    expect(await token.balanceOf(deployer.address)).to.equal(1_000_000);
  });

  it("has the correct total supply", async function () {
    const WTFToken = await ethers.getContractFactory("WTFToken");
    const token = await WTFToken.deploy(1_000_000);

    expect(await token.totalSupply()).to.equal(1_000_000);
  });

  it("allows token transfers", async function () {
    const [deployer, user] = await ethers.getSigners();

    const WTFToken = await ethers.getContractFactory("WTFToken");
    const token = await WTFToken.deploy(1_000_000);

    await token.transfer(user.address, 100);

    expect(await token.balanceOf(user.address)).to.equal(100);
    expect(await token.balanceOf(deployer.address)).to.equal(999_900);
  });
});