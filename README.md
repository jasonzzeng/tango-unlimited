# Tango Unlimited

A logic-based puzzle game inspired by LinkedIn’s Tango — rebuilt from scratch with unlimited generation, adjustable difficulty, and customizable grid sizes.

# Live Demo:
[https://jasonzzeng.github.io/tango-unlimited/](https://jasonzzeng.github.io/tango-unlimited/)

---

## About

Tango Unlimited is a full-stack front-end puzzle engine that:

* Generates valid boards algorithmically
* Guarantees a unique solution
* Supports multiple difficulty levels
* Allows customizable board sizes (4x4 → 12x12)
* Includes an intelligent hint system
* Detects errors in real-time without disrupting layout
* Tracks solve time and displays a completion screen

This project was built to demonstrate:

* Advanced logic constraint solving
* Backtracking algorithms
* Deterministic puzzle generation
* State management in React
* Clean UI architecture
* Automated CI deployment via GitHub Actions

---

## Features

* Rule-based deduction gameplay
* Unlimited puzzles
* Easy / Medium / Hard modes
* Adjustable grid sizes
* Smart hint engine
* Undo functionality
* Confirm-clear modal
* Completion screen with solve time
* Persistent save (localStorage)
* Auto-deployed to GitHub Pages

---

## ⚙ Tech Stack

* React
* TypeScript
* Vite
* CSS Modules
* GitHub Actions (CI/CD)

---

## 🛠 How It Works (High-Level)

1. Generate a valid completed grid via backtracking.
2. Add relational constraints (`=` and `×`) based on solution.
3. Remove cells while preserving uniqueness.
4. Enforce constraints dynamically during gameplay.
5. Validate win state in real-time.

---

## 📦 Run Locally

```bash
npm install
npm run dev
```

