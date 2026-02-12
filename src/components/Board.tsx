import React from 'react';
import { Grid, Relation, RelationType, CellValue, Coords } from '../types';
import { SUN, MOON, EMPTY } from '../logic/constants';
import styles from './Board.module.css';

interface BoardProps {
    grid: Grid;
    initialGrid: Grid;
    relations: Relation[];
    size: number;
    onCellClick: (r: number, c: number, isRightClick: boolean) => void;
    hintCell: Coords | null;
    lastMove: Coords | null;
    invalidCells: Set<string>;
}

const SunIcon = () => (
    <svg viewBox="0 0 100 100" className={styles.icon}>
        <circle cx="50" cy="50" r="25" fill="#FFA500" />
        <g stroke="#FFA500" strokeWidth="8">
            <line x1="50" y1="10" x2="50" y2="90" />
            <line x1="10" y1="50" x2="90" y2="50" />
            <line x1="22" y1="22" x2="78" y2="78" />
            <line x1="22" y1="78" x2="78" y2="22" />
        </g>
    </svg>
);

const MoonIcon = () => (
    <svg viewBox="0 0 100 100" className={styles.icon}>
        <path d="M70 20 A 35 35 0 1 0 70 80 A 25 25 0 1 1 70 20" fill="#4682B4" />
    </svg>
);

export const Board: React.FC<BoardProps> = ({
    grid, initialGrid, relations, size, onCellClick, hintCell, lastMove, invalidCells
}) => {
    // Calculate cell size based on viewport to keep it responsive
    const cellSize = Math.min(60, 400 / size);

    const handleContext = (e: React.MouseEvent, r: number, c: number) => {
        e.preventDefault();
        onCellClick(r, c, true);
    };

    return (
        <div className={styles.boardContainer}>
            <div
                className={styles.grid}
                style={{
                    gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
                    gridTemplateRows: `repeat(${size}, ${cellSize}px)`
                }}
                onContextMenu={(e) => e.preventDefault()}
            >
                {grid.map((row, r) =>
                    row.map((val, c) => {
                        const isLocked = initialGrid[r][c] !== EMPTY;
                        const isHint = hintCell?.r === r && hintCell?.c === c;
                        const isLast = lastMove?.r === r && lastMove?.c === c;
                        const isInvalid = invalidCells.has(`${r}-${c}`);

                        return (
                            <div
                                key={`${r}-${c}`}
                                className={`
                  ${styles.cell} 
                  ${isLocked ? styles.locked : ''} 
                  ${(isHint || isLast) ? styles.highlight : ''}
                  ${isInvalid ? styles.error : ''}
                `}
                                onClick={() => !isLocked && onCellClick(r, c, false)}
                                onContextMenu={(e) => !isLocked && handleContext(e, r, c)}
                                style={{ width: cellSize, height: cellSize }}
                            >
                                {val === SUN && <SunIcon />}
                                {val === MOON && <MoonIcon />}
                            </div>
                        );
                    })
                )}

                {relations.map((rel, idx) => {
                    const gap = 2;
                    const totalCell = cellSize + gap;

                    let top, left;
                    if (rel.vertical) {
                        top = (rel.r + 1) * totalCell - gap / 2 - 8;
                        left = rel.c * totalCell + cellSize / 2 - 8;
                    } else {
                        top = rel.r * totalCell + cellSize / 2 - 8;
                        left = (rel.c + 1) * totalCell - gap / 2 - 8;
                    }

                    return (
                        <div
                            key={`rel-${idx}`}
                            className={styles.relation}
                            style={{ top: `${top}px`, left: `${left}px` }}
                        >
                            {rel.type === RelationType.Equal ? '=' : '×'}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};