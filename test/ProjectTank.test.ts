import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProjectTank", function () {
  async function deployFixture() {
    const [owner, investor, investor2] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const usdc = await Token.deploy(1_000_000);

    const Tank = await ethers.getContractFactory("ProjectTank");
    const tank = await Tank.deploy(await usdc.getAddress());

    await usdc.transfer(investor.address, 10_000);
    await usdc.transfer(investor2.address, 10_000);

    await usdc.connect(investor).approve(await tank.getAddress(), 10_000);
    await usdc.connect(investor2).approve(await tank.getAddress(), 10_000);

    await usdc.approve(await tank.getAddress(), 10_000);

    return { owner, investor, investor2, usdc, tank };
  }

  it("allows investors to fund a project", async function () {
    const { investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);

    expect(await tank.shares(investor.address)).to.equal(1_000);
  });

  it("records total shares", async function () {
    const { investor, investor2, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(investor2).invest(500);

    expect(await tank.totalShares()).to.equal(1_500);
  });

  it("rejects zero investment", async function () {
    const { investor, tank } = await deployFixture();

    await expect(
      tank.connect(investor).invest(0)
    ).to.be.revertedWith("Amount must be greater than zero");
  });

  it("allows the owner to deposit dividends", async function () {
    const { owner, investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(owner).depositDividends(200);

    expect(await tank.accDividendPerShare()).to.be.gt(0);
  });

  it("allows investors to claim dividends", async function () {
    const { owner, investor, usdc, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(owner).depositDividends(200);

    const before = await usdc.balanceOf(investor.address);

    await tank.connect(investor).claimDividends();

    const after = await usdc.balanceOf(investor.address);

    expect(after - before).to.equal(200);
  });

  it("prevents double claiming", async function () {
    const { owner, investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(owner).depositDividends(200);

    await tank.connect(investor).claimDividends();

    await expect(
      tank.connect(investor).claimDividends()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("only allows the owner to deposit dividends", async function () {
    const { investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);

    await expect(
      tank.connect(investor).depositDividends(100)
    ).to.be.reverted;
  });
});