## 🛠️ Tech Stack

| Category        | Technology  |
| --------------- | ----------- |
| Framework       | React 18    |
| Bundler         | Vite        |
| Language        | TypeScript  |
| Styling         | TailwindCSS |
| Package Manager | pnpm        |

## 📂 Folder & File Naming

| Type                  | Convention | Example                         |
| --------------------- | ---------- | ------------------------------- |
| Folder                | lowercase  | `home`, `layout`                |
| React Component File  | PascalCase | `Header.tsx`, `UserCard.tsx`    |
| Utility / Helper File | camelCase  | `formatDate.ts`, `fetchData.ts` |
| Interface / Type File | PascalCase | `Home.ts`, `My.ts`              |

> **Tip:** Each folder should contain an `index.ts` to re-export components or modules.

## 🎨 Styling Rules

- TailwindCSS is the main styling tool.
- Use semantic class combinations and avoid excessive inline styles.
- Define theme variables (colors, fonts) in index.css under :root.
- Keep component-specific custom styles in dedicated CSS files only if necessary.

Example:

```js
<div className="flex flex-col items-center p-6 bg-main rounded-2xl shadow-md">
  <h1 className="text-2xl font-bold text-main">Welcome</h1>
</div>
```

## 🧹 Code Quality Guidelines

- Keep functions pure whenever possible.
- Limit component files to <150 lines — split large logic into smaller hooks/components.
- Avoid deeply nested JSX.
- Comment only why, not what.

Example:

```js
// ❌ Bad: explains what
// Increase count by one when clicked
setCount(count + 1);

// ✅ Good: explains why
// Needed to trigger re-render for latest user input
setCount((prev) => prev + 1);
```

## 🚀 Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev
```
