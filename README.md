# Mini Study Viewer Assessment

This folder contains an intentionally problematic "Study Viewer" built with React + Recoil. It simulates loading study signals and rendering a basic chart. The code purposefully includes bad state management and performance pitfalls.

## Your Tasks

1. **Identify and explain the state-management problems**
2. **Propose an improved state model** (document your reasoning)
3. **Refactor to a modern approach** (implement your solution)

## What we evaluate

- Reasoning about state boundaries, performance, and readability
- Ability to explain trade-offs and justify choices
- Clean code and architectural thinkin

## How to run

```bash
yarn install
yarn start
```

Then open `http://localhost:3000` in your browser.

## Success Criteria

Your refactored solution should:

1. **Eliminate memory leaks** - Demonstrate that cleanup is working properly
2. **Reduce unnecessary re-renders** - Components should only re-render when their data actually changes
3. **Fix data integrity issues** - Ensure the app displays correct data even when interactions happen rapidly
4. **Improve maintainability**

As a bonus task, you can:

- Increase the number of data points in one or more signals
  (e.g. HR / SpO2) to 10,000+ samples.
- Make the UI remain smooth when:
  - Toggling signals on/off
  - Changing the time window / zoom
  - Polling for new events

You are free to choose the strategy, for example:

- Virtualizing / windowing the data you actually render
- Downsampling / decimating points for visualization
- Using a more efficient drawing strategy (e.g. canvas instead of mapping thousands of SVG `<path>` segments)

If you do this, please add a short note in your README explaining:

- What you changed
- Why you chose that approach
- How it improves performance
