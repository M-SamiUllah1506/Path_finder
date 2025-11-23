# Path Finder

Path Finder is a small React project that provides interactive graph algorithm visualizations and a logistics dashboard for experimenting with routing and pathfinding.

## Quick start

Install dependencies and run the dev server:

```bash
npm install
npm start
```

Open your browser to `http://localhost:3000`.

## What’s included

- Visualizer: interactive graph canvas to add nodes/edges and run BFS, DFS, and Dijkstra with animated traversal.
- Logistics Dashboard: sample geographic graph, route computation, and vehicle animation for routes.
- Landing page with onboarding, help modal, and smooth view transitions.

## Notes about algorithms

- Only BFS, DFS and Dijkstra are available. BFS/DFS perform unweighted graph traversals and will ignore edge weights; use Dijkstra to compute shortest paths that respect edge weights.

## Recent changes

- Removed A* and Nearest-Neighbor algorithms to streamline the project and focus on BFS, DFS, and Dijkstra.
- Added onboarding overlay and a floating Help modal.
- Improved landing page styling, animations, and URL sync for views.

## Next steps (ideas)

- Add `react-router` for full routing and deep links.
- Replace the hero SVG with an illustration or Lottie animation.
- Add step-by-step onboarding tooltips for more guided tours.

If you'd like me to add any of these, tell me which one and I’ll implement it.
