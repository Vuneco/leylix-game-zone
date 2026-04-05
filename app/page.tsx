"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import SponsorCard from "@/app/components/SponsorCard";
import { sponsors } from "@/data/sponsorData/sponsors";

const COLS = 10;
const ROWS = 20;
const EMPTY = 0;

type Piece = {
  id: number;
  matrix: number[][];
  color: string;
  x: number;
  y: number;
};

const WALLPAPERS = [
  {
    key: "aurora",
    name: "Aurora",
    background:
      "radial-gradient(circle at top left, rgba(120,255,214,0.25), transparent 30%), radial-gradient(circle at top right, rgba(90,120,255,0.25), transparent 28%), linear-gradient(135deg, #07111f 0%, #0e1c35 45%, #04070f 100%)",
  },
  {
    key: "sunset",
    name: "Sunset",
    background:
      "radial-gradient(circle at top left, rgba(255,174,94,0.28), transparent 30%), radial-gradient(circle at bottom right, rgba(255,82,130,0.18), transparent 32%), linear-gradient(135deg, #2b1028 0%, #5f2338 40%, #120610 100%)",
  },
  {
    key: "forest",
    name: "Forest",
    background:
      "radial-gradient(circle at top right, rgba(79,219,144,0.18), transparent 30%), radial-gradient(circle at bottom left, rgba(118,255,190,0.18), transparent 28%), linear-gradient(135deg, #08150f 0%, #123223 45%, #06110b 100%)",
  },
];

const PIECES_BASE = [
  {
    id: 1,
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: "#34d399",
  },
  {
    id: 2,
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: "#22d3ee",
  },
  {
    id: 3,
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: "#e879f9",
  },
  {
    id: 4,
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: "#a3e635",
  },
  {
    id: 5,
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: "#fb7185",
  },
  {
    id: 6,
    matrix: [[1, 1, 1, 1]],
    color: "#7dd3fc",
  },
  {
    id: 7,
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: "#fde68a",
  },
];

function createEmptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(EMPTY));
}

function rotateMatrix(matrix: number[][]): number[][] {
  return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
}

function randomPiece(): Piece {
  const base = PIECES_BASE[Math.floor(Math.random() * PIECES_BASE.length)];
  return {
    ...base,
    x: Math.floor(COLS / 2) - Math.ceil(base.matrix[0].length / 2),
    y: 0,
  };
}

function collides(board: number[][], piece: Piece): boolean {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (!piece.matrix[y][x]) continue;

      const newX = piece.x + x;
      const newY = piece.y + y;

      if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
      if (newY >= 0 && board[newY][newX] !== EMPTY) return true;
    }
  }
  return false;
}

function merge(board: number[][], piece: Piece): number[][] {
  const next = board.map((row) => [...row]);
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (!piece.matrix[y][x]) continue;
      const boardY = piece.y + y;
      const boardX = piece.x + x;
      if (boardY >= 0) next[boardY][boardX] = piece.id;
    }
  }
  return next;
}

function clearLines(board: number[][]) {
  const kept = board.filter((row) => row.some((cell) => cell === EMPTY));
  const cleared = ROWS - kept.length;
  while (kept.length < ROWS) kept.unshift(Array(COLS).fill(EMPTY));
  return { board: kept, cleared };
}

function getColorById(id: number): string {
  return PIECES_BASE.find((p) => p.id === id)?.color || "rgba(255,255,255,0.05)";
}

