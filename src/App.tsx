import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Board } from './components/Board';
import { Controls } from './components/Controls';
import { SolvedScreen } from './components/SolvedScreen';
import { Modal } from './components/Modal';
import { generatePuzzle } from './logic/generator';
import { findForcedMove } from './logic/solver';
import { checkWinCondition, cloneGrid, validateBoard } from './logic/utils';
import { Grid, Difficulty, Relation, GameState, Coords } from './types';
import { EMPTY, SUN, MOON } from './logic/constants';
import styles from './App.module.css';

const STORAGE_KEY = 'tango_unlimited_save';

function App() {
  const [size, setSize] = useState<number>(6);
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [grid, setGrid] = useState<Grid>([]);
  const [initialGrid, setInitialGrid] = useState<Grid>([]);
  const [relations, setRelations] = useState<Relation[]>([]);
  const [history, setHistory] = useState<Grid[]>([]);
  const [generating, setGenerating] = useState(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  
  // UI State
  const [hint, setHint] = useState<{coords: Coords, msg: string} | null>(null);
  const [lastMove, setLastMove] = useState<Coords | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [finalTime, setFinalTime] = useState<string>("");
  const [invalidCells, setInvalidCells] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Modal State
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Timer Display State
  const [currentTime, setCurrentTime] = useState<string>("0:00");
  // Fix: Initialize useRef with 0 to satisfy TypeScript requirement
  const timerRef = useRef<number>(0);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Timer Tick
  useEffect(() => {
    if (!isWon && !generating) {
      timerRef.current = window.setInterval(() => {
        setCurrentTime(formatTime(Date.now() - startTime));
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [startTime, isWon, generating]);

  // Load or Create Game
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: GameState = JSON.parse(saved);
        setSize(state.size);
        setDifficulty(state.difficulty);
        setGrid(state.grid);
        setInitialGrid(state.initialGrid);
        setRelations(state.relations);
        setHistory(state.history);
        setStartTime(state.startTime);
        setIsWon(state.isWon);
        setGenerating(false);
        if (state.finalTime) setFinalTime(state.finalTime);
        
        // Restore validation state
        if (!state.isWon) {
          const { invalidCells, error } = validateBoard(state.grid, state.relations);
          setInvalidCells(invalidCells);
          setErrorMessage(error);
        }
        return;
      } catch (e) {
        console.error("Failed to load save", e);
      }
    }
    startNewGame(size, difficulty);
  }, []);

  // Persist State
  useEffect(() => {
    if (grid.length === 0) return;
    const state: GameState = {
      size, difficulty, grid, initialGrid, relations, history, 
      startTime, isWon, finalTime
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [grid, initialGrid, relations, history, size, difficulty, startTime, isWon, finalTime]);

  const startNewGame = useCallback((sz: number, diff: Difficulty) => {
    setGenerating(true);
    setHint(null);
    setLastMove(null);
    setIsWon(false);
    setInvalidCells(new Set());
    setErrorMessage(null);
    setStartTime(Date.now());
    setCurrentTime("0:00");
    
    setTimeout(() => {
      try {
        const { grid: newGrid, relations: newRels } = generatePuzzle(sz, diff);
        setGrid(newGrid);
        setInitialGrid(cloneGrid(newGrid));
        setRelations(newRels);
        setHistory([]);
      } catch (e) {
        console.error(e);
        alert("Error generating puzzle. Please try again.");
      } finally {
        setGenerating(false);
      }
    }, 50);
  }, []);

  const handleCellClick = (r: number, c: number, isRightClick: boolean) => {
    if (isWon || grid[r][c] !== initialGrid[r][c] && initialGrid[r][c] !== EMPTY) return;
    if (initialGrid[r][c] !== EMPTY) return;

    const current = grid[r][c];
    let next = current;

    if (isRightClick) {
      if (current === EMPTY || current === SUN) next = MOON;
      else next = EMPTY;
    } else {
      if (current === EMPTY) next = SUN;
      else if (current === SUN) next = MOON;
      else next = EMPTY;
    }

    if (next === current) return;

    const newGrid = cloneGrid(grid);
    newGrid[r][c] = next;

    setHistory(prev => [...prev, grid]);
    setGrid(newGrid);
    setLastMove({r, c});
    setHint(null);

    // Validate
    const { invalidCells, error } = validateBoard(newGrid, relations);
    setInvalidCells(invalidCells);
    setErrorMessage(error);

    // Check Win (only if no errors and board is full)
    if (invalidCells.size === 0 && checkWinCondition(newGrid, relations)) {
      setIsWon(true);
      const wonTime = formatTime(Date.now() - startTime);
      setFinalTime(wonTime);
    }
  };

  const undo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setGrid(prev);
    setHistory(history.slice(0, -1));
    setHint(null);
    setLastMove(null);
    setIsWon(false);
    
    // Re-validate previous state
    const { invalidCells, error } = validateBoard(prev, relations);
    setInvalidCells(invalidCells);
    setErrorMessage(error);
  };

  const handleClearConfirm = () => {
    const clearedGrid = cloneGrid(initialGrid); // Reset to just initial
    // We want to keep any cells that were in the initial grid. 
    // The `initialGrid` variable already holds the locked state.
    // However, if we simply setGrid(initialGrid), we might lose reference if we strictly need a deep clone.
    
    // History needs to save current user state
    setHistory(prev => [...prev, grid]);
    setGrid(clearedGrid);
    setLastMove(null);
    setHint(null);
    setInvalidCells(new Set());
    setErrorMessage(null);
    setIsClearModalOpen(false);
  };

  const getHint = () => {
    const forced = findForcedMove(grid, relations);
    if (forced) {
      setHint({ coords: forced.cell, msg: `${forced.reason}` });
    } else {
      setHint({ coords: {r:-1, c:-1}, msg: "No immediate forced moves found. Check for errors or look ahead." });
    }
  };

  if (isWon) {
    return (
      <SolvedScreen 
        time={finalTime} 
        onPlayAgain={() => startNewGame(size, difficulty)} 
      />
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.header}>
        <h1>Tango Unlimited</h1>
        <div className={styles.timer}>{currentTime}</div>
      </div>
      
      <Controls 
        difficulty={difficulty}
        setDifficulty={(d) => { setDifficulty(d); startNewGame(size, d); }}
        size={size}
        setSize={(s) => { setSize(s); startNewGame(s, difficulty); }}
        onNewGame={() => startNewGame(size, difficulty)}
        onUndo={undo}
        onHint={getHint}
        onClear={() => setIsClearModalOpen(true)}
        canUndo={history.length > 0}
        hintMessage={hint ? hint.msg : null}
        errorMessage={errorMessage}
        generating={generating}
      />

      <Board 
        grid={grid}
        initialGrid={initialGrid}
        relations={relations}
        size={size}
        onCellClick={handleCellClick}
        hintCell={hint ? hint.coords : null}
        lastMove={lastMove}
        invalidCells={invalidCells}
      />

      <Modal 
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearConfirm}
        title="Clear game board"
        message="Are you sure you want to clear the board?"
        confirmLabel="Clear"
      />

      <div className={styles.footer}>
        Tango clone built with React & Vite. No trackers, runs locally.
      </div>
    </div>
  );
}

export default App;