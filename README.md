# FlowFit - The First Gasless Fitness Protocol on Flow

## 🏆 Built for Flow Hackathon

FlowFit is a revolutionary fitness protocol that leverages **Flow's native capabilities** to create the first truly gasless, mainstream-ready fitness app. By utilizing Flow's VRF, Account Linking, and Sponsored Transactions, we've eliminated all barriers to entry while maintaining the highest security standards.

## 🌟 Flow-Native Features

### 🎲 **Flow VRF Integration**
- **True Randomness**: Uses Flow's Verifiable Random Function for fair, unpredictable daily challenges
- **Anti-Gaming**: Impossible to manipulate or predict challenges
- **Adaptive Difficulty**: Challenges automatically adjust to user fitness levels
- **Transparent**: All randomness is verifiable on-chain

### 🔗 **Account Linking** 
- **Social Recovery**: Link Google, Discord, or other social accounts
- **Seamless Onboarding**: Users can recover accounts without seed phrases
- **Zero Barriers**: No crypto knowledge required to get started
- **Enterprise Ready**: Perfect for mainstream fitness apps

### ⚡ **Sponsored Transactions**
- **Gasless Experience**: All transactions are sponsored by FlowFit
- **Perfect UX**: Users focus on fitness, not gas fees
- **Sustainable Model**: Revenue from partnerships covers gas costs
- **Flow-Native**: Built using Flow's native sponsored transaction capabilities

## 📱 Architecture

### Smart Contracts (Cadence)

#### FlowFitToken (FFT)
```cadence
pub contract FlowFitToken: FungibleToken {
    // Native Flow Fungible Token with:
    // - Sponsored transaction support
    // - Partner redemption system
    // - Daily mint limits
    // - MetadataViews integration
}
```

#### FitnessChallenge
```cadence
pub contract FitnessChallenge {
    // VRF-powered challenge generation
    // - Flow's RandomBeaconHistory integration
    // - Adaptive difficulty system
    // - Streak tracking and bonuses
    // - Sponsored progress updates
}
```

#### AchievementNFT
```cadence
pub contract AchievementNFT: NonFungibleToken {
    // Dynamic NFTs that evolve with progress
    // - MetadataViews for rich metadata
    // - Tier-based evolution system
    // - Bonus multipliers for holders
    // - Flow-native NFT standards
}
```

### Frontend (Next.js + FCL)

- **FCL Integration**: Native Flow wallet connection
- **Account Linking UI**: Seamless social account linking
- **Real-time Updates**: Live challenge progress and rewards
- **Responsive Design**: Mobile-first fitness experience

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Flow CLI
- Flow Wallet (recommended) or any Flow-compatible wallet

### Installation

```bash
git clone https://github.com/yourname/flowfit
cd flowfit

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your Flow keys and configuration

# Start development server
npm run dev
```

### Flow Setup

```bash
# Install Flow CLI
sh -ci "$(curl -fsSL https://raw.githubusercontent.com/onflow/flow-cli/master/install.sh)"

# Deploy contracts to testnet
flow deploy --network testnet

# Start emulator for local development
flow emulator start
```

## 🎯 Key Features

### For Users
- **Zero Gas Fees**: All transactions are sponsored
- **Social Recovery**: Never lose access to your account
- **Fair Challenges**: VRF ensures truly random challenges
- **Real Rewards**: Earn tokens redeemable with real partners
- **Dynamic NFTs**: Achievements that evolve with your progress

### For Developers
- **Flow-Native**: Built with Flow's best practices
- **Scalable**: Handles thousands of users effortlessly
- **Extensible**: Easy to add new challenge types and partners
- **Secure**: Leverages Flow's security model

### For Partners
- **Direct Integration**: API for gym chains and fitness brands
- **Token Redemption**: Users spend FFT at partner locations
- **Marketing Channel**: Reach engaged fitness enthusiasts
- **Revenue Share**: Earn from sponsored transactions

## 🔧 Technical Implementation

