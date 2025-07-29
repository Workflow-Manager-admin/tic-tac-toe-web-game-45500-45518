import React, { useState, useEffect } from "react";
import "./App.css";

// Attempt to read from .env, for future extensibility (no variables yet)
const env = process.env;

/**
 * Modern Tic Tac Toe React App
 * Supports Player vs Player and Player vs AI
 */

// Styling & Theme Variables (CSS custom properties via App.css)
// Accent: #fbc02d, Primary: #1e88e5, Secondary: #43a047

// --- Helpers ---
const EMPTY_BOARD = Array(9).fill(null);
const PLAYER_MARK = { human: "X", ai: "O", player2: "O" };

/**
 * Checks if there's a winner or draw on the board.
 * @param {Array} board - Array of 9 (X/O/null)
 * @return {Object} {winner: 'X' | 'O' | null, winningLine: Array<int> | null, isDraw: boolean}
 */
// PUBLIC_INTERFACE
function calculateGameResult(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diags
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      board[a] &&
      board[a] === board[b] &&
      board[a] === board[c]
    ) {
      return { winner: board[a], winningLine: line, isDraw: false };
    }
  }
  const isDraw = board.every(cell => cell !== null);
  return { winner: null, winningLine: null, isDraw };
}

/**
 * Basic AI for Tic Tac Toe (random move picker, upgradable)
 * @param {Array} board - Current board state
 * @return {integer | null} - Index for AI move, or null if board full
 */
// PUBLIC_INTERFACE
function pickAIMove(board) {
  const available = board
    .map((cell, idx) => (cell === null ? idx : null))
    .filter(idx => idx !== null);
  if (available.length === 0) return null;
  // Could add smarter AI here (minimax, etc.)
  const move = available[Math.floor(Math.random() * available.length)];
  return move;
}

// ================================================

