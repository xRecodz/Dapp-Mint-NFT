import { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "../abi.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function AdminDashboard({ account }) {
  const [isOwner, setIsOwner] = useState(false);
  const [publicMintOpen, setPublicMintOpen] = useState(false);
  const [whitelistMintOpen, setWhitelistMintOpen] = useState(false);

  const [maxSupply, setMaxSupply] = useState(0);
  const [totalMinted, setTotalMinted] = useState(0);

  const [whitelistAddress, setWhitelistAddress] = useState("");

  useEffect(() => {
    async function load() {
      if (!window.ethereum || !account) {
        // reset kalau disconnect
        setIsOwner(false);
        setPublicMintOpen(false);
        setWhitelistMintOpen(false);
        setMaxSupply(0);
        setTotalMinted(0);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);

      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());

      setPublicMintOpen(await contract.publicMintOpen());
      setWhitelistMintOpen(await contract.whitelistMintOpen());

      const max = await contract.MAX_SUPPLY();
      const minted = await contract.totalSupply();
      setMaxSupply(Number(max));
      setTotalMinted(Number(minted));
    }
    load();
  }, [account]);

  async function togglePublicMint() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.togglePublicMint();
    await tx.wait();
    setPublicMintOpen(await contract.publicMintOpen());
  }

  async function toggleWhitelistMint() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.toggleWhitelistMint();
    await tx.wait();
    setWhitelistMintOpen(await contract.whitelistMintOpen());
  }

  async function addWhitelist() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.addToWhitelist(whitelistAddress);
    await tx.wait();
    alert(`${whitelistAddress} ✅ added to whitelist`);
  }

  async function removeWhitelist() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.removeFromWhitelist(whitelistAddress);
    await tx.wait();
    alert(`${whitelistAddress} ❌ removed from whitelist`);
  }

  const remaining = maxSupply - totalMinted;

  return (
    <div className="w-full h-full flex flex-col justify-center items-center text-center">
      <h2 className="text-5xl font-extrabold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
        🛠 Admin Dashboard
      </h2>

      {!account ? (
        <p className="text-red-400 font-semibold">
          ⚠️ Please connect wallet first to access admin features
        </p>
      ) : !isOwner ? (
        <p className="text-red-400 font-bold">❌ Access Denied</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full max-w-6xl">
          {/* Left: Controls */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
            <p className="mb-2">
              <strong>Connected Wallet:</strong> {account}
            </p>
            <p className="mb-4">✅ You are the contract owner</p>
            <button
              onClick={togglePublicMint}
              className="w-full px-6 py-3 mb-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition"
            >
              {publicMintOpen ? "Disable Public Mint" : "Enable Public Mint"}
            </button>
            <button
              onClick={toggleWhitelistMint}
              className="w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl font-semibold hover:scale-105 transition"
            >
              {whitelistMintOpen ? "Disable Whitelist Mint" : "Enable Whitelist Mint"}
            </button>

            {/* Whitelist Manager */}
            <div className="mt-6 bg-gray-900 p-4 rounded-xl">
              <h4 className="text-lg font-bold mb-3">Whitelist Manager</h4>
              <input
                type="text"
                placeholder="0x"
                value={whitelistAddress}
                onChange={(e) => setWhitelistAddress(e.target.value)}
                className="w-full p-2 rounded-lg text-black mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={addWhitelist}
                  className="flex-1 px-4 py-2 bg-green-600 rounded-lg hover:scale-105 transition"
                >
                  Add
                </button>
                <button
                  onClick={removeWhitelist}
                  className="flex-1 px-4 py-2 bg-red-600 rounded-lg hover:scale-105 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-blue-400 to-purple-500">
              📊 NFT Collection Stats
            </h3>
            <p className="text-lg mb-2">
              Max Supply: <span className="font-bold">{maxSupply}</span>
            </p>
            <p className="text-lg mb-2">
              Minted: <span className="font-bold text-green-400">{totalMinted}</span>
            </p>
            <p className="text-lg">
              Remaining: <span className="font-bold text-yellow-400">{remaining}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
