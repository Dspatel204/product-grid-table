# ProductHub

A professional sales and inventory management dashboard built with React 19, TypeScript, and Tailwind CSS. ProductHub provides a modern, elegant interface for browsing, editing, and managing product catalogs with real-time search, sorting, pagination, and bulk operations.

![React](https://img.shields.io/badge/React-19.2.7-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-~6.0.2-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3.3-06b6d4?logo=tailwindcss)
![Vite](https://img.shields.io/badge/Vite-8.1.1-646cff?logo=vite)

## Features

### Product Management
- **Dual View Modes** - Switch between responsive table and grid card views
- **Inline Editing** - Edit product fields directly in the grid with real-time validation
- **Row-Level Edit Mode** - Click any table row to edit all fields at once
- **Bulk Operations** - Select multiple products for bulk delete operations
- **Row-Level Save** - Save individual product changes instantly
- **Batch Save** - Save all pending edits at once with one click

### Sales & Inventory
- **Rich Product Cards** - Display product images, prices, discounts, ratings, stock levels, and availability
- **Discount Badges** - Visual discount percentage indicators on products
- **Stock Management** - Track inventory with low-stock warnings
- **Star Ratings** - Visual product rating display
- **CSV Export** - Download product data for external analysis

### Search & Filter
- **Real-time Search** - Debounced search across product names, brands, and categories
- **Multi-field Sorting** - Sort by title, price, discount, rating, stock, and more
- **Filter Chips** - Visual active filter indicators with quick clear options
- **Column Visibility** - Toggle table columns on/off for custom views
- **Pagination** - 12 products per page with smooth navigation

### Professional Design
- **Dark Mode** - Full dark mode support with smooth transitions
- **Responsive Layout** - Optimized for desktop, tablet, and mobile screens
- **Skeleton Loading** - Elegant loading states for both table and grid views
- **Micro-interactions** - Hover effects, transitions, and visual feedback
- **Accessibility** - Semantic HTML and keyboard navigation support

## Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.7 | UI framework |
| TypeScript | ~6.0.2 | Type safety |
| Tailwind CSS | 4.3.3 | Styling |
| Vite | 8.1.1 | Build tool |
| Lucide React | 1.25.0 | Icons |

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── VirtualizedGrid.tsx    # High-performance virtualized table
│   ├── GridView.tsx           # Responsive card-based product grid
│   ├── Toolbar.tsx            # Search, sort, and action toolbar
│   ├── FilterChips.tsx        # Active filter indicators
│   ├── ColumnToggle.tsx       # Column visibility controls
│   ├── StatusBar.tsx          # Results count and selection info
│   ├── BulkActions.tsx        # Bulk operation toolbar
│   └── EmptyState.tsx         # Empty results placeholder
├── hooks/
│   └── useProductFetch.ts     # Data fetching with caching and debouncing
├── utils/
│   └── validation.ts          # Field validation rules
├── types.ts                   # TypeScript interfaces and types
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
└── index.css                  # Global styles and design tokens
```

## Key Design Decisions

### State Management
- Edit state is keyed by `product.id` rather than row index to prevent data loss during virtualization
- Local state is used for simplicity, with refs tracking previous filter states
- `Set<number>` used for efficient selection tracking

### Virtualization
- Custom lightweight virtualizer renders only visible rows plus a 2-row buffer
- Uses CSS `translateY` transforms for smooth scrolling performance
- Maintains 60fps performance with large datasets
- Horizontal scroll support for responsive table view

### Caching
- API responses are cached using a `Map` with serialized request parameters as keys
- Cache limit of 10 entries with FIFO eviction
- In-flight requests are cancelled when new filters are applied

### Validation
- Real-time field validation with type-specific rules
- Visual error indicators with smooth animations
- Price validation with decimal precision checks
- Stock validation with integer constraints

## API Integration

This project uses [DummyJSON](https://dummyjson.com/) as a mock API for demonstration purposes. The API provides:
- Product search and filtering
- Pagination support
- Product update endpoints (PUT)
- Realistic product data with images, categories, and reviews

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## License

MIT
