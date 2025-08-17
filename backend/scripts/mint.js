const hre = require("hardhat");

async function main() {
  const [minter] = await hre.ethers.getSigners();
  console.log("🚀 Minting NFT with account:", minter.address);

  const contractAddress = "0x10c77C57652d70295Ae4Fe75dd38E19E5838665f"; // ganti setelah deploy
  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = MyNFT.attach(contractAddress);

  const amount = 2; // jumlah NFT yang mau di-mint
  const tx = await nft.mint(amount, { value: hre.ethers.parseEther((0.001 * amount).toString()) });

  await tx.wait();
  console.log(`✅ Minted ${amount} NFT(s) to:`, minter.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