// PUBLIC_INTERFACE
function App() {
  // UI State
  // "menu", "playing", "result"
  const [screen, setScreen] = useState("menu");

  // Game config
  const [gameMode, setGameMode] = useState("pvp"); // "pvp" or "ai"

  // Game State
  const [board, setBoard] = useState([...EMPTY_BOARD]);
  // 'X' always goes first (Player 1)
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winner, setWinner] = useState(null); // 'X', 'O', or null
  const [winningLine, setWinningLine] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  // Theme (light only for now, but structure in place)
  const [theme] = useState("light");

  // Read .env (placeholder for future extensibility)
  useEffect(() => {
    // no-op for now
    // Example: const apiUrl = env.REACT_APP_API_URL;
  }, []);

  // Reset and start a new game
  // PUBLIC_INTERFACE
  function startGame(selectedMode) {
    setGameMode(selectedMode);
    setScreen("playing");
    setBoard([...EMPTY_BOARD]);
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
  }

  // Handle Square Click (only if no winner, correct turn, and empty square)
  // PUBLIC_INTERFACE
  function handleSquareClick(idx) {
    if (winner || isDraw || board[idx]) return;
    if (
      (gameMode === "ai" && currentPlayer === "O") // Prevent user from moving for AI
    ) {
      return;
    }
    makeMove(idx, currentPlayer);
  }

  // Make a move (player or AI)
  // PUBLIC_INTERFACE
  function makeMove(idx, player) {
    const newBoard = [...board];
    newBoard[idx] = player;
    setBoard(newBoard);

    // Compute game result after move
    const result = calculateGameResult(newBoard);
    if (result.winner) {
      setWinner(result.winner);
      setWinningLine(result.winningLine);
      setIsDraw(false);
      setScreen("result");
      return;
    } else if (result.isDraw) {
      setIsDraw(true);
      setWinningLine(null);
      setWinner(null);
      setScreen("result");
      return;
    }

    // Advance turn
    setCurrentPlayer(player === "X" ? "O" : "X");
  }

  // AI Turn (if applicable)
  useEffect(() => {
    if (
      screen === "playing" &&
      gameMode === "ai" &&
      currentPlayer === "O" &&
      !winner &&
      !isDraw
    ) {
      // Delay AI move for slight realism
      const timeout = setTimeout(() => {
        const aiIdx = pickAIMove(board);
        if (aiIdx !== null) {
          makeMove(aiIdx, "O");
        }
      }, 600);
      return () => clearTimeout(timeout);
    }
  // strictly only on relevant items
  // eslint-disable-next-line
  }, [board, currentPlayer, screen, gameMode, winner, isDraw]);

  // Handlers for navigation
  // PUBLIC_INTERFACE
  function goToMenu() {
    setScreen("menu");
    setBoard([...EMPTY_BOARD]);
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine(null);
    setIsDraw(false);
  }

  // -- UI Components --
  // PUBLIC_INTERFACE
  function StatusBar() {
    let message = "";
    if (screen === "menu") {
      message = "Welcome to Tic Tac Toe!";
    } else if (screen === "result") {
      if (winner) {
        if (gameMode === "ai") {
          if (winner === "X") message = "You Win! 🎉";
          else message = "AI Wins! 🤖";
        } else {
          message = `Player ${winner} Wins! 🏆`;
        }
      } else if (isDraw) {
        message = "It's a Draw!";
      }
    } else if (screen === "playing") {
      if (winner) {
        message = `Winner: ${winner}`;
      } else if (isDraw) {
        message = "Draw!";
      } else if (gameMode === "ai" && currentPlayer === "O") {
        message = "AI is thinking...";
      } else {
        message =
          gameMode === "ai"
            ? `Your Turn (${currentPlayer})`
            : `Player ${currentPlayer}'s Turn`;
      }
    }
    return (
      <div className="status-bar" data-testid="status-bar">
        {message}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function GameBoard() {
    return (
      <div
        className="board"
        role="grid"
        aria-label="Tic Tac Toe Board"
        data-testid="game-board"
      >
        {board.map((cell, idx) => (
          <button
            key={idx}
            className={
              "square" +
              (winningLine && winningLine.includes(idx) ? " square--win" : "")
            }
            onClick={() => handleSquareClick(idx)}
            aria-label={`Square ${idx + 1}, ${cell ? cell : "empty"}`}
            disabled={!!winner || !!isDraw || !!cell || (gameMode === "ai" && currentPlayer === "O")}
            tabIndex={cell ? -1 : 0}
          >
            {cell}
          </button>
        ))}
      </div>
    );
  }

  // PUBLIC_INTERFACE
  function ControlBar() {
    if (screen === "menu") {
      return (
        <div className="controls">
          <button
            style={{
              background: "var(--primary-color)",
            }}
            className="btn btn-large"
            onClick={() => startGame("pvp")}
          >
            Player vs Player
          </button>
          <button
            style={{
              background: "var(--secondary-color)",
              marginTop: 12,
            }}
            className="btn btn-large"
            onClick={() => startGame("ai")}
          >
            Player vs AI
          </button>
        </div>
      );
    }
    if (screen === "playing") {
      return (
        <div className="controls">
          <button
            className="btn btn-primary"
            style={{ background: "var(--accent-color)" }}
            onClick={goToMenu}
          >
            Quit Game
          </button>
          <button
            className="btn btn-secondary"
            style={{ background: "var(--secondary-color)", marginLeft: 12 }}
            onClick={() => startGame(gameMode)}
          >
            Restart
          </button>
        </div>
      );
    }
    // result screen
    if (screen === "result") {
      return (
        <div className="controls">
          <button
            className="btn btn-primary"
            style={{ background: "var(--primary-color)" }}
            onClick={() => startGame(gameMode)}
          >
            Play Again
          </button>
          <button
            className="btn btn-secondary"
            style={{
              background: "var(--accent-color)",
              marginLeft: 12,
            }}
            onClick={goToMenu}
          >
            Main Menu
          </button>
        </div>
      );
    }
    return null;
  }

  // PUBLIC_INTERFACE
  function Footer() {
    return (
      <footer className="footer">
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          © {new Date().getFullYear()} Tic Tac Toe | Powered by Kavia
        </span>
      </footer>
    );
  }

  // App Layout
  return (
    <div className="App ttt-container">
      <header className="ttt-titlebar">
        <h1 className="ttt-title">
          <span style={{ color: "var(--primary-color)" }}>Tic </span>
          <span style={{ color: "var(--accent-color)" }}>Tac </span>
          <span style={{ color: "var(--secondary-color)" }}>Toe</span>
        </h1>
      </header>
      <main className="ttt-main">
        <StatusBar />
        <div className="ttt-board-wrapper">
          {screen === "menu" ? (
            <div className="ttt-menu-art" aria-hidden="true">
              {/* Decorative SVG for style */}
              <svg height="100px" width="100px" fill="none">
                <rect
                  x="10"
                  y="10"
                  width="80"
                  height="80"
                  rx="15"
                  fill="#fbc02d"
                  stroke="#1e88e5"
                  strokeWidth="3"
                  opacity="0.13"
                />
              </svg>
            </div>
          ) : (
            <GameBoard />
          )}
        </div>
        <ControlBar />
      </main>
      <Footer />
    </div>
  );
}

export default App;
