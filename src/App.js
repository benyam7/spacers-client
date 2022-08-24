import { ethers } from "ethers";
import * as React from "react";
import Picker from "emoji-picker-react";
import "./App.css";
import "./loading.css";
import abi from "./utils/JoinSpace.json";

export default function App() {
  const [currentAccount, setCurrentAccount] = React.useState();
  const [isLoading, setLoading] = React.useState(false);
  const [totalSpacersCount, setTotalSpacersCount] = React.useState();
  const [spacers, setSpacers] = React.useState([]);

  const contractAddress = "0x2BDe0049c0f21eDa2435f6e057D7AaDF10c0d1bB";
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
        console.log("current account", account);
        getTotalSpacers();
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
        const joinSpaceTx = await joinSpaceContract.joinSpace({
          id: currentAccount,
          feelingEmoji: "happy", // figure how u can store feelin emojis
          countryEmoji: countryEmoji,
          date: "Aug 19, 2022 at 6:40 PM",
          status: PENDING,
          winType: NOT_DETERMINED,
        });
        console.log("Minning...", joinSpaceTx.hash);

        await joinSpaceTx.wait();
        console.log("Minned --", joinSpaceTx.hash);
        count = await joinSpaceContract.getTotalSpacers();
        console.log("Total spacers -- ", count.toNumber());
        setTotalSpacersCount(count.toNumber());
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
    getTotalSpacersCount();
  }, []);

  const [chosenEmoji, setChosenEmoji] = React.useState(null);

  const onEmojiClick = (event, emojiObject) => {
    setChosenEmoji(emojiObject);
  };

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Hey Spacer! 🌌 🚀 ☄️</div>

        <div className="bio">
          I am Benyam,connect your Ethereum wallet and join the space to win
          some cool NFT or ETH token!
        </div>
        {totalSpacersCount && (
          <div className="bio">
            {totalSpacersCount} Spacers joined the community so far!
          </div>
        )}

        <div className="bio" style={{ fontWeight: "bold" }}>
          Let us know where you're from and become a Spacer!
        </div>

        {chosenEmoji && (
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
          pickerStyle={{ width: "100%", marginTop: 40, marginBottom: 40 }}
        />
        <div>List of Spacers joined so far!</div>
        <SpacersList spacers={spacers} />
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
  return spacers ? (
    spacers.map((spacer, index) => (
      <div
        key={index}
        style={{
          backgroundColor: "#cef",
          marginTop: "16px",
          padding: "8px",
        }}
      >
        <div>Spacer Address: {spacer.id}</div>
        <div>Country Emoji: {spacer.countryEmoji}</div>
        <div>winStatus: {spacer.winStatus}</div>
        <div>winType: {spacer.winType}</div>
      </div>
    ))
  ) : (
    <></>
  );
};
