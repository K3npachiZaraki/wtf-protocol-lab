import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);

  /*
   * 1. Deploy WTFToken
   */
  const Token = await ethers.getContractFactory("WTFToken");

  const token = await Token.deploy(1_000_000);
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("WTFToken:", tokenAddress);

  /*
   * 2. Deploy EmployerStaking
   */
  const EmployerStaking =
    await ethers.getContractFactory("EmployerStaking");

  const employerStaking = await EmployerStaking.deploy(tokenAddress);
  await employerStaking.waitForDeployment();

  console.log(
    "EmployerStaking:",
    await employerStaking.getAddress()
  );

  /*
   * 3. Deploy ProjectTank
   *
   * For this lab we use WTFToken as the USDC-compatible
   * ERC20 test token.
   */
  const ProjectTank =
    await ethers.getContractFactory("ProjectTank");

  const projectTank = await ProjectTank.deploy(tokenAddress);
  await projectTank.waitForDeployment();

  console.log(
    "ProjectTank:",
    await projectTank.getAddress()
  );

  /*
   * 4. Deploy VestingWTF
   */
  const VestingWTF =
    await ethers.getContractFactory("VestingWTF");

  const vesting = await VestingWTF.deploy(tokenAddress);
  await vesting.waitForDeployment();

  console.log(
    "VestingWTF:",
    await vesting.getAddress()
  );

  /*
   * 5. Deploy WTFEscrow
   */
  const WTFEscrow =
    await ethers.getContractFactory("WTFEscrow");

  const escrow = await WTFEscrow.deploy(tokenAddress);
  await escrow.waitForDeployment();

  console.log(
    "WTFEscrow:",
    await escrow.getAddress()
  );

  /*
   * 6. Deploy WTFCounter
   */
  const WTFCounter =
    await ethers.getContractFactory("WTFCounter");

  const counter = await WTFCounter.deploy();
  await counter.waitForDeployment();

  console.log(
    "WTFCounter:",
    await counter.getAddress()
  );

  console.log("\nDeployment complete.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});