export default function Page() {
  const [board, setBoard] = useState<number[][]>(createEmptyBoard());
  const [piece, setPiece] = useState<Piece | null>(null);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 900);
  check();
  window.addEventListener("resize", check);
  return () => window.removeEventListener("resize", check);
}, []);
  const [nextPiece, setNextPiece] = useState<Piece | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [wallpaper, setWallpaper] = useState(WALLPAPERS[0].key);
  const [sessions, setSessions] = useState(0);
  const [moves, setMoves] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const lastCelebratedHundredRef = useRef(0);
  const celebrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0, active: false });
  

  const wallpaperObject = useMemo(
    () => WALLPAPERS.find((w) => w.key === wallpaper) || WALLPAPERS[0],
    [wallpaper]
  );
  
  const activeSponsors = sponsors.filter((item) => item.isActive);
  const currentSponsor = activeSponsors[0] || null;
  const visibleBoard = useMemo(() => {
  const temp = board.map((row) => [...row]);

  if (!piece) return temp;

  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (!piece.matrix[y][x]) continue;
      const bx = piece.x + x;
      const by = piece.y + y;
      if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
        temp[by][bx] = piece.id;
      }
    }
  }

  return temp;
}, [board, piece]);

  useEffect(() => {
  const storedBest = Number(localStorage.getItem("leylix_letris_best") || 0);
  const storedSessions = Number(localStorage.getItem("leylix_letris_sessions") || 0);
  setBestScore(storedBest);
  setSessions(storedSessions);
  setPiece(randomPiece());
  setNextPiece(randomPiece());
}, []);

  useEffect(() => {
    localStorage.setItem("leylix_letris_best", String(bestScore));
  }, [bestScore]);

  useEffect(() => {
    localStorage.setItem("leylix_letris_sessions", String(sessions));
  }, [sessions]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (["ArrowLeft", "ArrowRight", "ArrowDown", "ArrowUp", " "].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowLeft") movePiece(-1);
      if (e.key === "ArrowRight") movePiece(1);
      if (e.key === "ArrowDown") softDrop();
      if (e.key === "ArrowUp") rotatePiece();
      if (e.key === " ") hardDrop();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameOver, piece, board, running]);

  useEffect(() => {
    if (!running || gameOver) return;

    const speed = Math.max(140, 800 - (level - 1) * 70);
    tickRef.current = setInterval(() => {
      dropPiece();
    }, speed);

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, piece, board, gameOver, level]);

  function startGame() {
  if (!piece || !nextPiece) {
    setPiece(randomPiece());
    setNextPiece(randomPiece());
  }

  if (gameOver) {
    resetGame();
    return;
  }

  setRunning(true);
  setSessions((s) => s + 1);
}

  function pauseGame() {
    setRunning(false);
  }

  function resetGame() {
    setBoard(createEmptyBoard());
    setPiece(randomPiece());
    setNextPiece(randomPiece());
    setScore(0);
    setLevel(1);
    setLines(0);
    setMoves(0);
    setGameOver(false);
    setShowGameOverModal(false);
    setRunning(false);
    lastCelebratedHundredRef.current = 0;
    if (celebrationTimeoutRef.current) {
  clearTimeout(celebrationTimeoutRef.current);
  celebrationTimeoutRef.current = null;
}

if (celebrationAudioRef.current) {
  celebrationAudioRef.current.pause();
  celebrationAudioRef.current.currentTime = 0;
  celebrationAudioRef.current = null;
}
  }

  function restartGameNow() {
  resetGame();
  setTimeout(() => {
    setRunning(true);
    setSessions((s) => s + 1);
  }, 0);
}

