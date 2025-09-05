import { create } from "zustand";
import { combine } from "zustand/middleware";

type Player = "X" | "O" | null;
type Board = Player[];
type History = Board[];

interface GameState {
  history: History;
  currentMove: number;
  xIsNext: boolean;
}

interface GameActions {
  setHistory: (next: History | ((prev: History) => History)) => void;
  setCurrentMove: (next: number | ((prev: number) => number)) => void;
  setXIsNext: (next: boolean | ((prev: boolean) => boolean)) => void;
  setReset: () => void;
}
export const useGameStore = create<GameState & GameActions>()(
  combine(
    {
      history: [Array(9).fill(null)] as History,
      currentMove: 0,
      xIsNext: true,
    },
    (set) => ({
      setHistory: (next) =>
        set((state) => ({
          history: typeof next === "function" ? next(state.history) : next,
        })),
      setCurrentMove: (next) =>
        set((state) => ({
          currentMove:
            typeof next === "function" ? next(state.currentMove) : next,
        })),
      setXIsNext: (next) =>
        set((state) => ({
          xIsNext: typeof next === "function" ? next(state.xIsNext) : next,
        })),
      setReset: () =>
        set(() => ({
          history: [Array(9).fill(null)] as History,
          currentMove: 0,
          xIsNext: true,
        })),
    })
  )
);
interface SquareProps {
  value: Player;
  onSquareClick: () => void;
}

function Square({ value, onSquareClick }: SquareProps) {
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
interface BoardProps {
  xIsNext: boolean;
  squares: Board;
  onPlay: (nextSquares: Board) => void;
}

function Board({ xIsNext, squares, onPlay }: BoardProps) {
  const winner = calculateWinner(squares);
  const turns = calculateTurns(squares);
  const player: Player = xIsNext ? "X" : "O";
  const status = calculateStatus(winner, turns, player);
  const setReset = useGameStore((state) => state.setReset);

  function handleClick(i: number) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice() as Board;
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
        {squares.map((square, index) => (
          <Square
            key={index}
            value={square}
            onSquareClick={() => handleClick(index)}
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

  function handlePlay(nextSquares: Board) {
    const nextHistory = history.slice(0, currentMove + 1).concat([nextSquares]);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove: number) {
    setCurrentMove(nextMove);
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "row", fontFamily: "monospace" }}
    >
      <div>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
        <div style={{ marginTop: "10px" }}>
          {currentMove !== 0 && (
            <button onClick={() => setCurrentMove(currentMove - 1)}>
              Undo Last Move
            </button>
          )}
        </div>
      </div>
      <div style={{ marginLeft: "1rem" }}>
        <ol>
          {history.map((_, index) => (
            <li key={index}>
              <button onClick={() => jumpTo(index)}>
                {index > 0 ? `Go to move #${index}` : "Go to game start"}
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
function calculateWinner(squares: Board): Player {
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

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

function calculateTurns(squares: Board) {
  return squares.filter((square) => !square).length;
}

function calculateStatus(winner: Player, turns: number, player: Player) {
  if (!winner && !turns) return "Draw";
  if (winner) return `Winner ${winner}`;
  return `Next player: ${player}`;
}
