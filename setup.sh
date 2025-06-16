#!/bin/bash

# FlowFit Project Setup Script
echo "🏃‍♂️ Setting up FlowFit - Gamified Fitness with Crypto Rewards"
echo "================================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Create environment file
if [ ! -f .env ]; then
    echo "📝 Creating environment configuration..."
    cp .env.example .env
    echo "✅ Environment file created. Please update .env with your configuration."
else
    echo "⚠️  Environment file already exists"
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Setup contracts
echo "🔗 Setting up smart contracts..."
cd contracts
npm install

echo "🧪 Compiling contracts..."
npx hardhat compile

echo "🧪 Running contract tests..."
npx hardhat test

cd ..

# Setup frontend
echo "🎨 Setting up frontend..."
cd frontend
npm install

echo "🔧 Installing missing dependencies..."
npm install @tailwindcss/forms @tailwindcss/typography

cd ..

# Create missing directories
echo "📁 Creating project directories..."
mkdir -p backend/src
mkdir -p ai-agent/src
mkdir -p docs/assets
mkdir -p frontend/src/components/providers
mkdir -p frontend/src/lib
mkdir -p frontend/src/hooks

# Create TypeScript configuration for frontend
echo "⚙️  Setting up TypeScript configuration..."
cat > frontend/tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create PostCSS configuration
cat > frontend/postcss.config.js << EOF
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create a simple Flow provider component
mkdir -p frontend/src/components/providers
cat > frontend/src/components/providers/FlowProvider.tsx << EOF
'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import * as fcl from '@onflow/fcl'

interface FlowContextType {
  user: any
  logIn: () => void
  logOut: () => void
  loading: boolean
}

const FlowContext = createContext<FlowContextType>({
  user: null,
  logIn: () => {},
  logOut: () => {},
  loading: true
})

export const useFlow = () => useContext(FlowContext)

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Configure FCL
    fcl.config({
      'accessNode.api': process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_API || 'https://rest-testnet.onflow.org',
      'discovery.wallet': process.env.NEXT_PUBLIC_FLOW_DISCOVERY_WALLET || 'https://fcl-discovery.onflow.org/testnet/authn',
      'flow.network': process.env.NEXT_PUBLIC_FLOW_NETWORK || 'testnet'
    })

    // Subscribe to user changes
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    setLoading(false)

    return () => unsubscribe()
  }, [])

  const logIn = () => fcl.authenticate()
  const logOut = () => fcl.unauthenticate()

  return (
    <FlowContext.Provider value={{ user, logIn, logOut, loading }}>
      {children}
    </FlowContext.Provider>
  )
}
EOF

# Create gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
.next/
build/
dist/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Hardhat
contracts/cache/
contracts/artifacts/
contracts/node_modules/

# Logs
*.log

# Database
*.db
*.sqlite

# Temporary files
*.tmp
*.temp

# Coverage reports
coverage/

# TypeScript
*.tsbuildinfo
EOF

echo ""
echo "🎉 FlowFit setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env file with your configuration"
echo "2. Deploy contracts: cd contracts && npm run deploy:testnet"
echo "3. Start frontend: cd frontend && npm run dev"
echo "4. Visit http://localhost:3000 to see your app"
echo ""
echo "🔗 Useful commands:"
echo "- npm run dev            # Start development servers"
echo "- npm run build          # Build for production"
echo "- npm run deploy:testnet # Deploy to Flow testnet"
echo "- npm test               # Run tests"
echo ""
echo "📚 Documentation:"
echo "- README.md              # Project overview"
echo "- docs/TOKENOMICS.md     # Token economics"
echo "- docs/ROADMAP.md        # Development roadmap"
echo ""
echo "🚀 Ready to revolutionize fitness with blockchain!"
EOF 