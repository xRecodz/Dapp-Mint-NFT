const hre = require("hardhat");

async function main() {
  const contractAddress = "0xf7084Bf3dc9868e5f83AECc494a584B1FEb90539";            // ganti alamat kontrak kamu
  const baseURI = "ipfs://bafkreid7rlvlatgohkrc35zjdlopxunydf7omdhe3xwxlehaggjxzdlnfm/";    // ganti CID metadata kamu

  const myNFT = await hre.ethers.getContractAt("MyNFT", contractAddress);
  const tx = await myNFT.setBaseURI(baseURI);
  console.log("Setting baseURI...");
  await tx.wait();
  console.log("Done! baseURI set to:", baseURI);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
