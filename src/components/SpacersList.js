import React from "react";
import Lottie from "react-lottie";
import animationData from "../utils/spacer-lottie.json";
import { readWinStatus } from "../utils/winstatusConverter";

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

export default SpacersList;
