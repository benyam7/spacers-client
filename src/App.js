import { ethers } from "ethers";
import * as React from "react";
import "./App.css";
import abi from "./utils/JoinSpace.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState();
  const contractAddress = "0x3B1D54a40068d50c11024852c9108509C18f7C0a";
  const contractABI = abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("we got eth obj", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" }); // see if we can access the accounts (this returns an array)

      if (accounts.length) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("first account", account);
      } else {
        console.log("we couldnt find any account");
      }
    } catch (error) {
      console.log("error");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get metamask :)");
      }
      // we goin to intiate connection request
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      if (accounts.length) {
        setCurrentAccount(accounts[0]);
        console.log("Connected", currentAccount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const totalSpacers = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum); //ethers allows our frontend to talk to contract
        const signer = provider.getSigner();
        const joinSpaceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await joinSpaceContract.getTotalSpacers();
        console.log("Retrieved total spacers count", count.toNumber());
      } else {
        console.log("Eth obj doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const joinSpace = () => {};

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Hey Spacer! 🌌 🚀 ☄️</div>

        <div className="bio">
          I am Benyam,connect your Ethereum wallet and join the space to win
          some cool NFT or ETH token!
        </div>

        <button className="joinSpaceButton" onClick={totalSpacers}>
          Become a Spacer! 🚀
        </button>
        {!currentAccount && (
          <button className="joinSpaceButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}
