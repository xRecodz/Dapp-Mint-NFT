import pinataSDK from "@pinata/sdk";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pinata = new pinataSDK({ pinataJWTKey: process.env.PINATA_JWT });

async function main() {
  const imagePath = path.join("metadata", "1.png");
  const metadataPath = path.join("metadata", "1.json");

  // Upload image ke IPFS
  const imageStream = fs.createReadStream(imagePath);
  const imageResult = await pinata.pinFileToIPFS(imageStream, {
    pinataMetadata: { name: "MyNFT-Image-1" },
  });
  console.log("📷 Image CID:", imageResult.IpfsHash);

  // Update metadata.json dengan CID gambar
  let metadata = JSON.parse(fs.readFileSync(metadataPath));
  metadata.image = `ipfs://${imageResult.IpfsHash}`;
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Upload metadata JSON ke IPFS
  const metadataStream = fs.createReadStream(metadataPath);
  const metadataResult = await pinata.pinFileToIPFS(metadataStream, {
    pinataMetadata: { name: "MyNFT-Metadata-1" },
  });
  console.log("📄 Metadata CID:", metadataResult.IpfsHash);

  console.log(`✅ TokenURI: ipfs://${metadataResult.IpfsHash}`);
}

main().catch(console.error);