function closeGameOverModal() {
  setShowGameOverModal(false);
}

  function movePiece(direction: number) {
  if (!running) return;
  if (!piece) return;

  const moved = { ...piece, x: piece.x + direction };
  if (!collides(board, moved)) {
    setPiece(moved);
    setMoves((m) => m + 1);
  }
}

  function rotatePiece() {
  if (!running) return;
  if (!piece) return;

  const rotated = { ...piece, matrix: rotateMatrix(piece.matrix) };
  if (!collides(board, rotated)) {
    setPiece(rotated);
    setMoves((m) => m + 1);
  }
}

  function dropPiece() {
  if (!running) return;
  if (!piece) return;

  const dropped = { ...piece, y: piece.y + 1 };
  if (!collides(board, dropped)) {
    setPiece(dropped);
  } else {
    lockPiece(piece);
  }
}

  function softDrop() {
  if (!running) return;
  if (!piece) return;

  const dropped = { ...piece, y: piece.y + 1 };
  if (!collides(board, dropped)) {
    setPiece(dropped);
    setScore((s) => s + 1);
    setMoves((m) => m + 1);
  } else {
    lockPiece(piece);
  }
}

  function hardDrop() {
  if (!running) return;
  if (!piece) return;

  let candidate = { ...piece };
  while (!collides(board, { ...candidate, y: candidate.y + 1 })) {
    candidate.y += 1;
  }
  lockPiece(candidate);
  setMoves((m) => m + 1);
}

  function lockPiece(currentPiece: Piece) {
    const merged = merge(board, currentPiece);
    const { board: clearedBoard, cleared } = clearLines(merged);

    const nextScore =
      score +
      (cleared === 1
        ? 100
        : cleared === 2
        ? 300
        : cleared === 3
        ? 500
        : cleared >= 4
        ? 800
        : 20);

    const nextLines = lines + cleared;
    const nextLevel = Math.max(1, Math.floor(nextLines / 5) + 1);

    if (!nextPiece) return;

const spawned: Piece = {
  ...nextPiece,
  x: Math.floor(COLS / 2) - Math.ceil(nextPiece.matrix[0].length / 2),
  y: 0,
};

    setBoard(clearedBoard);
    setScore(nextScore);
    const previousHundred = Math.floor((score) / 100);
const nextHundred = Math.floor(nextScore / 100);

if (nextHundred > previousHundred && nextHundred > lastCelebratedHundredRef.current) {
  lastCelebratedHundredRef.current = nextHundred;

  const isAlreadyPlaying =
    celebrationAudioRef.current &&
    !celebrationAudioRef.current.paused &&
    !celebrationAudioRef.current.ended;

  if (!isAlreadyPlaying) {
    const audio = new Audio("/sounds/celebration.mp3");
    audio.volume = 0.25;

    celebrationAudioRef.current = audio;

    audio.play().catch(() => {});

    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
    }

    celebrationTimeoutRef.current = setTimeout(() => {
      if (celebrationAudioRef.current) {
        celebrationAudioRef.current.pause();
        celebrationAudioRef.current.currentTime = 0;
        celebrationAudioRef.current = null;
      }
    }, 8000);
  }
}
    setLines(nextLines);
    setLevel(nextLevel);
    setBestScore((b) => Math.max(b, nextScore));
    setPiece(spawned);
    setNextPiece(randomPiece());

    if (collides(clearedBoard, spawned)) {
  setGameOver(true);
  setShowGameOverModal(true);
  setRunning(false);
}
  }

  function onTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    const touch = event.touches?.[0];
    if (!touch) return;
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, active: true };
  }

  function onTouchEnd(event: React.TouchEvent<HTMLDivElement>) {
    if (!touchStartRef.current.active) return;
    const touch = event.changedTouches?.[0];
    if (!touch) return;

    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    const tapThreshold = 12;
    const swipeThreshold = 26;

    if (absX < tapThreshold && absY < tapThreshold) {
      rotatePiece();
    } else if (absX > absY && absX > swipeThreshold) {
      if (dx > 0) movePiece(1);
      else movePiece(-1);
    } else if (absY > swipeThreshold) {
      if (dy > 0) softDrop();
      else rotatePiece();
    }

    touchStartRef.current.active = false;
  }

  const adFill = Math.min(100, ((moves + lines * 2) / 40) * 100);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: wallpaperObject.background,
        color: "white",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <style>
  {`
    @keyframes fadeInOverlay {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes popInCard {
      from {
        opacity: 0;
        transform: translateY(10px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `}
</style>
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gap: "24px",
          gridTemplateColumns: isMobile ? "1fr" : "1.2fr 0.8fr",
        }}
      >
        <section
          style={{
            background: "rgba(0,0,0,0.28)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "28px",
            padding: "20px",
            backdropFilter: "blur(18px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 12px",
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  fontSize: "12px",
                  marginBottom: "10px",
                }}
              >
                Leylix Games
              </div>
              <h1 style={{ margin: 0, fontSize: "30px" }}>Leylix Games - Letris</h1>
              <p style={{ color: "rgba(255,255,255,0.72)" }}>
                Letris-inspired prototype with wallpapers, ad slot and mobile controls.
              </p>
            </div>

            
          </div>

          <div
            style={{
              display: "grid",
              gap: "24px",
              gridTemplateColumns: isMobile ? "1fr" : "280px 1fr",
            }}
          >
            <div style={{ display: "grid", gap: "16px" }}>
              <div style={{ ...panelStyle, position: "relative", overflow: "hidden" }}>
                <div style={statsGridStyle}>
                  <Stat label="Score" value={score} />
                  <Stat label="Best" value={bestScore} />
                  <Stat label="Level" value={level} />
                  <Stat label="Lines" value={lines} />
                  <Stat label="Sessions" value={sessions} />
                  <Stat label="Moves" value={moves} />
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ marginBottom: "10px", color: "rgba(255,255,255,0.7)" }}>
                  Wallpaper
                </div>
                <select
                  value={wallpaper}
                  onChange={(e) => setWallpaper(e.target.value)}
                  style={selectStyle}
                >
                  {WALLPAPERS.map((item) => (
                    <option key={item.key} value={item.key}>
                      {item.name}
                    </option>
                  ))}
                </select>

                <div
                  style={{
                    marginTop: "18px",
                    marginBottom: "10px",
                    color: "rgba(255,255,255,0.7)",
                  }}
                >
                  Next block
                </div>

                <div
                  style={{
                    minHeight: "110px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "22px",
                    background: "rgba(0,0,0,0.22)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    padding: "12px",
                  }}
                >
                  <MiniMatrix piece={nextPiece} />
                </div>
              </div>

              <div style={panelStyle}>
                <div style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
                  Sponsor / Werbefläche
                </div>
                <div
                  style={{
                    marginTop: "12px",
                    borderRadius: "20px",
                    border: "1px dashed rgba(255,255,255,0.2)",
                    padding: "14px",
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>Leylix Ad Slot</div>
                  <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", marginTop: "6px" }}>
                    Hier können später Sponsor-Banner, House Ads oder Event-Promotions rein.
                  </div>
                </div>

                <div style={{ marginTop: "14px", fontSize: "12px", color: "rgba(255,255,255,0.65)" }}>
                  Ad visibility demo
                </div>
                <div
                  style={{
                    marginTop: "8px",
                    width: "100%",
                    height: "8px",
                    borderRadius: "999px",
                    background: "rgba(255,255,255,0.08)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${adFill}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #7c3aed, #a855f7)",
                    }}
                  />
                </div>
                {currentSponsor && <SponsorCard sponsor={currentSponsor} />}
              </div>
            </div>

            <div>
              <div style={panelStyle}>
                

<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1.4fr",
    gap: "10px",
    marginBottom: "12px",
  }}