### VRF Challenge Generation
```cadence
// Generate VRF-based daily challenge
pub fun generateDailyChallenge(user: Address, day: UInt64): UInt64 {
    // Get VRF randomness from Flow's Random Beacon
    let blockHeight = getCurrentBlock().height
    let randomSource = RandomBeaconHistory.sourceOfRandomness(atBlockHeight: blockHeight - 1)
    
    // Create deterministic seed from VRF + user + day
    let seed = String.join([randomSource.toString(), user.toString(), day.toString()], separator: ":")
    let hash = HashAlgorithm.SHA3_256.hash(seed.utf8)
    let randomValue = UInt64.fromBigEndianBytes(hash) ?? 0
    
    // Select challenge based on user's fitness level
    return selectChallenge(randomValue: randomValue, userStats: getUserStats(user))
}
```

### Account Linking Integration
```typescript
// Link social accounts for recovery
const linkAccount = async (provider: string) => {
    await fcl.authenticate({
        service: {
            f_type: 'Service',
            f_vsn: '1.0.0',
            type: 'authn',
            uid: `${provider}-link`,
            endpoint: `https://fcl-discovery.onflow.org/testnet/authn/${provider}`,
            provider: {
                name: provider,
                description: `Link your ${provider} account for social recovery`
            }
        }
    })
}
```

### Sponsored Transactions
```cadence
// All user transactions are sponsored
transaction() {
    prepare(signer: AuthAccount) {
        // User signs, but FlowFit pays gas
        FitnessChallenge.updateProgress(user: signer.address, progressValue: progress)
    }
}
```

## 📊 Tokenomics

### FFT Token Distribution
- **50% Community Rewards**: Earned through fitness challenges
- **20% Partners**: Redeemable at gyms, stores, and services
- **15% Team**: Vested over 3 years
- **10% Advisors**: Fitness and blockchain experts
- **5% Treasury**: Protocol development and partnerships

### Earning Mechanics
- **Daily Challenges**: 10-100 FFT based on difficulty
- **Streak Bonuses**: Up to 100% bonus for consistent activity
- **NFT Multipliers**: Achievement NFTs provide earning bonuses
- **Referral Rewards**: 10% of referee earnings for first month

## 🌍 Real-World Utility

### Partner Network
- **Gym Memberships**: Planet Fitness, 24 Hour Fitness
- **Nutrition**: Supplement stores, healthy meal delivery
- **Gear**: Athletic wear, fitness equipment
- **Services**: Personal trainers, massage therapy

### Use Cases
- **Corporate Wellness**: Companies reward employee fitness
- **Insurance**: Health insurers provide discounts
- **Healthcare**: Doctors prescribe fitness with token rewards
- **Education**: Schools integrate fitness into curricula

## 🛡️ Security & Compliance

### Flow Security Model
- **Resource-Oriented**: Assets are true digital objects
- **Capability-Based**: Fine-grained access control
- **Upgradeable**: Contracts can be improved over time
- **Auditable**: All transactions are transparent

### Privacy Protection
- **Minimal Data**: Only fitness metrics, no personal info
- **User Control**: Users own their data and achievements
- **GDPR Compliant**: Right to deletion and data portability
- **Health Standards**: HIPAA-compliant fitness tracking

## 🏗️ Development Roadmap

### Phase 1: Core Protocol (Months 1-3)
- [x] Flow VRF integration
- [x] Account linking implementation
- [x] Sponsored transactions
- [x] Dynamic NFT system
- [x] Partner redemption framework

### Phase 2: User Experience (Months 4-6)
- [ ] Mobile app (React Native)
- [ ] Wearable device integration
- [ ] Social features and leaderboards
- [ ] Advanced analytics dashboard
- [ ] Gamification system

### Phase 3: Ecosystem (Months 7-12)
- [ ] Partner API platform
- [ ] Corporate wellness packages
- [ ] Healthcare provider integrations
- [ ] Insurance company partnerships
- [ ] Global expansion

## 🤝 Why FlowFit Wins

### Technical Excellence
- **Flow-Native**: Built specifically for Flow's capabilities
- **Scalable**: Handles millions of users without congestion
- **User-Friendly**: Zero crypto knowledge required
- **Future-Proof**: Leverages Flow's roadmap features

### Market Opportunity
- **$96B Fitness Market**: Massive addressable market
- **Proven Business Model**: Freemium with real utility
- **Web3 Innovation**: First gasless fitness protocol
- **Mainstream Ready**: Appeals to non-crypto users

### Competitive Advantage
- **No Gas Fees**: Unique in the fitness space
- **Social Recovery**: Solves crypto's biggest UX problem
- **Fair Randomness**: VRF prevents gaming
- **Real Utility**: Tokens work at real businesses

## 📞 Contact

- **Website**: https://flowfit.app
- **Twitter**: [@FlowFit](https://twitter.com/flowfit)
- **Discord**: https://discord.gg/flowfit
- **Email**: hello@flowfit.app

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ on Flow Blockchain**

*FlowFit: Where Fitness Meets the Future*

### 💰 Wallet Connection & Integration

FlowFit provides a seamless wallet connection experience with multiple Flow-compatible wallets:

#### Supported Wallets
- **Blocto** (Recommended) - Easy email-based wallet with social login
- **Lilico** (Popular) - Mobile-first Flow wallet with great UX
- **Dapper** - Gaming-focused wallet with NFT support
- **Finoa** - Enterprise-grade security for institutions
- **Ledger** - Hardware wallet for maximum security

#### Key Features
- 🔄 **One-Click Connection** - Connect instantly with your preferred wallet
- 🔐 **Multi-Wallet Support** - Switch between different wallet providers
- 🌐 **Account Linking** - Link Google/Discord for social recovery
- ⚡ **Gasless Transactions** - All interactions are sponsored (zero fees)
- 📱 **Mobile Optimized** - Seamless experience on all devices
- 🔄 **Auto-Reconnection** - Persistent sessions with error recovery
- 📊 **Real-Time Balance** - Live FFT token balance updates
- 🎨 **Beautiful UI** - Cosmic-themed interface with smooth animations

#### Wallet Connection States
- ✅ Connected - Active wallet session
- 🔄 Connecting - Establishing connection
- ❌ Error - Connection failed (with retry option)
- 🔄 Reconnecting - Automatic recovery attempt

#### Account Management
- **Address Display** - Formatted wallet address (0x1234...5678)
- **Copy Address** - One-click address copying with toast confirmation
- **Balance Tracking** - Real-time FFT token balance
- **Explorer Links** - Direct links to Flow blockchain explorer
- **Account Details** - Expandable view with network info
- **Safe Disconnect** - Secure wallet disconnection

### 🎮 Gamified Fitness Features

- **VRF-Powered Challenges** - Fair, random daily workouts using Flow's RandomBeaconHistory
- **Dynamic NFT Achievements** - Evolving NFTs that level up with your progress
- **Token Rewards** - Earn FFT tokens for completing challenges
- **Streak Bonuses** - Multipliers for consecutive workout days
- **Real-World Redemption** - Use tokens for gym memberships and gear

### 🔗 Flow-Native Integration

- **Sponsored Transactions** - Zero gas fees for all user interactions
- **Account Linking** - Social recovery with Google/Discord integration
- **Resource-Oriented Programming** - Safe Cadence smart contracts
- **MetadataViews** - Rich NFT and token metadata

## 🛠 Technical Implementation

### Wallet Provider (`FlowProvider.tsx`)
```typescript
// Enhanced Flow provider with comprehensive wallet features
const { 
  user,              // Current user state
  connectionState,   // Connection status
  logIn,            // Connect wallet function
  logOut,           // Disconnect wallet function
  sendTransaction,  // Send blockchain transactions
  getBalance,       // Get token balance
  copyAddress,      // Copy address utility
  formatAddress     // Format address display
} = useFlow()
```

### Wallet Connection Component (`WalletConnection.tsx`)
- Modal-based wallet selection
- Multiple wallet provider support
- Connection state management
- Error handling and recovery
- Account information display
- Transaction status tracking

### Usage Example
```tsx
import { useFlow } from '@/components/providers/FlowProvider'
import WalletConnection from '@/components/WalletConnection'

