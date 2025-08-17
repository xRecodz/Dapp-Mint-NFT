import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import abi from "./abi.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function MintPage({ account, refreshSupply }) {
  const [mintAmount, setMintAmount] = useState(1);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!account) {
      setStatus(""); // reset status kalau disconnect
      setMintAmount(1);
    }
  }, [account]);

  async function handleMint() {
    try {
      if (!window.ethereum) return alert("⚠️ Please install MetaMask!");
      if (!account) return alert("⚠️ Please connect wallet first!");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi.abi, signer);

      // Ambil harga per NFT dari kontrak
      const price = await contract.MINT_PRICE();
      const totalCost = price * BigInt(mintAmount);

      setStatus("⏳ Transaction pending...");

      // Eksekusi mint
      const tx = await contract.mint(mintAmount, { value: totalCost });
      await tx.wait();

      setStatus(`✅ Mint success! TX Hash: ${tx.hash}`);

      // 🔥 Update supply info di navbar
      if (refreshSupply) {
        await refreshSupply();
      }
    } catch (error) {
      console.error("Mint error:", error);
      // Tangani error lebih jelas
      if (error?.info?.error?.message) {
        setStatus(`❌ Error: ${error.info.error.message}`);
      } else if (error.message) {
        setStatus(`❌ Error: ${error.message}`);
      } else {
        setStatus("❌ Error: Unknown error");
      }
    }
  }

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center">
      <h2 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        🔥 Mint Your NFT
      </h2>

      {/* NFT Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12 justify-items-center">
        {[1, 2, 3].map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: id * 0.2 }}
            viewport={{ once: true }}
            className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:scale-105 transition border border-gray-700 w-80"
          >
            <img
              src="/1.jpg"
              alt={`NFT Preview #${id}`}
              className="w-full h-60 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">MyNFT #{id}</h3>
              <p className="text-gray-400 text-sm">Unique digital collectible</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mint Controls */}
      <div className="flex items-center gap-4 mb-6">
        <input
          type="number"
          min="1"
          value={mintAmount}
          onChange={(e) => setMintAmount(Math.max(1, parseInt(e.target.value)))}
          className="w-20 text-center p-2 rounded-lg text-black"
          disabled={!account}
        />
        <button
          onClick={handleMint}
          disabled={!account}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition disabled:opacity-50"
        >
          {account ? "Mint Now" : "Connect Wallet First"}
        </button>
      </div>

      {status && (
        <p className="mt-2 text-sm px-3 py-2 bg-gray-800 rounded-lg border border-gray-700 text-gray-300">
          {status}
        </p>
      )}
    </div>
  );
}
