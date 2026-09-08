import { expect } from "chai";
import { ethers } from "hardhat";

describe("EmployerStaking", function () {
  async function deployFixture() {
    const [owner, employer, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const token = await Token.deploy(1_000_000);

    const Staking = await ethers.getContractFactory("EmployerStaking");
    const staking = await Staking.deploy(await token.getAddress());

    await token.transfer(employer.address, 1_000);

    await token
      .connect(employer)
      .approve(await staking.getAddress(), 1_000);

    return { owner, employer, other, token, staking };
  }

  it("allows an employer to stake WTF", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(500);

    expect(await staking.stakes(employer.address)).to.equal(500);
  });

  it("moves staked tokens into the staking contract", async function () {
    const { employer, staking, token } = await deployFixture();

    await staking.connect(employer).stake(500);

    expect(await token.balanceOf(await staking.getAddress())).to.equal(500);
  });

  it("allows an employer to withdraw their stake", async function () {
    const { employer, staking, token } = await deployFixture();

    await staking.connect(employer).stake(500);
    await staking.connect(employer).withdraw(200);

    expect(await staking.stakes(employer.address)).to.equal(300);
    expect(await token.balanceOf(employer.address)).to.equal(700);
  });

  it("does not allow withdrawal above the staked amount", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(500);

    await expect(
      staking.connect(employer).withdraw(501)
    ).to.be.revertedWith("Insufficient stake");
  });

  it("does not allow staking zero tokens", async function () {
    const { employer, staking } = await deployFixture();

    await expect(
      staking.connect(employer).stake(0)
    ).to.be.revertedWith("Amount must be greater than zero");
  });

  it("does not allow withdrawing zero tokens", async function () {
    const { employer, staking } = await deployFixture();

    await expect(
      staking.connect(employer).withdraw(0)
    ).to.be.revertedWith("Amount must be greater than zero");
  });

  it("keeps employer stakes separate", async function () {
    const { employer, other, staking, token } = await deployFixture();

    await token.transfer(other.address, 500);

    await token
      .connect(other)
      .approve(await staking.getAddress(), 500);

    await staking.connect(employer).stake(500);
    await staking.connect(other).stake(300);

    expect(await staking.stakes(employer.address)).to.equal(500);
    expect(await staking.stakes(other.address)).to.equal(300);
  });
});