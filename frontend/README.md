# NetResearch Frontend

**NetResearch** is an AI-powered research network visualization platform that helps researchers discover collaboration opportunities by exploring connections between academics, papers, and institutions through an interactive 3D knowledge graph.

## Project Overview

NetResearch consists of two separate repositories:
- **Frontend** (this repository): React-based web interface with 3D graph visualization
- **Backend**: FastAPI-based server handling AI agent orchestration, paper search, and data processing

The frontend provides an intuitive interface where users can:
- Ask natural language questions about research topics
- Visualize real-time AI reasoning steps as the agent processes queries
- Explore an interactive 3D network graph of researchers and their connections
- View detailed researcher profiles with publications, citations, and contact information
- Generate personalized collaboration emails with AI assistance
- Chat with an AI assistant about specific researchers

## Key Features

- **AI-Powered Research Discovery**: Natural language queries to find relevant researchers and papers
- **Real-Time Reasoning Visualization**: Watch the AI agent's thought process as it filters topics, searches papers, and extracts researchers
- **Interactive 3D Graph**: Force-directed network visualization using Three.js and react-force-graph-3d
- **Researcher Profiles**: Detailed information including publications, citations, h-index, and contact details
- **Smart Email Generation**: Context-aware email drafting for collaboration requests
- **Research History**: Access and revisit past searches and network graphs
- **CV Upload**: Personalize recommendations by uploading your CV

## Project Structure

```
netresearch-frontend/
├── src/
│   ├── components/           # React components
│   │   ├── GraphVisualization.tsx    # 3D graph rendering
│   │   ├── ReasoningConsole.tsx      # AI reasoning steps display
│   │   ├── PastRunsSidebar.tsx       # Search history sidebar
│   │   └── ui/                       # shadcn/ui components
│   ├── pages/                # Page components
│   │   ├── Index.tsx                 # Main application page
│   │   └── NotFound.tsx              # 404 page
│   ├── services/             # API integration
│   │   └── api.ts                    # Backend API calls
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── App.tsx               # Root component
│   └── main.tsx              # Application entry point
├── public/                   # Static assets
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── package.json             # Dependencies and scripts
```

## Tech Stack

### Core Framework
- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components built on Radix UI
- **Lucide React** - Icon library

### 3D Visualization
- **Three.js** - 3D graphics library
- **react-force-graph-3d** - Force-directed graph visualization
- **three-spritetext** - Text labels in 3D space

### State Management & Data Fetching
- **TanStack Query (React Query)** - Server state management
- **React Router** - Client-side routing

### Form Handling
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Installation & Setup

### Prerequisites
- Node.js 18+ or Bun
- npm/yarn/bun package manager
- Backend server running (see backend repository)

### Environment Variables

Create a `.env` file in the root directory:

```env
# Local Development
VITE_API_URL=/api
```

For production deployment, create `.env.production`:

```env
# Production
VITE_API_URL=https://your-backend-url.com
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd netresearch-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

   The application will be available at `http://localhost:8080`

4. **Ensure backend is running**

   The backend should be running on `http://localhost:8000`. The frontend uses a Vite proxy to forward `/api/*` requests to the backend, avoiding CORS issues during development.

### Build for Production

```bash
npm run build
# or
bun run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
# or
bun preview
```

## Usage Guide

### 1. Starting a Research Discovery

1. **Optional: Upload Your CV**
   - Click "Upload CV Context" in the header
   - Select a PDF file containing your CV
   - This personalizes the researcher recommendations

2. **Optional: Enter Your Name**
   - Type your name in the input field
   - Click "Save" to persist it for future sessions

3. **Enter Your Research Query**
   - Type a natural language question (e.g., "Who works on Diffusion Models in Europe?")
   - Adjust "Max Connections" (3-20 nodes) to control graph size
   - Click "Start Discovery" or press Enter

### 2. Watching the AI Reasoning Process

