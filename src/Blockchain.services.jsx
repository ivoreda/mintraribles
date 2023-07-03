import Web3 from "web3";
import { setGlobalState, getGlobalState, setAlert } from "./store";
import abi from "./abis/Mintraribles.json";
import Mintraribles from "./artifacts/contracts/Mintraribles.sol/Mintraribles.json";
import MyNFT from "./artifacts/contracts/MyNFT.sol/MyNFT.json";
import Moralis from "moralis";
import { EvmChain } from "@moralisweb3/common-evm-utils";

const { ethereum } = window;
window.web3 = new Web3(ethereum);
window.web3 = new Web3(window.web3.currentProvider);

const getEtheriumContract = async () => {
  const connectedAccount = getGlobalState("connectedAccount");

  if (connectedAccount) {
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    // const networkData = abi.networks[networkId];
    if (networkId) {
      const contract = new web3.eth.Contract(
        Mintraribles.abi,
        "0xeDeECA8e5AA3a56958288539e51eE607aF6Dd956"
      );
      // console.log("contract connected", networkData.address);
      console.log(contract);
      return contract;
    } else {
      return null;
    }
  } else {
    return getGlobalState("contract");
  }
};

const getNFTContract = async (address) => {
  const connectedAccount = getGlobalState("connectedAccount");

  if (connectedAccount) {
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    // const networkData = abi.networks[networkId];
    if (networkId) {
      const contract = new web3.eth.Contract(MyNFT.abi, address);
      // console.log("contract connected", networkData.address);
      console.log(contract);

      return contract;
    } else {
      return null;
    }
  }
};

const changePrice = async (contractAddr, price) => {
  const contract = await getEtheriumContract();
  const mintPrice = window.web3.utils.toWei(price, "ether");
  const connectedAccount = getGlobalState("connectedAccount");
  await contract.methods
    .changePrice(contractAddr, mintPrice)
    .send({ from: connectedAccount });
};

const connectWallet = async () => {
  try {
    if (!ethereum) return alert("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });
    setGlobalState("connectedAccount", accounts[0].toLowerCase());
    // fetchNFT(accounts[0]);
  } catch (error) {
    reportError(error);
  }
};

const putOnSale = async (price, _contractAddr, _metadata) => {
  const nftContract = await getNFTContract(_contractAddr);
  await nftContract.methods
    .approve("0xeDeECA8e5AA3a56958288539e51eE607aF6Dd956", 1)
    .send({ from: getGlobalState("connectedAccount") });

  const contract = await getEtheriumContract();
  const priceInWei = window.web3.utils.toWei(price, "ether");
  const connectedAccount = getGlobalState("connectedAccount");
  await contract.methods
    .putOnSale(priceInWei, _contractAddr, _metadata)
    .send({ from: connectedAccount });
};

const removeFromSale = async (_contractAddr) => {
  const contract = await getEtheriumContract();
  const connectedAccount = getGlobalState("connectedAccount");

  await contract.methods
    .removeFromSale(_contractAddr)
    .send({ from: connectedAccount });
};

const fetchNFT = async () => {
  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  try {
    await Moralis.start({
      apiKey:
        "JtnmcLL0pFYystpVYEGJSe7s6r7pFv7yQn5aQqnFdKZ1WFwuDH7dMmhqVAsZd0mh",
    });

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      chain: "0xaa36a7",
      format: "decimal",
      mediaItems: false,
      address: accounts[0],
    });

    // Moralis.stop();

    let nftsData = [];
    response.jsonResponse.result.forEach(async (nft) => {
      if (nft.metadata) {
        const metadata = JSON.parse(nft.metadata);
        nft.metadata = metadata;

        if (metadata.image) {
          const ipfsHash = metadata.image.replace("ipfs://", "");
          const ipfsUrl = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
          nftsData.push({
            metadata: nft.metadata,
            token_address: nft.token_address,
            image: ipfsUrl,
            owner: nft.owner_of,
          });
        }
      }
    });

    console.log("My Nfts", nftsData);
    const temp = await fetchPrices(nftsData);
    console.log("temp", temp);
    setGlobalState("nfts", nftsData);
  } catch (e) {
    console.error(e);
  }
};

const fetchPrices = async (nftsData) => {
  let TempnftsData = [];
  const contracts = await getEtheriumContract();
  nftsData.forEach(async (nftt) => {
    // console.log(nftt);
    const temp = await contracts.methods.getPrice(nftt.token_address).call();
    const mintPrice = window.web3.utils.fromWei(temp, "ether");

    TempnftsData.push({
      metadata: nftt.metadata,
      token_address: nftt.token_address,
      image: nftt.image,
      owner: nftt.owner_of,
      price: mintPrice,
    });
  });
  setGlobalState("nfts", TempnftsData);

  return TempnftsData;
};

const mintNFT = async (title, ShortName, metadataURI) => {
  try {
    // price = window.web3.utils.toWei(price.toString(), "ether");

    const contract = await getEtheriumContract();

    // console.log("my contract", contract);
    const connectedAccount = getGlobalState("connectedAccount");
    const mintPrice = window.web3.utils.toWei("0.0001", "ether");

    // const salePrice = window.web3.utils.toWei(price.toString(), "wei");

    console.log(metadataURI, title, ShortName);
    await contract.methods
      .createMint(metadataURI, title, ShortName)
      .send({ from: connectedAccount });
    // .send({ from: connectedAccount, value: mintPrice });  // removed for testing

    return true;
  } catch (error) {
    reportError(error);
  }
};

