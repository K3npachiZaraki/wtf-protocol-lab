import { expect } from "chai";
import { ethers } from "hardhat";

describe("ProjectTank", function () {
  async function deployFixture() {
    const [owner, investor, investor2, investor3] =
      await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const usdc = await Token.deploy(1_000_000);

    const Tank = await ethers.getContractFactory("ProjectTank");
    const tank = await Tank.deploy(
      await usdc.getAddress()
    );

    await usdc.transfer(investor.address, 10_000);
    await usdc.transfer(investor2.address, 10_000);
    await usdc.transfer(investor3.address, 10_000);

    await usdc.connect(investor).approve(
      await tank.getAddress(),
      10_000
    );

    await usdc.connect(investor2).approve(
      await tank.getAddress(),
      10_000
    );

    await usdc.connect(investor3).approve(
      await tank.getAddress(),
      10_000
    );

    await usdc.approve(
      await tank.getAddress(),
      10_000
    );

    return {
      owner,
      investor,
      investor2,
      investor3,
      usdc,
      tank
    };
  }

  it("allows investors to fund a project", async function () {
    const { investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);

    expect(
      await tank.shares(investor.address)
    ).to.equal(1_000);
  });

  it("records total shares", async function () {
    const { investor, investor2, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(investor2).invest(500);

    expect(
      await tank.totalShares()
    ).to.equal(1_500);
  });

  it("allows an investor to invest multiple times", async function () {
    const { investor, tank } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(investor).invest(500);

    expect(
      await tank.shares(investor.address)
    ).to.equal(1_500);

    expect(
      await tank.totalShares()
    ).to.equal(1_500);
  });

  it("rejects zero investment", async function () {
    const { investor, tank } = await deployFixture();

    await expect(
      tank.connect(investor).invest(0)
    ).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("allows the owner to deposit dividends", async function () {
    const { owner, investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    expect(
      await tank.accDividendPerShare()
    ).to.be.gt(0);
  });

  it("allows the owner to make multiple dividend deposits", async function () {
    const { owner, investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    const first =
      await tank.accDividendPerShare();

    await tank.connect(owner).depositDividends(300);

    const second =
      await tank.accDividendPerShare();

    expect(second).to.be.gt(first);
  });

  it("allows investors to claim dividends", async function () {
    const { owner, investor, usdc, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    const before = await usdc.balanceOf(
      investor.address
    );

    await tank.connect(investor).claimDividends();

    const after = await usdc.balanceOf(
      investor.address
    );

    expect(after - before).to.equal(200);
  });

  it("distributes dividends between investors according to shares", async function () {
    const {
      owner,
      investor,
      investor2,
      usdc,
      tank
    } = await deployFixture();

    await tank.connect(investor).invest(1_000);
    await tank.connect(investor2).invest(500);

    await tank.connect(owner).depositDividends(300);

    const before1 = await usdc.balanceOf(
      investor.address
    );

    const before2 = await usdc.balanceOf(
      investor2.address
    );

    await tank.connect(investor).claimDividends();
    await tank.connect(investor2).claimDividends();

    const after1 = await usdc.balanceOf(
      investor.address
    );

    const after2 = await usdc.balanceOf(
      investor2.address
    );

    expect(after1 - before1).to.equal(200);
    expect(after2 - before2).to.equal(100);
  });

  it("does not give newly invested shares previously deposited dividends", async function () {
    const {
      owner,
      investor,
      investor2,
      usdc,
      tank
    } = await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    await tank.connect(investor2).invest(1_000);

    const before = await usdc.balanceOf(
      investor2.address
    );

    await expect(
      tank.connect(investor2).claimDividends()
    ).to.be.revertedWith("Nothing to claim");

    const after = await usdc.balanceOf(
      investor2.address
    );

    expect(after).to.equal(before);
  });

  it("allows an investor to claim dividends from multiple deposits", async function () {
    const { owner, investor, usdc, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    await tank.connect(investor).claimDividends();

    await tank.connect(owner).depositDividends(300);

    const before = await usdc.balanceOf(
      investor.address
    );

    await tank.connect(investor).claimDividends();

    const after = await usdc.balanceOf(
      investor.address
    );

    expect(after - before).to.equal(300);
  });

  it("prevents double claiming", async function () {
    const { owner, investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await tank.connect(owner).depositDividends(200);

    await tank.connect(investor).claimDividends();

    await expect(
      tank.connect(investor).claimDividends()
    ).to.be.revertedWith("Nothing to claim");
  });

  it("only allows the owner to deposit dividends", async function () {
    const { investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await expect(
      tank.connect(investor).depositDividends(100)
    ).to.be.reverted;
  });

  it("rejects a zero USDC address", async function () {
    const ProjectTank =
      await ethers.getContractFactory("ProjectTank");

    await expect(
      ProjectTank.deploy(ethers.ZeroAddress)
    ).to.be.revertedWith("Invalid USDC");
  });

  it("rejects dividend deposits when there are no investors", async function () {
    const { owner, tank } =
      await deployFixture();

    await expect(
      tank.connect(owner).depositDividends(1_000)
    ).to.be.revertedWith("No investors");
  });

  it("rejects zero dividend deposits", async function () {
    const { owner, investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await expect(
      tank.connect(owner).depositDividends(0)
    ).to.be.revertedWith(
      "Amount must be greater than zero"
    );
  });

  it("prevents an investor with no dividends from claiming", async function () {
    const { investor, tank } =
      await deployFixture();

    await tank.connect(investor).invest(1_000);

    await expect(
      tank.connect(investor).claimDividends()
    ).to.be.revertedWith("Nothing to claim");
  });
});