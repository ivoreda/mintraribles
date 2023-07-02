import { Link } from "react-router-dom";
import mintrariblesLogo from "../assets/logo-raribles.png";

const Footer = () => (
  <div className="w-full flex md:justify-center justify-between items-center flex-col p-4 gradient-bg-footer">
    <div className="w-full flex sm:flex-row flex-col justify-between items-center my-4">
      <div className="flex flex-[0.25] justify-center items-center">
        <Link to="/">
          <img
            className="w-12 cursor-pointer"
            src={mintrariblesLogo}
            alt="mraribles-logo"
          />
        </Link>
      </div>

      <div className="flex flex-1 justify-evenly items-center flex-wrap sm:mt-0 mt-5 w-full">
        {/* <p className="text-white text-base text-center mx-2 cursor-pointer">
          Market
        </p> */}
        {/* <Link
          to="/market"
          className="text-white text-base text-center mx-2 cursor-pointer"
        >
          Market
        </Link> */}
        {/* <p className="text-white text-base text-center mx-2 cursor-pointer">
          Artist
        </p>
        <p className="text-white text-base text-center mx-2 cursor-pointer">
          Features
        </p>
        <p className="text-white text-base text-center mx-2 cursor-pointer">
          Community
        </p> */}
      </div>

      <div className="flex flex-[0.25] justify-center items-center">
        <p className="text-white text-right text-xs">
          &copy;2023 All rights reserved
        </p>
      </div>
    </div>
  </div>
);

export default Footer;
