import React from 'react';
import { Difficulty } from '../types';
import styles from './Controls.module.css';

interface ControlsProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  size: number;
  setSize: (s: number) => void;
  onNewGame: () => void;
  onUndo: () => void;
  onHint: () => void;
  onClear: () => void;
  canUndo: boolean;
  hintMessage: string | null;
  errorMessage: string | null;
  generating: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  difficulty, setDifficulty, size, setSize, onNewGame, onUndo, onHint, onClear, 
  canUndo, hintMessage, errorMessage, generating
}) => {
  return (
    <div className={styles.controls}>
      <div className={styles.bar}>
        <div className={styles.group}>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={generating}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select 
            value={size} 
            onChange={(e) => setSize(Number(e.target.value))}
            disabled={generating}
          >
            {[4, 6, 8, 10, 12].map(n => (
              <option key={n} value={n}>{n}x{n}</option>
            ))}
          </select>
        </div>
        <button className={styles.primary} onClick={onNewGame} disabled={generating}>
          {generating ? 'Generating...' : 'New Game'}
        </button>
      </div>

      <div className={styles.bar}>
        <div className={styles.group}>
          <button onClick={onUndo} disabled={!canUndo || generating}>Undo</button>
          <button onClick={onHint} disabled={generating}>Hint</button>
        </div>
        <button onClick={onClear} disabled={generating}>Clear</button>
      </div>

      {hintMessage && <div className={styles.hintText}>{hintMessage}</div>}
      {errorMessage && <div className={styles.errorText}>{errorMessage}</div>}
    </div>
  );
};