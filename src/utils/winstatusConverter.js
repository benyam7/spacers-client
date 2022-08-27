const PENDING = "pending ⌚⌛"; //0
const LOST = "lost 😥💔"; //1
const WINNER = "won 🥇🥂"; //2

const readWinStatus = (status) => {
  switch (status) {
    case 0:
      return PENDING;
    case 1:
      return LOST;
    case 2:
      return WINNER;
  }
};

export { readWinStatus };
