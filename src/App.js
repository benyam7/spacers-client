import { ethers } from "ethers";
import * as React from "react";
import Picker from "emoji-picker-react";
import Lottie from "react-lottie";

import "./App.css";
import "./background.css";
import "./loading.css";
import abi from "./utils/JoinSpace.json";
import RocketScene from "./RocketScene";
import animationData from "./utils/spacer-lottie.json";
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
        console.log("Spacers not cleaned", spacersArr);
        let spacersCleaned = [];
        spacersArr.forEach((spacer) => {
          spacersCleaned.push({
            id: spacer.id,
            countryEmoji: spacer.countryEmoji,
            winStatus: spacer.status,
            winType: spacer.winType,
          });
        });
        setSpacers(spacersCleaned);
      }
    } catch (error) {
      console.log("error when getting total spacers array", error);
    }
  };

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
        <div className="header">Hey Spacer! 🌌 🚀 ☄️</div>

        <div className="bio">
          I am Benyam,connect your Ethereum wallet and join the club to win some
          cool NFT or ETH token!
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
            Become a Spacer! 🚀 from {chosenEmoji.emoji}
          </button>
        )}
        {isLoading && <Loading />}
        {!currentAccount && (
          <button className="joinSpaceButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {!isLoading && (
          <Picker
            onEmojiClick={onEmojiClick}
            style={{ width: "100%" }}
            groupVisibility={{
              smileys_people: false,
              animals_nature: false,
              food_drink: false,
              travel_places: false,
              activities: false,
              objects: false,
              symbols: false,
              recently_used: false,
            }}
            disableSkinTonePicker={true}
            pickerStyle={{
              width: "100%",
              marginTop: 40,
              marginBottom: 40,
            }}
          />
        )}

        <RocketScene />

        {currentAccount && (
          <>
            <div>The G's in the club!</div>

            {spacers.length === 0 ? (
              <div>
                No one joined so far, well u got a chance to be first one!😅
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

const Loading = () => {
  return (
    <div className="loading">
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

const SpacersList = (props) => {
  const { spacers } = props;
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  return spacers ? (
    spacers.map((spacer, index) => (
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <div
          style={{
            background: "linear-gradient(#cef, transparent)",
            marginTop: "16px",
            padding: "8px",
          }}
        >
          <Lottie options={defaultOptions} height={100} width={100} />
        </div>
        <div
          key={index}
          style={{
            background: "linear-gradient(#cef, transparent)",
            marginTop: "16px",
            padding: "8px",
          }}
        >
          <div>Spacer : {spacer.id}</div>
          <div>From: {spacer.countryEmoji}</div>
          <div>Win status: {readWinStatus(spacer.winStatus)}</div>
        </div>
      </div>
    ))
  ) : (
    <></>
  );
};