>
  <button
    onClick={resetGame}
    style={{
      background: "rgba(255,255,255,0.1)",
      color: "white",
      border: "1px solid rgba(255,255,255,0.1)",
      padding: "6px",
      borderRadius: "16px",
      cursor: "pointer",
      fontWeight: 700,
      fontSize: "14px",
    }}
  >
    Reset
  </button>

  <button
    onClick={running ? pauseGame : startGame}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      width: "100%",
      padding: "6px 10px",
      borderRadius: "16px",
      border: "none",
      fontWeight: 700,
      fontSize: "14px",
      cursor: "pointer",
      background: running
        ? "linear-gradient(90deg, #ef4444, #f87171)"
        : "linear-gradient(90deg, #22c55e, #4ade80)",
      color: "white",
    }}
  >
    <span>{running ? "Pause" : "Start"}</span>

    <span
      style={{
        minWidth: "64px",
        textAlign: "center",
        padding: "6px 10px",
        borderRadius: "12px",
        background: "rgba(255,255,255,0.85)",
        border: "1px solid rgba(255,255,255,0.3)",
        fontSize: "13px",
        fontWeight: 700,
        color: "#111", //Schwarz
      }}
    >
      {score} P
    </span>
  </button>
</div>

                <div
                  onTouchStart={onTouchStart}
                  onTouchEnd={onTouchEnd}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                    gap: "4px",
                    background: "rgba(0,0,0,0.35)",
                    borderRadius: "24px",
                    padding: "12px",
                    userSelect: "none",
                    touchAction: "none",
                  }}
                >
                  {visibleBoard.flatMap((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        style={{
                          aspectRatio: "1 / 1",
                          borderRadius: "8px",
                          background: cell ? getColorById(cell) : "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.04)",
                        }}
                      />
                    ))
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "8px",
                    marginTop: "14px",
                  }}
                >
                  <button style={touchBtnStyle} onClick={() => movePiece(-1)}>Left</button>
                  <button style={touchBtnStyle} onClick={rotatePiece}>Rotate</button>
                  <button style={touchBtnStyle} onClick={() => movePiece(1)}>Right</button>
                  <button style={touchBtnStyle} onClick={softDrop}>Down</button>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <button style={{ ...touchBtnStyle, width: "100%" }} onClick={hardDrop}>
                    Drop
                  </button>
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    padding: "12px",
                    fontSize: "12px",
                    color: "rgba(255,255,255,0.7)",
                    lineHeight: 1.6,
                  }}
                >
                  Swipe left or right to move. Swipe down to go lower. Tap the board to rotate.
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "14px" }}>
                  <Tag text="Leylix" />
                  <Tag text="WebView Ready" />
                  <Tag text="Sponsor Ready" />
                  <Tag text="Analytics Ready" />
                </div>
                             

              </div>                            
            </div>
          </div>
        </section>

        <aside
          style={{
            background: "rgba(0,0,0,0.28)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "28px",
            padding: "20px",
            backdropFilter: "blur(18px)",
            height: "fit-content",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Schlachtplan</h2>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "14px", lineHeight: 1.8 }}>
            <div><strong>Frontend:</strong> Next.js + React</div>
            <div><strong>Hosting:</strong> später z. B. Vercel</div>
            <div><strong>App:</strong> im Leylix WebView nutzbar</div>
            <div><strong>Ads:</strong> Sponsor-Banner, House Ads, Partnerkampagnen</div>
            <div><strong>Tracking:</strong> Sessions, Starts, Klicks, Wallpaper-Nutzung, Scores</div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <h3>Spätere Events</h3>
            <div style={{ color: "rgba(255,255,255,0.72)", fontSize: "14px", lineHeight: 1.8 }}>
              <div>game_opened</div>
              <div>game_started</div>
              <div>game_over</div>
              <div>ad_clicked</div>
              <div>wallpaper_changed</div>
              <div>score_saved</div>
            </div>
          </div>
        </aside>
      </div>

      {showGameOverModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(3, 8, 20, 0.74)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9999,
            animation: "fadeInOverlay 0.25s ease",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "380px",
              borderRadius: "28px",
              padding: "24px",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              textAlign: "center",
              animation: "popInCard 0.28s ease",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: "12px",
                fontWeight: 700,
                marginBottom: "14px",
              }}
            >
              Leylix Games
            </div>

            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                lineHeight: 1.1,
                color: "white",
              }}
            >
              Game Over
            </div>

            <div
              style={{
                marginTop: "10px",
                color: "rgba(255,255,255,0.75)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Keine weiteren Elemente mehr möglich. Möchtest du direkt neu starten oder später weitermachen?
            </div>

            {/* SCORE + BEST */}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginTop: "18px",
  }}
