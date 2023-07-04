// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./MyNFT.sol";

// https://gateway.pinata.cloud/ipfs/QmU9CFdakLD7oeQmjtXChfWU5ieWpLb6e9DZ4QNRgHtpxg save baseURI like this

contract Mintraribles {
    using Strings for uint256;
    mapping(string => uint8) existingURIs;
    mapping(uint256 => address) public holderOf;

    mapping(address => address) public artists;
    uint256 public royalityFee;
    uint256 public totalTx = 0;
    // uint256 public cost = 0.0001 ether;

    struct OnSale {
        address owner;
        uint price;
        address contractAddr;
        string metadata;
    }

    OnSale[] public onSale;

    event Sale(
        uint256 id,
        address indexed owner,
        uint256 cost,
        string metadataURI,
        uint256 timestamp
    );

    struct TransactionStruct {
        address owner;
        address newOwner;
        uint256 cost;
        string metadata;
        uint256 timestamp;
    }

    TransactionStruct[] transactions;
    TransactionStruct[] minted;

    mapping(address => address) public OwnerOfNft;
    mapping(address => uint) public prices;

    constructor() {
        royalityFee = 2;
    }

    address[] public nftContracts;

    function putOnSale(
        uint _price,
        address _contractAddr,
        string memory _metadata
    ) public {
        require(
            msg.sender == OwnerOfNft[_contractAddr],
            "You are not the owner"
        );
        prices[_contractAddr] = _price;

        onSale.push(OnSale(msg.sender, _price, _contractAddr, _metadata));
    }

    function removeFromSale(address _contractAddr) public {
        require(
            msg.sender == OwnerOfNft[_contractAddr],
            "You are not the owner"
        );
        for (uint i = 0; i < onSale.length; i++) {
            if (
                onSale[i].contractAddr == _contractAddr &&
                onSale[i].owner == msg.sender
            ) {
                delete onSale[i];
                prices[_contractAddr] = 0;
                break;
            }
        }
    }

    function getOnSale() public view returns (OnSale[] memory) {
        return onSale;
    }

    function createMint(
        string memory baseURI,
        string memory name,
        string memory shortN
    )
        public
        returns (
            // uint salesPrice
            address
        )
    {
        // require(msg.value >= cost, "Ether too low for minting!");
        MyNFT mynft = new MyNFT(baseURI, name, shortN, msg.sender);
        OwnerOfNft[address(mynft)] = msg.sender;
        // prices[address(mynft)] = salesPrice;
        artists[address(mynft)] = msg.sender;
        nftContracts.push(address(mynft));
        string memory metadataURI = mynft.tokenURI(1);
        minted.push(
            TransactionStruct(
                msg.sender,
                msg.sender,
                0,
                metadataURI,
                block.timestamp
            )
        );

        return address(mynft);

        // uint256 royality = (msg.value * royalityFee) / 100;
        // payTo(artist, royality);
        // payTo(owner(), (msg.value - royality));
    }

    function payToBuy(
        address contractAddr,
        uint amount,
        address ownerOfNFT
    ) public payable {
        require(
            msg.value >= prices[contractAddr],
            "Ether too low for purchase!"
        );
        require(msg.sender != OwnerOfNft[contractAddr], "You are the owner");

        uint256 royality = (msg.value * royalityFee) / 100;
        payTo(artists[contractAddr], royality);
        payTo(msg.sender, (msg.value - royality));

        totalTx++;
        string memory metadataURI = MyNFT(contractAddr).tokenURI(1);

        MyNFT(contractAddr).transferFrom(ownerOfNFT, msg.sender, 1);

        transactions.push(
            TransactionStruct(
                OwnerOfNft[contractAddr],
                msg.sender,
                amount,
                metadataURI,
                block.timestamp
            )
        );

        emit Sale(totalTx, msg.sender, msg.value, metadataURI, block.timestamp);

        OwnerOfNft[contractAddr] = msg.sender;

        for (uint i = 0; i < onSale.length; i++) {
            if (onSale[i].contractAddr == contractAddr) {
                delete onSale[i];
                prices[contractAddr] = 0;
                break;
            }
        }
    }

    function getPrice(address addr) public view returns (uint) {
        return prices[addr];
    }

    function changePrice(
        address nftContract,
        uint256 newPrice
    ) public returns (bool) {
        require(newPrice > 0 ether, "Ether too low!");
        require(
            msg.sender == OwnerOfNft[nftContract],
            "Operation Not Allowed!"
        );

        prices[nftContract] = newPrice;
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
