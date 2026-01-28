# AI KPI Dashboard

A Next.js application for analyzing AI-tenant chat histories and displaying performance KPIs with an interactive dashboard.

## Features

- **File Upload**: Support for CSV and JSON chat history files
- **KPI Tracking**: Comprehensive metrics across 4 categories:
  - **Response Metrics**: Response time, message length, quality scores
  - **Conversation Metrics**: Resolution rate, satisfaction, duration
  - **Usage Metrics**: Total conversations, messages, active tenants
  - **AI Accuracy Metrics**: Turns to resolution
- **Interactive Dashboard**: Real-time visualizations with Recharts
- **Data Persistence**: PostgreSQL database with Prisma ORM
- **Railway Ready**: Pre-configured for one-click deployment

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Deployment**: Railway

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/marcodetering-prog/reimagined-fishstick.git
cd reimagined-fishstick
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/ai_kpi_dashboard"
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Railway

### Option 1: Deploy from GitHub

1. Push your code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add a PostgreSQL database:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway will automatically set the `DATABASE_URL` environment variable
6. Your app will build and deploy automatically!

### Option 2: Deploy with Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Add PostgreSQL database:
```bash
railway add
```
Select "PostgreSQL"

5. Deploy:
```bash
railway up
```

## Data Format

### CSV Format

```csv
conversation_id,tenant_id,timestamp,role,message,response_time_ms,resolved,satisfaction_score
conv_001,tenant_123,2024-01-15T10:00:00Z,tenant,"I need help",,,
conv_001,tenant_123,2024-01-15T10:00:02Z,ai,"Happy to help!",2000,true,4
```

### JSON Format

```json
[
  {
    "conversation_id": "conv_001",
    "tenant_id": "tenant_123",
    "timestamp": "2024-01-15T10:00:00Z",
    "role": "tenant",
    "message": "I need help"
  },
  {
    "conversation_id": "conv_001",
    "tenant_id": "tenant_123",
    "timestamp": "2024-01-15T10:00:02Z",
    "role": "ai",
    "message": "Happy to help!",
    "response_time_ms": 2000,
    "resolved": true,
    "satisfaction_score": 4
  }
]
```

### Required Fields

- `conversation_id`: Unique identifier for the conversation
- `tenant_id`: Identifier for the tenant/user
- `timestamp`: ISO8601 datetime string
- `role`: Either "ai" or "tenant"
- `message`: The message content

### Optional Fields

- `response_time_ms`: Response time in milliseconds
- `resolved`: Boolean indicating if conversation was resolved
- `satisfaction_score`: Rating from 1-5

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── upload/       # File upload endpoint
│   │   ├── kpis/         # KPI calculation endpoint
│   │   └── conversations/ # Conversations endpoint
│   ├── upload/           # Upload page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   └── FileUploader.tsx  # File upload component
├── lib/
│   ├── db.ts             # Prisma client
│   ├── kpi-calculator.ts # KPI calculation logic
│   ├── csv-parser.ts     # CSV/JSON parsing
│   └── utils.ts          # Utilities
├── prisma/
│   └── schema.prisma     # Database schema
└── railway.json          # Railway config
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (automatically set by Railway)
- `NODE_ENV` - Environment mode (development/production)

## License

MIT