>
  <div
    style={{
      borderRadius: "18px",
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "12px",
      textAlign: "left",
    }}
  >
    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
      Score
    </div>
    <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px" }}>
      {score}
    </div>
  </div>

  <div
    style={{
      borderRadius: "18px",
      background: "rgba(0,0,0,0.18)",
      border: "1px solid rgba(255,255,255,0.08)",
      padding: "12px",
      textAlign: "left",
    }}
  >
    <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
      Best
    </div>
    <div style={{ fontSize: "20px", fontWeight: 800, marginTop: "4px" }}>
      {bestScore}
    </div>
  </div>
</div>

{/* EVENT CARD */}
<div
  style={{
    marginTop: "18px",
    borderRadius: "22px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
    textAlign: "left",
  }}
>
  <div
    style={{
      width: "100%",
      height: "140px",
      backgroundImage: "url('/sponsors/sponsor-1/poster.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  />

  <div style={{ padding: "14px" }}>
    <div style={{ fontSize: "16px", fontWeight: 800 }}>
      Fight Night Euskirchen
    </div>

    <div
      style={{
        marginTop: "6px",
        fontSize: "13px",
        color: "rgba(255,255,255,0.7)",
      }}
    >
      24. Juni • Euskirchen
    </div>

    <a
  href="https://event-backend.leylix.com/api/user/share-event?eventDetailsModuleType=homeClassEvent&eventId=69d046ccff337f37e0c4fbcb"
  target="_blank"
  rel="noreferrer"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: "13px",
    color: "white",
    background: "linear-gradient(90deg, #f59e0b, #f97316)",
    textDecoration: "none",
    boxSizing: "border-box",
  }}
>
  Event ansehen
</a>
  </div>
</div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginTop: "18px",
              }}
            >
              <button
                onClick={closeGameOverModal}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.14)",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "white",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                Später
              </button>

              <button
                onClick={restartGameNow}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "18px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 800,
                  fontSize: "15px",
                  color: "white",
                  background: "linear-gradient(90deg, #7c3aed, #9333ea)",
                  boxShadow: "0 12px 30px rgba(124,58,237,0.28)",
                }}
              >
                Neustart
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        borderRadius: "18px",
        background: "rgba(0,0,0,0.22)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "12px",
      }}
    >
      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>{label}</div>
      <div style={{ fontSize: "20px", fontWeight: 700, marginTop: "4px" }}>{value}</div>
    </div>
  );
}

function MiniMatrix({ piece }: { piece: Piece | null }) {
  if (!piece) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${piece.matrix[0].length}, 18px)`,
        gap: "4px",
      }}
    >
      {piece.matrix.flatMap((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "4px",
              background: cell ? getColorById(piece.id) : "rgba(255,255,255,0.05)",
            }}
          />
        ))
      )}
    </div>
  );
}

function Tag({ text }: { text: string }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.08)",
        fontSize: "12px",
      }}
    >
      {text}
    </span>
  );
}

const btnStyle: React.CSSProperties = {
  background: "linear-gradient(90deg, #6d28d9, #9333ea)",
  color: "white",
  border: "none",
  padding: "12px 18px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 700,
};

const btnSecondaryStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "12px 18px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 700,
};

const iconBtnStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  cursor: "pointer",
};

const touchBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.1)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
  padding: "12px",
  borderRadius: "16px",
  cursor: "pointer",
  fontWeight: 700,
};

const panelStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  padding: "16px",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "10px",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.1)",
};
