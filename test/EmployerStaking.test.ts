import { expect } from "chai";
import { ethers } from "hardhat";

describe("EmployerStaking", function () {
  async function deployFixture() {
    const [employer, employer2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const token = await Token.deploy(1_000_000);

    const Staking = await ethers.getContractFactory("EmployerStaking");
    const staking = await Staking.deploy(
      await token.getAddress()
    );

    await token.transfer(employer.address, 10_000);
    await token.transfer(employer2.address, 10_000);

    await token.connect(employer).approve(
      await staking.getAddress(),
      10_000
    );

    await token.connect(employer2).approve(
      await staking.getAddress(),
      10_000
    );

    return {
      employer,
      employer2,
      token,
      staking
    };
  }

  it("allows an employer to stake WTF", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(1_000);

    expect(
      await staking.stakes(employer.address)
    ).to.equal(1_000);
  });

  it("moves staked tokens into the staking contract", async function () {
    const { employer, token, staking } =
      await deployFixture();

    await staking.connect(employer).stake(1_000);

    expect(
      await token.balanceOf(await staking.getAddress())
    ).to.equal(1_000);
  });

  it("allows an employer to withdraw their stake", async function () {
    const { employer, token, staking } =
      await deployFixture();

    const before = await token.balanceOf(
      employer.address
    );

    await staking.connect(employer).stake(1_000);

    await staking.connect(employer).withdraw(400);

    expect(
      await staking.stakes(employer.address)
    ).to.equal(600);

    const after = await token.balanceOf(
      employer.address
    );

    expect(after).to.equal(before - 600n);
  });

  it("does not allow withdrawal above the staked amount", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(1_000);

    await expect(
      staking.connect(employer).withdraw(1_001)
    ).to.be.revertedWith("Insufficient stake");
  });

  it("does not allow staking zero tokens", async function () {
    const { employer, staking } = await deployFixture();

    await expect(
      staking.connect(employer).stake(0)
    ).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("does not allow withdrawing zero tokens", async function () {
    const { employer, staking } = await deployFixture();

    await expect(
      staking.connect(employer).withdraw(0)
    ).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("keeps employer stakes separate", async function () {
    const { employer, employer2, staking } =
      await deployFixture();

    await staking.connect(employer).stake(1_000);
    await staking.connect(employer2).stake(500);

    expect(
      await staking.stakes(employer.address)
    ).to.equal(1_000);

    expect(
      await staking.stakes(employer2.address)
    ).to.equal(500);
  });

  it("rejects a zero token address", async function () {
    const Staking =
      await ethers.getContractFactory("EmployerStaking");

    await expect(
      Staking.deploy(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid token");
  });

  it("allows withdrawing the entire stake", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(1_000);

    await staking.connect(employer).withdraw(1_000);

    expect(
      await staking.stakes(employer.address)
    ).to.equal(0);
  });

  it("does not allow withdrawing after the stake is exhausted", async function () {
    const { employer, staking } = await deployFixture();

    await staking.connect(employer).stake(1_000);

    await staking.connect(employer).withdraw(1_000);

    await expect(
      staking.connect(employer).withdraw(1)
    ).to.be.revertedWith("Insufficient stake");
  });
});