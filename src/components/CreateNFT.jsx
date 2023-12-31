import {
  useGlobalState,
  setGlobalState,
  setLoadingMsg,
  setAlert,
} from "../store";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { create } from "ipfs-http-client";
import { mintNFT } from "../Blockchain.services";
import axios from "axios";

const projectId = "2RXpd8Qi1snxmJ7Z9cXCIxE8C4x";
const projectSecret = "e7093aeffd5bc58d28a5ab7c30065a1d";

const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
    // "User-Agent": "Ivor"
  },
});

const CreateNFT = () => {
  const [modal] = useGlobalState("modal");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState(""); // saving file in this state
  const [imgBase64, setImgBase64] = useState(null);

  const [cid, setCid] = useState("");
  const [File, setFile] = useState();
  const pinataEndpoint = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const pinataApiKey = "433e5df9e4c015169ec7";
  const pinataSecretApiKey =
    "89bd7228892b534bdbe9261246493b516c8aa0e5bb2a27eb1aad20801afabd74";
  const pinataJWT =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJiZjE5YTFkMS01MDliLTQyYjQtODE0Ni03OWEyZDY1NDI5NTYiLCJlbWFpbCI6Iml2b3JlZGFmZWpAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjQzM2U1ZGY5ZTRjMDE1MTY5ZWM3Iiwic2NvcGVkS2V5U2VjcmV0IjoiODliZDcyMjg4OTJiNTM0YmRiZTkyNjEyNDY0OTNiNTE2YzhhYTBlNWJiMmEyN2ViMWFhZDIwODAxYWZhYmQ3NCIsImlhdCI6MTY4OTY4MzYyOX0.pYKUoc7o07HmVmJ9-1-r1__lmAe8BAiDrwAf3dU3fQY";

  async function uploadFileToPinata(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(pinataEndpoint, formData, {
        maxContentLength: Infinity,
        headers: {
          "Content-Type": "multipart/form-data",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
          Authorization: pinataJWT
        },
      });

      if (response.status === 200) {
        console.log("File uploaded successfully!");
        setCid(response.data.IpfsHash);

        console.log("IPFS hash:", response.data.IpfsHash);

        return response.data.IpfsHash;
      } else {
        console.log("File upload failed.");
        return null;
      }
    } catch (error) {
      console.error("An error occurred during file upload:", error.message);
      return null;
    }
  }

  async function pinJSONToIPFS(title, description, imagePath) {
    const json = {
      title: title,
      description: description,
      image: imagePath,
    };

    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      json,
      {
        headers: {
          "Content-Type": "application/json",
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      }
    );

    return response.data.IpfsHash;
  }

  const handleSubmit = async (e) => {
    console.log("I am called");
    e.preventDefault();

    if (!title || !description) return;

    setGlobalState("modal", "scale-0");
    setGlobalState("loading", { show: true, msg: "Uploading IPFS data..." });

    try {
      // const created = await client.add(fileUrl);

      const path = await uploadFileToPinata(File);

      const metadataURI = `ipfs://${path}`;

      const base = await pinJSONToIPFS(title, description, metadataURI);

      const baseURI = `https://gateway.pinata.cloud/ipfs/${base}`;

      console.log(baseURI);

      setLoadingMsg("Intializing transaction...");
      setFileUrl(baseURI);
      await mintNFT(title, "MTK", baseURI, price);
      resetForm();
      setAlert("Minting completed...", "green");
      window.location.reload();
    } catch (error) {
      console.log("Error uploading file: ", error);
      setAlert("Minting failed...", "red");
    }
  };
  const changeImage = async (e) => {
    // const reader = new FileReader();
    // if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);

    // reader.onload = (readerEvent) => {
    //   const file = readerEvent.target.result;
    //   setImgBase64(file);
    //   setFileUrl(e.target.files[0]);
    // };
    const file = e.target.files[0];
    setFile(file);
  };

  const closeModal = () => {
    setGlobalState("modal", "scale-0");
    resetForm();
  };

  const resetForm = () => {
    setFileUrl("");
    setImgBase64(null);
    setTitle("");
    setPrice("");
    setDescription("");
  };

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center
          justify-center bg-black bg-opacity-50 transform
          transition-transform duration-300 ${modal}`}
    >
      <div className="bg-[#151c25] shadow-xl shadow-[#e32970] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <form className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold text-gray-400">Add NFT</p>
            <button
              type="button"
              onClick={closeModal}
              className="border-0 bg-transparent focus:outline-none"
            >
              <FaTimes className="text-gray-400" />
            </button>
          </div>

          <div className="flex flex-row justify-center items-center rounded-xl mt-5">
            <div className="shrink-0 rounded-xl overflow-hidden h-20 w-20">
              <img
                alt="NFT"
                className="h-full w-full object-cover cursor-pointer"
                src={
                  imgBase64 ||
                  "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1361&q=80"
                }
              />
            </div>
          </div>

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <label className="block">
              <span className="sr-only">Choose profile photo</span>

              <input
                type="file"
                accept=".jpg,.jpeg,.png"
                className="block w-full text-sm text-slate-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#19212c] file:text-gray-400
                    hover:file:bg-[#1d2631]
                    cursor-pointer focus:ring-0 focus:outline-none"
                onChange={changeImage}
                required
              />
            </label>
          </div>

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                  text-slate-500 bg-transparent border-0
                  focus:outline-none focus:ring-0"
              type="text"
              name="title"
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              required
            />
          </div>

          {/* <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <input
              className="block w-full text-sm
                  text-slate-500 bg-transparent border-0
                  focus:outline-none focus:ring-0"
              type="number"
              step={0.01}
              min={0.01}
              name="price"
              placeholder="Price (ETH)"
              onChange={(e) => setPrice(e.target.value)}
              value={price}
              required
            />
          </div> */}

          <div className="flex flex-row justify-between items-center bg-gray-800 rounded-xl mt-5">
            <textarea
              className="block w-full text-sm resize-none
                  text-slate-500 bg-transparent border-0
                  focus:outline-none focus:ring-0 h-20"
              type="text"
              name="description"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              required
            ></textarea>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            className="flex flex-row justify-center items-center
                w-full text-white text-md bg-[#e32970]
                hover:bg-[#bd255f] py-2 px-5 rounded-full
                drop-shadow-xl border border-transparent
                hover:bg-transparent hover:text-[#e32970]
                hover:border hover:border-[#bd255f]
                focus:outline-none focus:ring mt-5"
          >
            Mint Now
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateNFT;
