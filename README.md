# Enhanced React Lazy Loading Demo

Demo project showcasing an improved React lazy loading implementation that handles chunk loading failures in production environments.

## Overview

This demo accompanies my blog article about solving chunk loading issues in React SPAs. The enhanced lazy loading automatically handles:

- Chunk loading failures after deployments
- Automatic page reload with retry limits
- Network retry logic for temporary issues
- Transparent user experience

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

## Demo Features

### Chunk Simulator

Interactive chunk failure simulation to demonstrate the problem and solution in action.

### Test Routes

- `/` - Home page with standard lazy loading
- `/faile` - faile page that simulates chunk loading scenarios

## Usage Example

```javascript
import { createLazy } from "./tools/react-lazy";

// Enhanced lazy loading with automatic error handling
const LazyComponent = createLazy(() => import("./MyComponent"), {
  maxRetries: 3, // Reload attempts
  importRetries: 3, // Network retry attempts
  retryDelay: 300, // Delay between retries (ms)
});
```

## Article

This demo supports my blog article: **Lazy Loading React Amélioré**

---

_Built to demonstrate real-world solutions for production React applications._
