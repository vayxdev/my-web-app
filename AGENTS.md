# AGENTS.md

## Essential Commands

```bash
npm run dev          # Start Vite development server
npm run build        # Build production bundle (runs tsc + vite build)
npm run preview      # Preview production build locally
npm run lint         # Run ESLint with strict settings (0 max warnings)
```

**Note:** This project does not currently have a test framework configured. Before adding tests, consult with the team to determine the appropriate testing setup (e.g., Vitest, Jest, React Testing Library).

## Code Style Guidelines

### TypeScript & React Configuration

- **TypeScript strict mode is enabled** - All code must pass type checking
- **Unused code is not allowed** - `noUnusedLocals` and `noUnusedParameters` are enforced
- **Use explicit types** for props, interfaces, and function returns
- **ESLint must pass** with 0 warnings before committing

### Component Structure

All components must be **functional components** with `React.FC` type annotation:

```tsx
import React from 'react';

interface ComponentProps {
  title: string;
  onClick: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onClick }) => {
  return <button onClick={onClick}>{title}</button>;
};

export default Component;
```

### Import Conventions

1. **React imports first**, separated by blank line from third-party imports
2. **Third-party imports** next, alphabetically grouped
3. **Local imports** last, separated by blank line from third-party
4. **No unused imports** - ESLint will catch these

```tsx
import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { pinyin } from 'pinyin-pro';

import AnalogClock from './analogClock';
import EventLogger from './eventLogger';
```

### Naming Conventions

- **Components:** PascalCase (`EventLogger`, `AnalogClock`)
- **Functions/Variables:** camelCase (`handleInputChange`, `addEvent`)
- **Interfaces/Types:** PascalCase, descriptive names (`Event`, `GoogleAnalyticsProps`)
- **Constants:** UPPER_SNAKE_CASE for global constants (rarely used)
- **Files:** PascalCase for components, camelCase for utilities

### State Management

Use **React hooks** for all state management:

```tsx
const [value, setValue] = useState<string>('');
const [data, setData] = useState<Data[]>([]);
const ref = useRef<HTMLDivElement>(null);

useEffect(() => {
  // Side effects here
  return () => cleanup();
}, [dependencies]);
```

### Error Handling

Always use **try-catch** for async operations and provide user feedback:

```tsx
try {
  const result = await someAsyncOperation();
  setData(result);
} catch (error) {
  console.error('Operation failed:', error);
  setErrors({ field: 'Operation failed' });
}
```

### Styling Guidelines

This project uses a **hybrid styling approach**:

1. **Tailwind CSS** for layout, spacing, and utility classes (preferred)
2. **Inline style objects** for dynamic values and complex CSS
3. **Separate CSS files** for global styles (index.css, tailwind.css)

```tsx
// Tailwind preferred for static styles
<div className="flex flex-col items-center p-4 space-y-4">

// Inline styles for dynamic values
<div style={{ width: dynamicWidth, height: '100px' }}>

// Define style objects for complex CSS
const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  padding: '24px',
  background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
};
```

### SEO & Meta Tags

**All page components** must include react-helmet for SEO:

```tsx
<Helmet>
  <title>Page Title - App Name | Description</title>
  <meta name="description" content="Brief description for SEO" />
  <meta name="keywords" content="keyword1, keyword2, keyword3" />
  <meta name="author" content="WW93" />
  <meta property="og:title" content="Page Title" />
  <meta property="og:description" content="Open Graph description" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://ww93.com/page-path" />
  <link rel="canonical" href="https://ww93.com/page-path" />
</Helmet>
```

### Type Safety Rules

- **Never use `any`** unless absolutely necessary (prefer `unknown`)
- **Declare global interfaces** for window extensions:
```tsx
declare global {
  interface Window {
    customGlobal: any;
  }
}
```
- **Use proper event types:** `React.ChangeEvent<HTMLInputElement>`, `React.MouseEvent<HTMLButtonElement>`
- **Define prop interfaces** for all components

### Accessibility & Chinese Support

- Use semantic HTML elements
- Provide `aria-label` for icon-only buttons
- Test Chinese character rendering for language-related features
- Use proper regex for Chinese characters: `/[\u4e00-\u9fa5]/`

### File Organization

- Place components in `src/` directory
- Keep component styles with the component (inline or Tailwind)
- Export default for main component
- Import React at the top of every component file

### Before Committing

1. Run `npm run lint` - must pass with 0 warnings
2. Run `npm run build` - must complete successfully
3. Ensure all TypeScript types are correct
4. Verify no console errors in browser
5. Test all interactive features

### Project-Specific Notes

- Uses **Vite** as build tool (not Create React App)
- **No test framework** currently configured - add tests only when requested
- Uses **lucide-react** for icons
- Uses **hanzi-writer** for Chinese character animations
- Uses **pinyin-pro** for pinyin conversion
- Uses **react-helmet** for SEO meta tags
- All page routes are defined in `src/index.tsx`
