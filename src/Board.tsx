import { create } from "zustand";
import { combine } from "zustand/middleware";

const useGameStore = create(
  combine(
    {
      history: [Array(9).fill(null)],
      currentMove: 0,
      xIsNext: true,
    },
    (set) => {
      return {
        setHistory: (nextHistory: any) => {
          set((state) => ({
            history:
              typeof nextHistory === "function"
                ? nextHistory(state.history)
                : nextHistory,
          }));
        },
        setCurrentMove: (nextCurrentMove: any) => {
          set((state) => ({
            currentMove:
              typeof nextCurrentMove === "function"
                ? nextCurrentMove(state.currentMove)
                : nextCurrentMove,
          }));
        },
        setXIsNext: (nextXIsNext: any) => {
          set((state) => ({
            xIsNext:
              typeof nextXIsNext === "function"
                ? nextXIsNext(state.xIsNext)
                : nextXIsNext,
          }));
        },
        setReset: () => {
          set(() => ({
            history: [Array(9).fill(null)],
            currentMove: 0,
            xIsNext: true, // 👈 reset turn as well
          }));
        },
      };
    }
  )
);

function Square({ value, onSquareClick }: any) {
  return (
    <button
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
        color: "black",
        backgroundColor: "#fff",
        border: "1px solid #999",
        outline: 0,
        borderRadius: 0,
        fontSize: "5rem",
        fontWeight: "bold",
      }}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }: any) {
  const winner = calculateWinner(squares);
  const turns = calculateTurns(squares);
  const player = xIsNext ? "X" : "O";
  const status = calculateStatus(winner, turns, player);
  const setReset = useGameStore((state) => state.setReset);

  function handleClick(i: number) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = player;
    onPlay(nextSquares);
  }

  return (
    <>
      <div style={{ marginBottom: "0.5rem" }}>{status}</div>
      {status[0] !== "N" && (
        <button onClick={setReset} style={{ marginBottom: "15px" }}>
          Reset
        </button>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "repeat(3, 1fr)",
          width: "calc(10 * 2.5rem)",
          height: "calc(10 * 2.5rem)",
          border: "1px solid #999",
        }}
      >
        {squares.map((square: number, squareIndex: number) => (
          <Square
            key={squareIndex}
            value={square}
            onSquareClick={() => handleClick(squareIndex)}
          />
        ))}
      </div>
    </>
  );
}

export default function Game() {
  const history = useGameStore((state) => state.history);
  const setHistory = useGameStore((state) => state.setHistory);
  const currentMove = useGameStore((state) => state.currentMove);
  const setCurrentMove = useGameStore((state) => state.setCurrentMove);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares: any) {
    const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares]);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }
  function jumpTo(nextMove: any) {
    setCurrentMove(nextMove);
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        fontFamily: "monospace",
      }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div style={{ marginLeft: "1rem" }}>
        <ol>
          {history.map((_, historyIndex) => {
            const description =
              historyIndex > 0
                ? `Go to move #${historyIndex}`
                : "Go to game start";

            return (
              <li key={historyIndex}>
                <button onClick={() => jumpTo(historyIndex)}>
                  {description}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function calculateWinner(squares: any) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }

  return null;
}

function calculateTurns(squares: any) {
  return squares.filter((square: any) => !square).length;
}

function calculateStatus(winner: any, turns: any, player: any) {
  if (!winner && !turns) return "Draw";
  if (winner) return `Winner ${winner}`;
  return `Next player: ${player}`;
}
