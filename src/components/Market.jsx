import React from "react";
import { useEffect, useState } from "react";
import { setGlobalState, useGlobalState } from "../store";
import Header from "./Header";
import Transactions from "./Transactions";
import Footer from "./Footer";
import ShowNFT from "./ShowNFT";
import Alert from "./Alert";
import Loading from "./Loading";
import UpdateNFT from "./UpdateNFT";
import { getOnSale, getOnSaleNftPreview } from "../Blockchain.services";

function Market() {
  const [nfts] = useGlobalState("nfts");
  const [onSale] = useGlobalState("onSale");

  const [end, setEnd] = useState(4);
  const [count] = useState(4);
  const [collection, setCollection] = useState([]);

  const getCollection = () => {
    // console.log(nfts[0]);
    return onSale;
  };

  const getNFTPreview = async () => {
    // await getOnSaleNftPreview();
  };

  useEffect(() => {
    setCollection(getCollection());
    getNFTPreview();
    // fetchNFT();
  }, [nfts, end]);
  return (
    <>
      <div>
        <div className="gradient-bg-hero">
          <Header />
        </div>
        <div className="bg-[#151c25] gradient-bg-artworks">
          <div className="w-4/5 py-10 mx-auto">
            <h4 className="text-white text-3xl font-bold uppercase text-gradient">
              {collection.length > 0 ? "Marketplace" : "No Artworks Yet"}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-4 lg:gap-3 py-2.5">
              {collection.map((nft, i) => (
                <Card key={i} nft={nft} />
              ))}
            </div>

            {collection.length > 0 && nfts.length > collection.length ? (
              <div className="text-center my-5">
                <button
                  className="shadow-xl shadow-black text-white
          bg-[#e32970] hover:bg-[#bd255f]
          rounded-full cursor-pointer p-2"
                  onClick={() => setEnd(end + count)}
                >
                  Load More
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <Footer />
      </div>
      <ShowNFT />
    </>
  );
}

const Card = ({ nft }) => {
  const [contract] = useGlobalState("contract");
  const [nfts] = useGlobalState("nfts");
  const setNFT = async () => {
    console.log("this is a log log log");
    console.log(contract, nfts);

    const temp = await contract.methods.getPrice(nft.token_address).call();
    const mintPrice = window.web3.utils.fromWei(temp, "ether");
    if (mintPrice === 0 || mintPrice === "0") {
      nft.price = -1;
    } else {
      nft.price = mintPrice;
    }

    console.log(mintPrice);
    setGlobalState("nft", nft);
    setGlobalState("showModal", "scale-100");
  };

  return (
    <>
      <div className="w-full shadow-xl shadow-black rounded-md overflow-hidden bg-gray-800 my-2 p-3">
        <img
          src={nft.image}
          alt={nft.metadata.title}
          className="h-60 w-full object-cover shadow-lg shadow-black rounded-lg mb-3"
        />
        <h4 className="text-white font-semibold">{nft.metadata.title}</h4>
        <p className="text-gray-400 text-xs my-1">{nft.metadata.description}</p>
        <div className="flex justify-between items-center mt-3 text-white">
          <button
            className="shadow-lg shadow-black text-white text-sm bg-[#e32970]
          hover:bg-[#bd255f] cursor-pointer rounded-full px-1.5 py-1"
            onClick={setNFT}
          >
            View Details
          </button>
        </div>
      </div>
      <ShowNFT />
      <UpdateNFT />
      <Loading />
      <Alert />
    </>
  );
};

export default Market;
