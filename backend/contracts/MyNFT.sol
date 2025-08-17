// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint256 public constant MINT_PRICE = 0.01 ether;
    uint256 public constant MAX_SUPPLY = 5000;

    // ✅ toggle state
    bool public publicMintOpen = false;
    bool public whitelistMintOpen = false;

    // ✅ whitelist mapping
    mapping(address => bool) public whitelist;

    constructor() ERC721("MyNFTCollection", "MNFT") Ownable(msg.sender) {}

    // ✅ toggle ON/OFF
    function togglePublicMint() external onlyOwner {
        publicMintOpen = !publicMintOpen;
    }

    function toggleWhitelistMint() external onlyOwner {
        whitelistMintOpen = !whitelistMintOpen;
    }

    // ✅ Whitelist Management
    function addToWhitelist(address _user) external onlyOwner {
        whitelist[_user] = true;
    }

    function removeFromWhitelist(address _user) external onlyOwner {
        whitelist[_user] = false;
    }

    // ✅ Mint function
    function mint(uint256 amount) external payable {
        require(publicMintOpen || whitelistMintOpen, "Mint is closed");
        require(amount > 0, "Mint at least 1 NFT");
        require(msg.value >= MINT_PRICE * amount, "Not enough ETH sent");
        require(_tokenIds + amount <= MAX_SUPPLY, "Exceeds max supply");

        if (whitelistMintOpen && !publicMintOpen) {
            require(whitelist[msg.sender], "Not whitelisted");
        }

        for (uint256 i = 0; i < amount; i++) {
            _tokenIds++;
            uint256 newItemId = _tokenIds;
            _mint(msg.sender, newItemId);

            _setTokenURI(
                newItemId,
                "ipfs://QmZqMYNRq5VnB5Ho83jSwjcAGd4kdXXQNSJ1YjxwVfMavJ"
            );
        }
    }

    // ✅ Supply info untuk frontend
    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    // ✅ Withdraw
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
