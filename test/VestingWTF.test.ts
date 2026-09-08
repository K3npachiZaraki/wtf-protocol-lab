import { expect } from "chai";
import { ethers } from "hardhat";

describe("VestingWTF", function () {
  async function deployFixture() {
    const [owner, beneficiary, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const token = await Token.deploy(1_000_000);

    const Vesting = await ethers.getContractFactory("VestingWTF");
    const vesting = await Vesting.deploy(await token.getAddress());

    await token.approve(await vesting.getAddress(), 1_000_000);

    return { owner, beneficiary, other, token, vesting };
  }

  it("creates a grant for the beneficiary", async function () {
    const { beneficiary, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await vesting.createGrant(
      beneficiary.address,
      1_000,
      start,
      100,
      1_000
    );

    const grant = await vesting.grants(beneficiary.address);

    expect(grant.totalAmount).to.equal(1_000);
  });

  it("does not allow claiming before the cliff", async function () {
    const { beneficiary, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await vesting.createGrant(
      beneficiary.address,
      1_000,
      start,
      100,
      1_000
    );

    await expect(
      vesting.connect(beneficiary).claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("allows claiming after the cliff", async function () {
    const { beneficiary, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await vesting.createGrant(
      beneficiary.address,
      1_000,
      start,
      100,
      1_000
    );

    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    const before = await vesting.token().then(() => 0);

    await vesting.connect(beneficiary).claim();

    const balance = await vesting.token();

    expect(balance).to.not.equal(ethers.ZeroAddress);
  });

  it("prevents a non-owner from creating a grant", async function () {
    const { beneficiary, other, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await expect(
      vesting.connect(other).createGrant(
        beneficiary.address,
        1_000,
        start,
        100,
        1_000
      )
    ).to.be.reverted;
  });

  it("rejects an invalid beneficiary", async function () {
    const { vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await expect(
      vesting.createGrant(
        ethers.ZeroAddress,
        1_000,
        start,
        100,
        1_000
      )
    ).to.be.revertedWith("Invalid beneficiary");
  });

  it("rejects an invalid vesting duration", async function () {
    const { beneficiary, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await expect(
      vesting.createGrant(
        beneficiary.address,
        1_000,
        start,
        100,
        0
      )
    ).to.be.revertedWith("Invalid vesting duration");
  });

  it("rejects a cliff longer than the vesting duration", async function () {
    const { beneficiary, vesting } = await deployFixture();

    const latest = await ethers.provider.getBlock("latest");
    const start = latest!.timestamp;

    await expect(
      vesting.createGrant(
        beneficiary.address,
        1_000,
        start,
        2_000,
        1_000
      )
    ).to.be.revertedWith("Invalid cliff");
  });

  it("prevents claiming when nothing is vested", async function () {
    const { beneficiary, vesting } = await deployFixture();

    await expect(
      vesting.connect(beneficiary).claim()
    ).to.be.revertedWith("Nothing to claim");
  });
});