function MyComponent() {
  const { user, logIn } = useFlow()
  const [showWallet, setShowWallet] = useState(false)

  return (
    <>
      <button onClick={() => setShowWallet(true)}>
        {user.loggedIn ? 'Account' : 'Connect Wallet'}
      </button>
      
      <WalletConnection 
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
        mode={user.loggedIn ? 'account' : 'connect'}
      />
    </>
  )
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Flow CLI (for contract deployment)

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/flowfit.git
cd flowfit

# Install dependencies
npm install

# Install frontend dependencies
cd frontend && npm install

# Set up environment variables
cp .env.example .env.local
# Add your WalletConnect Project ID to .env.local
```

### Environment Variables
```bash
# frontend/.env.local
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### Development
```bash
# Start the frontend
cd frontend && npm run dev

# Deploy contracts (in another terminal)
flow deploy --network testnet
```

### Wallet Integration Testing

1. **Start Development Server**
   ```bash
   cd frontend && npm run dev
   ```

2. **Test Wallet Connection**
   - Click "Connect Wallet" button
   - Select a wallet provider (Blocto recommended for testing)
   - Complete the authentication flow
   - Verify connection state and balance display

3. **Test Features**
   - View account information
   - Copy wallet address
   - Test gasless transactions
   - Try social account linking
   - Test disconnect functionality

## 📦 Project Structure

```
flow-blockchain/
├── contracts/cadence/contracts/   # Flow smart contracts
│   ├── FlowFitToken.cdc          # FFT token contract
│   ├── FitnessChallenge.cdc      # Challenge contract
│   └── AchievementNFT.cdc        # NFT contract
├── frontend/                     # Next.js frontend
│   ├── src/components/
│   │   ├── providers/
│   │   │   └── FlowProvider.tsx  # Enhanced Flow provider
│   │   └── WalletConnection.tsx  # Wallet modal component
│   └── src/app/
│       ├── page.tsx             # Main landing page
│       └── layout.tsx           # App layout with toaster
└── flow.json                    # Flow configuration
```

## 🎨 UI/UX Features

### Design System
- **Cosmic Theme** - Space-inspired design with neon colors
- **Glassmorphism** - Modern glass-effect cards and modals
- **Smooth Animations** - Framer Motion powered transitions
- **Responsive Design** - Mobile-first responsive layout
- **Toast Notifications** - Real-time feedback for all actions

### Color Palette
- Primary: Cyan (#06b6d4) to Purple (#8b5cf6)
- Success: Green (#22c55e)
- Warning: Yellow (#eab308)
- Error: Red (#ef4444)
- Background: Dark gradient with cosmic particles

## 🔧 Customization

### Adding New Wallets
```typescript
// Add to walletOptions array in WalletConnection.tsx
{
  type: WalletType.YOUR_WALLET,
  name: 'Your Wallet',
  icon: <YourIcon className="w-8 h-8" />,
  description: 'Description of your wallet',
  color: 'from-color-400 to-color-600'
}
```

### Custom Toast Styling
```typescript
// Customize in layout.tsx
<Toaster
  toastOptions={{
    style: {
      background: 'your-color',
      color: 'your-text-color',
      // ... other styles
    }
  }}
/>
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your wallet enhancement
4. Test thoroughly with different wallets
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌟 Acknowledgments

- Flow blockchain team for excellent developer tools
- Blocto, Dapper, and other wallet providers
- Next.js and React ecosystem
- Framer Motion for animations

---

**Ready to revolutionize fitness with blockchain?** 🚀

Start earning crypto for your workouts today! The future of fitness is gasless, fair, and rewarding.

[**Connect Your Wallet & Start Training →**](https://flowfit.io) 