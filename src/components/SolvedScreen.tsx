import React from 'react';
import styles from './SolvedScreen.module.css';

interface SolvedScreenProps {
  time: string;
  onPlayAgain: () => void;
}

export const SolvedScreen: React.FC<SolvedScreenProps> = ({ time, onPlayAgain }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.icon}>☀️🌙</div>
        <h1 className={styles.title}>You're crushing it!</h1>
        <p className={styles.subtitle}>Solved in {time}</p>
        <button className={styles.button} onClick={onPlayAgain}>
          Play Again
        </button>
      </div>
    </div>
  );
};