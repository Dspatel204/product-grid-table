# Product Grid Documentation

### 1. How Edit State is Keyed
We keyed the edit state using unique `product.id` (e.g., `Record<number, EditState>`). Using row index would cause critical data pollution due to **Virtualization Dom Recycling** where rows are reused on scroll. Keying by IDs ensures the draft survives clean scrolling.

### 2. Cache Key Selection
The cache key is computed via `JSON.stringify(params)`, capturing `{ query, sortBy, order, category, skip }`. This matches exact network inputs ensuring accurate cached hits when navigating back and forth instantly.

### 3. Virtualization Approach
Built a lean state-driven virtualizer that tracks container's `scrollTop`. It renders only a computed visual window (plus 2 rows buffer buffer above/below) using CSS absolute translateY transforms, ensuring perfect 60fps performance over large dataset lists.

### 4. Given More Time
- Implement React Context or Zustand for cross-grid dirty row notifications.
- Complete individual cell field rollback escape keys.
- Add comprehensive inline multi-field visual error badges.