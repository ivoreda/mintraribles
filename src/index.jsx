import React from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import App from "./App";
import Market from "./components/Market";
import ShowNFT from "./components/ShowNFT";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "market",
    element: <Market />,
    children: [
      {
        path: "market/nft-details",
        element: <ShowNFT />,
      },
    ],
  },
]);

ReactDOM.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
