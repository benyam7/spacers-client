import { ethers } from "ethers";
import * as React from "react";

import abi from "./utils/JoinSpace.json";

import "./App.css";
import "./background.css";

import "./components/Loading";
import RocketScene from "./components/RocketScene";
import Loading from "./components/Loading";
import SpacersList from "./components/SpacersList";
import FlagPicker from "./components/FlagPicker";
import { readWinStatus } from "./utils/winstatusConverter";

const GOERLI = "goerli";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState();
  const [isLoading, setLoading] = React.useState(false);
  const [totalSpacersCount, setTotalSpacersCount] = React.useState();
  const [spacers, setSpacers] = React.useState([]);

  const contractAddress = "0x7b79F43fD1Bf7BFFb51B44f0ceCFDc4d8E9DcEcc";
  const contractABI = abi.abi;
  const makeSureChainIdIsGoerli = async (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const { name } = await provider.getNetwork();
    if (name !== GOERLI) {
      console.log("name", name);
      alert(
        "Change your Wallet network to Goerli, otherwise functionality of the app won't work. :("
      );
    }
  };
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("we got eth obj", ethereum);
        makeSureChainIdIsGoerli(ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" }); // see if we can access the accounts (this returns an array)

      if (accounts.length) {
        const account = accounts[0];
        setCurrentAccount(account);
        console.log("current account", account);
        getTotalSpacers();
      } else {
        console.log("we couldnt find any account");
      }
    } catch (error) {
      console.log("error");
    }
  };

  const listenToAccountChangesInMetaMask = () => {
    const { ethereum } = window;
    if (ethereum) {
      ethereum.on("accountsChanged", function (accounts) {
        setCurrentAccount(accounts[0]);
      });
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

  const getTotalSpacersCount = async () => {
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
        setTotalSpacersCount(count.toNumber());
      }
    } catch (error) {
      console.log("Error when getting total spacers.", error);
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
        const spacersArr = await joinSpaceContract.getSpacersArray();
        let spacersCleaned = [];
        spacersArr.forEach((spacer) => {
          spacersCleaned.push({
            id: spacer.id,
            countryEmoji: spacer.countryEmoji,
            winStatus: spacer.status,
          });
        });
        setSpacers(spacersCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log("error when getting total spacers array", error);
    }
  };

  React.useEffect(() => {
    let joinSpaceContract;

    const onNewSpacer = (id, timestamp, countryEmoji) => {
      console.log("NewSpacer", id, timestamp, countryEmoji);
      setSpacers((prevState) => [
        ...prevState,
        {
          id,
          countryEmoji,
          winStatus: readWinStatus(0), // TODO: change this as soon as you update your smart contract to emit win status as well.
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      joinSpaceContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      joinSpaceContract.on("NewSpacer", onNewSpacer);
    }

    return () => {
      if (joinSpaceContract) {
        joinSpaceContract.off("NewSpacer", onNewSpacer);
      }
    };
  }, []);

  const joinSpace = async (countryEmoji) => {
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
        const joinSpaceTx = await joinSpaceContract.joinSpace(
          {
            id: currentAccount,
            feelingEmoji: "happy", // figure how u can store feelin emojis
            countryEmoji: countryEmoji,
            date: "Aug 19, 2022 at 6:40 PM",
            status: PENDING,
            winType: NOT_DETERMINED,
          },
          { gasLimit: 300000 }
        );
        console.log("Minning...", joinSpaceTx.hash);

        await joinSpaceTx.wait();
        console.log("Minned --", joinSpaceTx.hash);
        count = await joinSpaceContract.getTotalSpacers();
        console.log("Total spacers -- ", count.toNumber());
        setTotalSpacersCount(count.toNumber());
        getTotalSpacers();
        setLoading(false);
        setChosenEmoji(null);
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
    getTotalSpacersCount();
    listenToAccountChangesInMetaMask();
  }, []);

  const [chosenEmoji, setChosenEmoji] = React.useState(null);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };

  return (
    <div className="mainContainer bg">
      <div className="dataContainer">
        <div className="header">Hey Spacer! ???? ???? ??????</div>

        <div className="bio">
          I am Benyam, connect your Ethereum wallet and join the club to{" "}
          <strong>win some cool NFT or ETH token!</strong>
        </div>

        {totalSpacersCount && (
          <div className="bio">
            {totalSpacersCount} Spacers joined the club so far!
          </div>
        )}

        {!currentAccount ? (
          <div className="bio" style={{ fontWeight: "bold" }}>
            Connect your wallet to represent your country!
          </div>
        ) : (
          <div className="bio" style={{ fontWeight: "bold" }}>
            Let us know where you're from and become a Spacer!
          </div>
        )}

        {chosenEmoji && !isLoading && currentAccount && (
          <button
            className="joinSpaceButton"
            onClick={() => {
              joinSpace(chosenEmoji.emoji);
            }}
          >
            Become a Spacer! ???? from {chosenEmoji.emoji}
          </button>
        )}
        {isLoading && <Loading />}

        {!currentAccount && (
          <button className="joinSpaceButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {!isLoading && <FlagPicker onEmojiClick={onEmojiClick} />}

        <RocketScene />

        {currentAccount && (
          <>
            <div>The G's in the club!</div>

            {spacers.length === 0 ? (
              <div>
                No one joined so far, well, u got a chance to be first one!????
              </div>
            ) : (
              <SpacersList spacers={spacers} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
