// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    using Strings for uint256;

    string public _baseTokenURI;

    // max number of LW3Punks
    uint256 public maxTokenIds = 1;

    // total number of tokenIds minted
    uint256 public tokenIds;

    uint public price
    constructor(
        string memory baseURI,
        string memory tokenName,
        string memory short,
        uint _price
    ) ERC721(tokenName, short) {
        _baseTokenURI = baseURI;
        price = _price;
        mint();
    }

    function mint() public {
        require(tokenIds <= maxTokenIds, "Exceed maximum token supply");
        // require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(msg.sender, tokenIds);
    }

    function getPrice() public returns(uint) {
        return price;
    }
    
    function _baseURI() internal view virtual override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory baseURI = _baseURI();
        return baseURI;
    }
}
