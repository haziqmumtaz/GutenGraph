# GutenGraph — Book Meta (Frontend)

A simple React TypeScript frontend for fetching and displaying Project Gutenberg book metadata.

## Quick Start

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` to set `VITE_API_BASE_URL` to your backend URL (e.g., `http://localhost:8080`)

3. **Start development server:**

   ```bash
   pnpm dev
   ```

4. **Open the app:**
   Visit `http://localhost:5173` in your browser

## Usage

- Enter a Project Gutenberg book ID in the input field
- Press Enter or click "Fetch" to retrieve metadata
- Book information will be displayed in a card format

### Example Book IDs

- **Hamlet:** 1524
- **Romeo & Juliet:** 1112

## API Integration

The app calls:

```
GET {VITE_API_BASE_URL}/getBookMetaData?book_id=<ID>
```

Expected response format:

```json
{
  "id": "1524",
  "title": "Hamlet",
  "author": "William Shakespeare",
  "...": "additional fields"
}
```

## CORS Configuration

Ensure your backend allows this frontend origin for cross-origin requests.

## Build for Production

```bash
pnpm build
```

The built files will be in the `dist/` directory.
