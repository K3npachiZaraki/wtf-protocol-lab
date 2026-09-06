import { expect } from "chai";
import { ethers } from "hardhat";

describe("WTFCounter", function () {
  async function deployCounter() {
    const [owner, other] = await ethers.getSigners();
    const Counter = await ethers.getContractFactory("WTFCounter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();
    return { counter, owner, other };
  }

  it("sets the deployer as owner", async function () {
    const { counter, owner } = await deployCounter();
    expect(await counter.owner()).to.equal(owner.address);
  });

  it("starts at zero", async function () {
    const { counter } = await deployCounter();
    expect(await counter.count()).to.equal(0n);
  });

  it("increments the counter and emits an event", async function () {
    const { counter, other } = await deployCounter();

    await expect(counter.connect(other).increment())
      .to.emit(counter, "CountIncremented")
      .withArgs(other.address, 1n);

    expect(await counter.count()).to.equal(1n);
  });

  it("allows only the owner to reset", async function () {
    const { counter, owner } = await deployCounter();

    await counter.increment();
    await expect(counter.connect(owner).reset()).to.not.be.reverted;
    expect(await counter.count()).to.equal(0n);
  });

  it("rejects reset from a non-owner", async function () {
    const { counter, other } = await deployCounter();

    await counter.increment();
    await expect(counter.connect(other).reset())
      .to.be.revertedWith("Only owner can reset");

    expect(await counter.count()).to.equal(1n);
  });
});
