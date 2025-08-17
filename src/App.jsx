import { useState, useEffect } from "react";
import MintPage from "./MintPage";
import AdminDashboard from "./components/AdminDashboard";
import { ethers } from "ethers";
import abi from "./abi.json";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

export default function App() {
  const [activeTab, setActiveTab] = useState("mint");
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Connect wallet
  async function connectWallet() {
  try {
    if (!window.ethereum) {
      alert("⚠️ Please install MetaMask!");
      return;
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const addr = accounts[0];
    setAccount(addr);

    // cek owner
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const owner = await contract.owner();
    setIsOwner(owner.toLowerCase() === addr.toLowerCase());
  } catch (error) {
    console.error("Wallet connection failed:", error);
    alert("❌ Failed to connect wallet: " + error.message);
  }
}

  // Disconnect wallet (simply clear state)
  function disconnectWallet() {
    setAccount(null);
    setIsOwner(false);
    setDropdownOpen(false);
    setActiveTab("mint"); // fallback ke halaman mint
  }

  // Auto check kalau metamask ganti account
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          connectWallet();
        }
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-black/70 backdrop-blur border-b border-gray-700">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            🚀 MyNFT Project
          </h1>
          <nav className="flex gap-6 items-center relative">
            <button
              onClick={() => setActiveTab("mint")}
              className={`hover:text-blue-400 transition ${
                activeTab === "mint" ? "text-blue-400 font-bold" : ""
              }`}
            >
              Mint NFT
            </button>

            {/* Hanya tampil kalau wallet connect dan dia owner */}
            {isOwner && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`hover:text-purple-400 transition ${
                  activeTab === "admin" ? "text-purple-400 font-bold" : ""
                }`}
              >
                Admin Dashboard
              </button>
            )}

            {/* Wallet connect / dropdown */}
            {account ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="px-4 py-2 bg-gray-800 rounded-xl text-sm border border-gray-600 hover:scale-105 transition"
                >
                  {account.slice(0, 6)}...{account.slice(-4)}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-lg z-50">
                    <a
                      href={`https://sepolia.etherscan.io/address/${account}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 text-sm hover:bg-gray-700 rounded-t-xl"
                    >
                      View on Sepolia Scan
                    </a>
                    <button
                      onClick={disconnectWallet}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded-b-xl"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl font-semibold hover:scale-105 transition"
              >
                Connect Wallet
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex justify-center items-center">
        <div className="w-[1900px] h-[900px] flex justify-center items-center">
          {activeTab === "mint" ? (
            <MintPage account={account} />
          ) : isOwner ? (
            <AdminDashboard account={account} />
          ) : (
            <p className="text-red-400 font-bold">⚠️ Access Denied</p>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-700">
        © 2025 MyNFT Project • Built with ❤️ on Web3
      </footer>
    </div>
  );
}
