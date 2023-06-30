// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MyNFT is ERC721 {
    using Strings for uint256;

    string public _baseTokenURI;

    uint256 public maxTokenIds = 1;

    uint256 public tokenIds;

    uint public price;

    constructor(
        string memory baseURI,
        string memory tokenName,
        string memory short,
        address addr
    ) ERC721(tokenName, short) {
        _baseTokenURI = baseURI;
        mint(addr);
    }

    function mint(address addr) internal {
        require(tokenIds <= maxTokenIds, "Exceed maximum token supply");
        // require(msg.value >= _price, "Ether sent is not correct");
        tokenIds += 1;
        _safeMint(addr, tokenIds);
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
