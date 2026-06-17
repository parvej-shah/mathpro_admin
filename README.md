# Math Pro Admin Client

Modern admin dashboard for the Math Pro platform built with Next.js 16, React 19, TypeScript, and shadcn/ui.

## 🚀 Tech Stack

- **Framework:** Next.js 16.1.0 (App Router)
- **React:** 19.2.3
- **TypeScript:** 5.9.3 (strict mode)
- **UI Library:** shadcn/ui (Radix UI + Tailwind CSS)
- **State Management:** TanStack Query (React Query) + Zustand
- **Form Handling:** React Hook Form
- **Styling:** Tailwind CSS 3.4
- **Build Tool:** Next.js default bundler

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS credentials (for S3 uploads)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://api.mathpro.com

# AWS S3 Configuration (for direct uploads)
NEXT_PUBLIC_AWS_BUCKET_NAME=your-bucket-name
NEXT_PUBLIC_AWS_REGION=ap-south-1
NEXT_PUBLIC_AWS_ACCESS_KEY_ID=your-access-key
NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=your-secret-key

# Other Configuration
NEXT_PUBLIC_SECRET_KEY_QUIZ=your-quiz-secret-key
```

## 📁 Project Structure

```
admin-client-mathpro/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/      # Dashboard routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── services/             # API service functions
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

The `vercel.json` file is configured for automatic deployment.

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway
- Self-hosted (Node.js server)

## 📝 Available Scripts

- `npm run dev` - Start development server on port 5174
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Features

- ✅ Modern UI with shadcn/ui components
- ✅ Dark/Light theme support
- ✅ Responsive design
- ✅ Type-safe with TypeScript
- ✅ Course management (CRUD)
- ✅ Module/chapter management
- ✅ User management
- ✅ Analytics dashboard
- ✅ Real-time updates with React Query
- ✅ Form validation
- ✅ Image uploads to S3

## 📚 Documentation

See the `docs/` directory for detailed documentation:
- Migration plan and upgrade status
- API integration guides
- Best practices

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run lint` and `npm run type-check`
4. Submit a pull request

v1
