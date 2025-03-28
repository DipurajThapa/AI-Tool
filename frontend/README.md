# AI Business Agent Frontend

This is the frontend application for the AI Business Agent platform, built with Next.js, TypeScript, and Material-UI.

## Features

- Modern and responsive UI with Material-UI components
- Type-safe development with TypeScript
- Authentication and authorization
- Protected routes with middleware
- State management with Zustand
- Form handling with React Hook Form
- API integration with Axios
- Real-time updates with React Query
- Beautiful charts with Chart.js
- Toast notifications with react-hot-toast

## Prerequisites

- Node.js 16.x or later
- npm 7.x or later

## Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add the following environment variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_APP_NAME=AI Business Agent
   NEXT_PUBLIC_APP_DESCRIPTION=AI-powered business management platform
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Next.js pages
│   ├── services/      # API services
│   ├── stores/        # Zustand stores
│   ├── theme/         # Material-UI theme configuration
│   └── types/         # TypeScript type definitions
├── public/            # Static assets
├── .env.local         # Environment variables
├── .gitignore         # Git ignore rules
├── babel.config.js    # Babel configuration
├── jsconfig.json      # JavaScript configuration
├── next.config.js     # Next.js configuration
├── package.json       # Project dependencies
└── tsconfig.json      # TypeScript configuration
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 