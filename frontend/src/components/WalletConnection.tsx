'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  X,
  Coins,
  Settings,
  LogOut,
  User
} from 'lucide-react'
import { useFlow, ConnectionState, WalletType } from '@/components/providers/FlowProvider'

interface WalletOption {
  type: WalletType
  name: string
  icon: React.ReactNode
  description: string
  color: string
  isPopular?: boolean
  isRecommended?: boolean
}

interface WalletConnectionProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'connect' | 'account'
}

const walletOptions: WalletOption[] = [
  {
    type: WalletType.BLOCTO,
    name: 'Blocto',
    icon: <Wallet className="w-8 h-8" />,
    description: 'Easy-to-use wallet with email login',
    color: 'from-blue-400 to-blue-600',
    isRecommended: true
  },
  {
    type: WalletType.LILICO,
    name: 'Lilico',
    icon: <Smartphone className="w-8 h-8" />,
    description: 'Mobile-first Flow wallet',
    color: 'from-purple-400 to-purple-600',
    isPopular: true
  },
  {
    type: WalletType.DAPPER,
    name: 'Dapper',
    icon: <Shield className="w-8 h-8" />,
    description: 'Secure wallet for NFTs and gaming',
    color: 'from-green-400 to-green-600'
  },
  {
    type: WalletType.FINOA,
    name: 'Finoa',
    icon: <Globe className="w-8 h-8" />,
    description: 'Institutional-grade security',
    color: 'from-orange-400 to-orange-600'
  },
  {
    type: WalletType.LEDGER,
    name: 'Ledger',
    icon: <Shield className="w-8 h-8" />,
    description: 'Hardware wallet security',
    color: 'from-gray-400 to-gray-600'
  }
]

export default function WalletConnection({ isOpen, onClose, mode = 'connect' }: WalletConnectionProps) {
  const {
    user,
    connectionState,
    connectionError,
    isConnecting,
    logIn,
    logOut,
    reconnect,
    copyAddress,
    formatAddress,
    getBalance,
    getExplorerUrl
  } = useFlow()
  
  const [selectedWallet, setSelectedWallet] = useState<WalletType | null>(null)
  const [balance, setBalance] = useState('0')
  const [showAccountDetails, setShowAccountDetails] = useState(false)

  // Load balance when user connects
  useEffect(() => {
    if (user.loggedIn) {
      getBalance().then(setBalance).catch(() => setBalance('0'))
    }
  }, [user.loggedIn, getBalance])

  const handleWalletSelect = async (walletType: WalletType) => {
    setSelectedWallet(walletType)
    await logIn(walletType)
  }

  const handleReconnect = async () => {
    if (selectedWallet) {
      await reconnect()
    }
  }

  const getConnectionStateIcon = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return <RefreshCw className="w-5 h-5 animate-spin" />
      case ConnectionState.CONNECTED:
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case ConnectionState.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case ConnectionState.RECONNECTING:
        return <RefreshCw className="w-5 h-5 animate-spin text-yellow-400" />
      default:
        return <Wallet className="w-5 h-5" />
    }
  }

  const getConnectionStateText = () => {
    switch (connectionState) {
      case ConnectionState.CONNECTING:
        return 'Connecting...'
      case ConnectionState.CONNECTED:
        return 'Connected'
      case ConnectionState.ERROR:
        return 'Connection Failed'
      case ConnectionState.RECONNECTING:
        return 'Reconnecting...'
      default:
        return 'Not Connected'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md mx-4"
        >
          <div className="glass-card !p-0 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center">
                    {getConnectionStateIcon()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {mode === 'connect' ? 'Connect Wallet' : 'Account'}
                    </h2>
                    <p className="text-sm text-gray-400">
                      {getConnectionStateText()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {!user.loggedIn ? (
                // Wallet Selection
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <p className="text-gray-300 mb-2">
                      Choose your preferred wallet to get started
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-sm text-cyan-400">
                      <Zap className="w-4 h-4" />
                      <span>Gasless transactions enabled</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {walletOptions.map((wallet) => (
                      <motion.button
                        key={wallet.type}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleWalletSelect(wallet.type)}
                        disabled={isConnecting}
                        className="w-full p-4 rounded-xl border border-gray-700/50 hover:border-cyan-400/50 
                                 bg-gray-800/30 hover:bg-gray-700/30 transition-all duration-200 
                                 disabled:opacity-50 disabled:cursor-not-allowed relative group"
                      >
                        {/* Recommended Badge */}
                        {wallet.isRecommended && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-emerald-500 
                                        text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Recommended
                          </div>
                        )}
                        
                        {/* Popular Badge */}
                        {wallet.isPopular && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-500 
                                        text-white text-xs px-2 py-1 rounded-full font-semibold">
                            Popular
                          </div>
                        )}

                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${wallet.color} rounded-xl 
                                        flex items-center justify-center text-white`}>
                            {wallet.icon}
                          </div>
                          <div className="flex-1 text-left">
                            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                              {wallet.name}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {wallet.description}
                            </p>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Connection Error */}
                  {connectionState === ConnectionState.ERROR && connectionError && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
                    >
                      <div className="flex items-start space-x-3">
                        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-red-400 mb-1">Connection Failed</h4>
                          <p className="text-sm text-gray-300 mb-3">{connectionError}</p>
                          <button
                            onClick={handleReconnect}
                            className="text-sm font-semibold text-red-400 hover:text-red-300 
                                     flex items-center space-x-1"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Try Again</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                // Account Details
                <div className="space-y-6">
                  {/* Account Info */}
                  <div className="neo-card !p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full 
                                      flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Account</h3>
                          <p className="text-sm text-gray-400">
                            {formatAddress(user.addr)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={copyAddress}
                        className="w-8 h-8 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 
                                 flex items-center justify-center transition-colors"
                      >
                        <Copy className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Balance */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div className="flex items-center space-x-2">
                        <Coins className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300">FFT Balance</span>
                      </div>
                      <span className="font-bold text-white">{balance}</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setShowAccountDetails(!showAccountDetails)}
                      className="morphing-button !py-3 flex items-center justify-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        if (user.addr) {
                          window.open(`https://testnet.flowscan.org/account/${user.addr}`, '_blank')
                        }
                      }}
                      className="secondary-button !py-3 flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Explorer</span>
                    </button>
                  </div>

                  {/* Account Details Expandable */}
                  <AnimatePresence>
                    {showAccountDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="neo-card !p-4 space-y-3">
                          <h4 className="font-semibold text-white mb-3">Account Details</h4>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Address:</span>
                              <span className="text-white font-mono">{user.addr}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Network:</span>
                              <span className="text-white">Flow Testnet</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">Connection:</span>
                              <span className="text-green-400">Active</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Disconnect Button */}
                  <div className="pt-4 border-t border-gray-700/50">
                    <button
                      onClick={async () => {
                        await logOut()
                        onClose()
                      }}
                      className="w-full p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 
                               border border-red-500/20 hover:border-red-500/30 
                               text-red-400 hover:text-red-300 transition-all duration-200
                               flex items-center justify-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Disconnect Wallet</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
} 