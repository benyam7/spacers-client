import { ethers } from "ethers";
import * as React from "react";
import "./App.css";
import "./loading.css";
import abi from "./utils/JoinSpace.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState();
  const [isLoading, setLoading] = React.useState(false);
  const [totalSpacers, setTotalSpacers] = React.useState();

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

  const getTotalSpacers = async () => {
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
        setTotalSpacers(count.toNumber());
      }
    } catch (error) {
      console.log("Error when getting total spacers.", error);
    }
  };

  const joinSpace = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum); //ethers allows our frontend to talk to contract
        const signer = provider.getSigner();
        const joinSpaceContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await joinSpaceContract.getTotalSpacers();
        console.log("Retrieved total spacers count", count.toNumber());

        const PENDING = ethers.BigNumber.from("0"); // PENDING
        const NOT_DETERMINED = ethers.BigNumber.from("2"); // NOT_DETERMINED

        // join space
        const joinSpaceTx = await joinSpaceContract.joinSpace({
          id: currentAccount,
          feelingEmoji: "happy", // figure how u can store feelin emojis
          countryEmoji: "ET",
          date: "Aug 19, 2022 at 6:40 PM",
          status: PENDING,
          winType: NOT_DETERMINED,
        });
        console.log("Minning...", joinSpaceTx.hash);

        await joinSpaceTx.wait();
        console.log("Minned --", joinSpaceTx.hash);
        count = await joinSpaceContract.getTotalSpacers();
        console.log("Total spacers -- ", count.toNumber());
        setTotalSpacers(count.toNumber());
        setLoading(false);
      } else {
        console.log("Eth obj doesn't exist");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
    getTotalSpacers();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Hey Spacer! 🌌 🚀 ☄️</div>

        <div className="bio">
          I am Benyam,connect your Ethereum wallet and join the space to win
          some cool NFT or ETH token!
        </div>
        {totalSpacers && (
          <div className="bio">
            {totalSpacers} Spacers joined the community so far!
          </div>
        )}
        <button className="joinSpaceButton" onClick={joinSpace}>
          Become a Spacer! 🚀
        </button>
        {isLoading && <Loading />}
        {!currentAccount && (
          <button className="joinSpaceButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </div>
  );
}

const Loading = () => {
  return (
    <div className="loading">
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
