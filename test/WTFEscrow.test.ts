import { expect } from "chai";
import { ethers } from "hardhat";

describe("WTFEscrow", function () {
  async function deployFixture() {
    const [owner, buyer, seller, other] = await ethers.getSigners();

    const Token = await ethers.getContractFactory("WTFToken");
    const token = await Token.deploy(1_000_000);

    const Escrow = await ethers.getContractFactory("WTFEscrow");
    const escrow = await Escrow.deploy(await token.getAddress());

    await token.transfer(buyer.address, 10_000);

    await token.connect(buyer).approve(
      await escrow.getAddress(),
      10_000
    );

    const block = await ethers.provider.getBlock("latest");
    const deadline = block!.timestamp + 3600;

    return {
      owner,
      buyer,
      seller,
      other,
      token,
      escrow,
      deadline
    };
  }

  it("creates an escrow", async function () {
    const { buyer, seller, escrow, deadline } = await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    const data = await escrow.escrows(0);

    expect(data.buyer).to.equal(buyer.address);
    expect(data.seller).to.equal(seller.address);
    expect(data.amount).to.equal(1_000);
  });

  it("locks buyer tokens", async function () {
    const { buyer, seller, escrow, token, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    expect(
      await token.balanceOf(await escrow.getAddress())
    ).to.equal(1_000);
  });

  it("allows buyer to release funds to seller", async function () {
    const { buyer, seller, escrow, token, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await escrow.connect(buyer).release(0);

    expect(await token.balanceOf(seller.address)).to.equal(1_000);
  });

  it("prevents non-buyer from releasing funds", async function () {
    const { buyer, seller, other, escrow, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await expect(
      escrow.connect(other).release(0)
    ).to.be.revertedWith("Only buyer");
  });

  it("allows buyer to refund after deadline", async function () {
    const { buyer, seller, escrow, token, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine", []);

    await escrow.connect(buyer).refund(0);

    expect(await token.balanceOf(buyer.address)).to.equal(10_000);
  });

  it("allows either party to raise a dispute", async function () {
    const { buyer, seller, escrow, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await escrow.connect(seller).raiseDispute(0);

    const data = await escrow.escrows(0);

    expect(data.status).to.equal(4);
  });

  it("allows the owner to resolve a dispute for the seller", async function () {
    const { owner, buyer, seller, escrow, token, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await escrow.connect(buyer).raiseDispute(0);

    await escrow.connect(owner).resolveDispute(0, true);

    expect(await token.balanceOf(seller.address)).to.equal(1_000);
  });

  it("allows the owner to resolve a dispute for the buyer", async function () {
    const { owner, buyer, seller, escrow, token, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await escrow.connect(buyer).raiseDispute(0);

    await escrow.connect(owner).resolveDispute(0, false);

    expect(await token.balanceOf(buyer.address)).to.equal(10_000);
  });

  it("prevents double settlement", async function () {
    const { buyer, seller, escrow, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await escrow.connect(buyer).release(0);

    await expect(
      escrow.connect(buyer).release(0)
    ).to.be.revertedWith("Invalid status");
  });

  it("prevents outsiders from raising disputes", async function () {
    const { buyer, seller, other, escrow, deadline } =
      await deployFixture();

    await escrow.connect(buyer).createEscrow(
      seller.address,
      1_000,
      deadline
    );

    await expect(
      escrow.connect(other).raiseDispute(0)
    ).to.be.revertedWith("Not a party");
  });
});