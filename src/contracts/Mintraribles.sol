// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MyNFT.sol";

// https://gateway.pinata.cloud/ipfs/QmU9CFdakLD7oeQmjtXChfWU5ieWpLb6e9DZ4QNRgHtpxg save baseURI like this

contract Mintraribles {
    using Strings for uint256;
    mapping(string => uint8) existingURIs;
    mapping(uint256 => address) public holderOf;

    address public artist;
    uint256 public royalityFee;
    uint256 public totalTx = 0;
    uint256 public cost = 0.0001 ether;

    event Sale(
        uint256 id,
        address indexed owner,
        uint256 cost,
        string metadataURI,
        uint256 timestamp
    );

    struct TransactionStruct {
        address owner;
        uint256 cost;
        string title;
        string metadataURI;
        uint256 timestamp;
    }

    TransactionStruct[] transactions;
    TransactionStruct[] minted;

    mapping(address => address) public OwnerOfNft;

    constructor() {
        royalityFee = 2;
        artist = 0x78B15fe96C6eB2fF289AdD959783430076740CA0;
    }

    function createMint(
        string memory baseURI,
        string memory name,
        string memory shortN,
        uint salesPrice
    ) public payable {
        require(msg.value >= cost, "Ether too low for minting!");
        MyNFT mynft = new MyNFT(baseURI, name, shortN);
        OwnerOfNft[address(mynft)] = msg.sender;

        minted.push(
            TransactionStruct(
                msg.sender,
                salesPrice,
                name,
                baseURI,
                block.timestamp
            )
        );

        // uint256 royality = (msg.value * royalityFee) / 100;
        // payTo(artist, royality);
        // payTo(owner(), (msg.value - royality));
    }

    // function payToMint(
    //     string memory title,
    //     string memory description,
    //     string memory metadataURI,
    //     uint256 salesPrice
    // ) public payable {
    //     require(msg.value >= cost, "Ether too low for minting!");
    //     require(existingURIs[metadataURI] == 0, "This NFT is already minted!");
    //     require(msg.sender != owner(), "Sales not allowed!");

    //     uint256 royality = (msg.value * royalityFee) / 100;
    // payTo(artist, royality);
    // payTo(owner(), (msg.value - royality));

    //     supply++;

    //     minted.push(
    //         TransactionStruct(
    //             supply,
    //             msg.sender,
    //             salesPrice,
    //             title,
    //             description,
    //             metadataURI,
    //             block.timestamp
    //         )
    //     );

    //     emit Sale(supply, msg.sender, msg.value, metadataURI, block.timestamp);

    //     _safeMint(msg.sender, supply);
    //     existingURIs[metadataURI] = 1;
    //     holderOf[supply] = msg.sender;
    // }

    // function payToBuy(uint256 id) external payable {
    //     require(
    //         msg.value >= minted[id - 1].cost,
    //         "Ether too low for purchase!"
    //     );
    //     require(msg.sender != minted[id - 1].owner, "Operation Not Allowed!");

    //     uint256 royality = (msg.value * royalityFee) / 100;
    //     payTo(artist, royality);
    //     payTo(minted[id - 1].owner, (msg.value - royality));

    //     totalTx++;

    //     transactions.push(
    //         TransactionStruct(
    //             totalTx,
    //             msg.sender,
    //             msg.value,
    //             minted[id - 1].title,
    //             minted[id - 1].description,
    //             minted[id - 1].metadataURI,
    //             block.timestamp
    //         )
    //     );

    //     emit Sale(
    //         totalTx,
    //         msg.sender,
    //         msg.value,
    //         minted[id - 1].metadataURI,
    //         block.timestamp
    //     );

    //     minted[id - 1].owner = msg.sender;
    // }

    function changePrice(uint256 id, uint256 newPrice) external returns (bool) {
        require(newPrice > 0 ether, "Ether too low!");
        require(msg.sender == minted[id - 1].owner, "Operation Not Allowed!");

        minted[id - 1].cost = newPrice;
        return true;
    }

    function payTo(address to, uint256 amount) internal {
        (bool success, ) = payable(to).call{value: amount}("");
        require(success);
    }

    function getAllNFTs() external view returns (TransactionStruct[] memory) {
        return minted;
    }

    function getNFT(
        uint256 id
    ) external view returns (TransactionStruct memory) {
        return minted[id - 1];
    }

    function getAllTransactions()
        external
        view
        returns (TransactionStruct[] memory)
    {
        return transactions;
    }
}