const isWallectConnected = async () => {
  try {
    if (!ethereum) return alert("Please install Metamask");
    const accounts = await ethereum.request({ method: "eth_requestAccounts" });

    window.ethereum.on("chainChanged", (chainId) => {
      window.location.reload();
    });

    window.ethereum.on("accountsChanged", async () => {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
      await isWallectConnected();
    });

    if (accounts.length) {
      setGlobalState("connectedAccount", accounts[0].toLowerCase());
      // fetchNFT(accounts[0]);
    } else {
      alert("Please connect wallet.");
      console.log("No accounts found.");
    }
    const contract = await getEtheriumContract();
    setGlobalState("contract", contract);
    console.log(contract);
  } catch (error) {
    reportError(error);
  }
};

const structuredNfts = (nfts) => {
  return nfts
    .map((nft) => ({
      id: Number(nft.id),
      owner: nft.owner.toLowerCase(),
      cost: window.web3.utils.fromWei(nft.cost),
      title: nft.title,
      description: nft.description,
      metadataURI: nft.metadataURI,
      timestamp: nft.timestamp,
    }))
    .reverse();
};

const getAllNFTs = async () => {
  try {
    if (!ethereum) return alert("Please install Metamask");

    const contract = await getEtheriumContract();
    const nfts = await contract.methods.getAllNFTs().call();
    const transactions = await contract.methods.getAllTransactions().call();

    setGlobalState("nfts", structuredNfts(nfts));
    setGlobalState("transactions", structuredNfts(transactions));
  } catch (error) {
    reportError(error);
  }
};

const getOnSale = async () => {
  const contract = await getEtheriumContract();
  const OnSale = await contract.methods.getOnSale().call();
  console.log("This is On Sale NFTs", OnSale);
  setGlobalState("onSale", OnSale);
  console.log(OnSale);

  return OnSale;
};

const getOnSaleNftPreview = async () => {
  console.log("called");

  const contract = await getEtheriumContract();

  const OnSales = await contract.methods.getOnSale().call();

  // console.log(OnSales);

  const nftsData = [];

  OnSales.forEach(async (OnSale) => {
    const address = OnSale.contractAddr;

    if (address !== "0x0000000000000000000000000000000000000000") {
      const chain = EvmChain.SEPOLIA;

      const tokenId = "1";

      const response = await Moralis.EvmApi.nft.getNFTMetadata({
        address,
        chain,
        tokenId,
      });

      if (response.jsonResponse.metadata) {
        const metadata = JSON.parse(response.jsonResponse.metadata);

        if (metadata.image) {
          const ipfsHash = metadata.image.replace("ipfs://", "");
          const ipfsUrl = `https://ipfs.moralis.io:2053/ipfs/${ipfsHash}`;
          nftsData.push({
            metadata: metadata,
            token_address: response.jsonResponse.token_address,
            image: ipfsUrl,
            owner: response.jsonResponse.owner_of,
          });
        }
      }
    }
  });

  console.log("here is OnSale Data", nftsData);
  setGlobalState("onSale", nftsData);
};

const getPriceOfNft = async (address) => {
  const contract = await getEtheriumContract();
  const price = await contract.methods.getPrice(address);
  console.log("price", price);
  return price;
};

const getContract = async () => {
  const contract = await getEtheriumContract();
  // const temp = await contract.getPrice(
  //   "0x8d4cf85d41539fb2967be200d486704ffdc1b8c9"
  // );
  // console.log(temp);
  console.log("contract called", contract);
  return contract;
};

const buyNFT = async (contractAddr, amount, ownerAddress) => {
  try {
    const cost = window.web3.utils.toWei(amount.toString(), "ether");
    // console.log(cost);
    const contract = await getEtheriumContract();
    const buyer = getGlobalState("connectedAccount");

    await contract.methods
      .payToBuy(contractAddr, cost, ownerAddress)
      .send({ from: buyer, value: cost });

    return true;
  } catch (error) {
    reportError(error);
  }
};

const updateNFT = async ({ id, cost }) => {
  try {
    cost = window.web3.utils.toWei(cost.toString(), "ether");
    const contract = await getEtheriumContract();
    const buyer = getGlobalState("connectedAccount");

    await contract.methods.changePrice(Number(id), cost).send({ from: buyer });
  } catch (error) {
    reportError(error);
  }
};

const reportError = (error) => {
  setAlert(JSON.stringify(error), "red");
  throw new Error("No ethereum object.");
};

export {
  getAllNFTs,
  connectWallet,
  mintNFT,
  getContract,
  buyNFT,
  updateNFT,
  isWallectConnected,
  getPriceOfNft,
  getEtheriumContract,
  fetchNFT,
  putOnSale,
  changePrice,
  removeFromSale,
  getOnSale,
  getOnSaleNftPreview,
  getNFTContract,
};
