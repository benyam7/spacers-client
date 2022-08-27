import "./rocket.css";
import React from "react";
import { useEffect } from "react";

const RocketScene = () => {
  useEffect(() => {
    stars();
  }, []);
  return (
    <div className="scene">
      <div className="rocket">
        <img src="/rocket-ship.svg" height={100} />
      </div>
    </div>
  );
};

const stars = () => {
  let count = 50;
  let scene = document.querySelector(".scene");
  console.log("called");
  if (scene) {
    let i = 0;
    while (i < count) {
      let star = document.createElement("i");
      let x = Math.floor(Math.random() * window.innerWidth);
      let duration = Math.random() * 1;
      let h = Math.random() * 100;

      star.style.left = x + "px";

      star.style.width = 1 + "px";
      star.style.height = h + "px";
      star.style.animationDuration = duration + "s";
      scene.appendChild(star);
      i++;
    }
  }
};

export default RocketScene;
