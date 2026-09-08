import { expect } from "chai";
import { ethers } from "hardhat";

describe("VestingWTF", function () {
  async function deployFixture() {
    const [owner, beneficiary, beneficiary2, other] =
      await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const token = await Token.deploy(1_000_000);

    const Vesting = await ethers.getContractFactory("VestingWTF");
    const vesting = await Vesting.deploy(
      await token.getAddress()
    );

    await token.approve(
      await vesting.getAddress(),
      100_000
    );

    const block = await ethers.provider.getBlock("latest");
    const start = block!.timestamp;

    return {
      owner,
      beneficiary,
      beneficiary2,
      other,
      token,
      vesting,
      start
    };
  }

  it("creates a grant for the beneficiary", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    const grant = await vesting.grants(
      beneficiary.address
    );

    expect(grant.totalAmount).to.equal(10_000);
    expect(grant.start).to.equal(start);
    expect(grant.cliffDuration).to.equal(100);
    expect(grant.vestingDuration).to.equal(1_000);
    expect(grant.claimed).to.equal(0);
  });

  it("does not allow claiming before the cliff", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    await expect(
      vesting.connect(beneficiary).claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("allows claiming after the cliff", async function () {
    const { beneficiary, vesting, token, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    await ethers.provider.send("evm_increaseTime", [200]);
    await ethers.provider.send("evm_mine", []);

    const before = await token.balanceOf(
      beneficiary.address
    );

    await vesting.connect(beneficiary).claim();

    const after = await token.balanceOf(
      beneficiary.address
    );

    expect(after).to.be.gt(before);
  });

  it("prevents a non-owner from creating a grant", async function () {
    const { beneficiary, other, vesting, start } =
      await deployFixture();

    await expect(
      vesting.connect(other).createGrant(
        beneficiary.address,
        10_000,
        start,
        100,
        1_000
      )
    ).to.be.reverted;
  });

  it("rejects an invalid beneficiary", async function () {
    const { vesting, start } = await deployFixture();

    await expect(
      vesting.createGrant(
        ethers.ZeroAddress,
        10_000,
        start,
        100,
        1_000
      )
    ).to.be.revertedWith("Invalid beneficiary");
  });

  it("rejects zero grant amount", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await expect(
      vesting.createGrant(
        beneficiary.address,
        0,
        start,
        100,
        1_000
      )
    ).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("rejects an invalid vesting duration", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await expect(
      vesting.createGrant(
        beneficiary.address,
        10_000,
        start,
        100,
        0
      )
    ).to.be.revertedWith("Invalid vesting duration");
  });

  it("rejects a cliff longer than the vesting duration", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await expect(
      vesting.createGrant(
        beneficiary.address,
        10_000,
        start,
        1_001,
        1_000
      )
    ).to.be.revertedWith("Invalid cliff");
  });

  it("prevents claiming when nothing is vested", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      1_000,
      2_000
    );

    await expect(
      vesting.connect(beneficiary).claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("returns the full amount after vesting completes", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    await ethers.provider.send("evm_increaseTime", [1_100]);
    await ethers.provider.send("evm_mine", []);

    expect(
      await vesting.vestedAmount(beneficiary.address)
    ).to.equal(10_000);
  });

  it("returns a proportional amount during vesting", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    await ethers.provider.send("evm_increaseTime", [500]);
    await ethers.provider.send("evm_mine", []);

    const vested = await vesting.vestedAmount(
      beneficiary.address
    );

    expect(vested).to.be.gt(0);
    expect(vested).to.be.lt(10_000);
  });

  it("prevents claiming the same vested tokens twice", async function () {
    const { beneficiary, vesting, start } =
      await deployFixture();

    await vesting.createGrant(
      beneficiary.address,
      10_000,
      start,
      100,
      1_000
    );

    await ethers.provider.send("evm_increaseTime", [1_100]);
    await ethers.provider.send("evm_mine", []);

    await vesting.connect(beneficiary).claim();

    await expect(
      vesting.connect(beneficiary).claim()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("rejects a zero token address", async function () {
    const Vesting =
      await ethers.getContractFactory("VestingWTF");

    await expect(
      Vesting.deploy(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid token");
  });
});