The **Reasoning Console** displays real-time steps:
- **Understanding Intent**: AI interprets your question
- **Extracting Filters**: Identifies topics, geographical areas, and institutions
- **Searching Papers**: Finds relevant academic publications
- **Extracting Researchers**: Identifies professors from papers
- **Building Relationships**: Maps connections between researchers
- **Generating Graph**: Creates the final network visualization

Each step auto-expands when active, showing detailed information like discovered papers, researchers, and filters.

### 3. Exploring the 3D Network Graph

Once complete, you'll see an interactive 3D graph:
- **User Node**: You (center, gray)
- **Professor Nodes**: Researchers (blue spheres)
- **Institution Nodes**: Research labs/universities (teal spheres)
- **Links**: Relationships with explanatory labels

**Interactions:**
- **Rotate**: Click and drag
- **Zoom**: Scroll wheel
- **Select Node**: Click on any professor/institution
- **View Relationship**: Click on connection lines

### 4. Viewing Researcher Details

Click any professor node to open a detailed sidebar showing:
- Name, institution, and description
- Statistics (works count, citations, h-index)
- Contact information (email, website, ORCID)
- Publications with abstracts
- **AI Chat**: Ask questions about the researcher
- **Email Generation**: Draft collaboration emails

### 5. Accessing Past Searches

The **Past Runs Sidebar** (left side) shows your search history:
- Click any past search to instantly reload that network graph
- Queries are saved in the backend database

### 6. Starting a New Search

Click **"New Search"** in the graph view to return to the main page and start over.

## API Integration

The frontend communicates with the backend through these main endpoints:

- `POST /api/agent/run` - Start a new research discovery
- `GET /api/agent/status/{run_id}` - Poll for agent progress
- `GET /api/agent/runs` - Fetch search history
- `GET /api/agent/run/{run_id}` - Load a specific past search
- `POST /api/cv/upload` - Upload CV file
- `POST /api/name` - Save user name
- `GET /api/user` - Get user data
- `POST /api/email/generate` - Generate collaboration email
- `POST /api/chat/message` - Chat with AI about a researcher

See `backend_endpoints.md` for detailed API documentation.

## Development Notes

### Proxy Configuration

The Vite dev server is configured to proxy `/api/*` requests to `http://localhost:8000/*` to avoid CORS issues:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

### Type Definitions

TypeScript interfaces for API responses are defined in `src/services/api.ts`:
- `GraphData`, `GraphNode`, `GraphLink` - Graph structure
- `StepLog`, `AgentStatusResponse` - Reasoning steps
- `Paper`, `Contact`, `Institution` - Research entities

### Component Architecture

- **Index.tsx**: Main page orchestrating search flow
- **ReasoningConsole.tsx**: Polls backend and displays AI steps
- **GraphVisualization.tsx**: Renders 3D graph with Three.js
- **PastRunsSidebar.tsx**: Displays and loads search history

## Troubleshooting

### CORS Errors
- Ensure the backend is running on port 8000
- Check that `vite.config.ts` proxy is configured correctly
- Restart the dev server after changing proxy settings

### 3D Graph Not Rendering
- Check browser console for Three.js errors
- Ensure GPU/WebGL is enabled in your browser
- Try disabling browser extensions that might block WebGL

### Backend Connection Issues
- Verify backend is running: `curl http://localhost:8000/api/user`
- Check network tab in browser DevTools for failed requests
- Ensure environment variables are set correctly

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Update dependencies: `npm update`

## Contributing

When contributing to this project:
1. Follow the existing TypeScript/React patterns
2. Use shadcn/ui components for consistency
3. Maintain type safety - avoid `any` types
4. Test 3D graph interactions across browsers
5. Ensure responsive design works on mobile

## Acknowledgments

Built with:
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Three.js](https://threejs.org/)
- [react-force-graph-3d](https://github.com/vasturiano/react-force-graph-3d)
