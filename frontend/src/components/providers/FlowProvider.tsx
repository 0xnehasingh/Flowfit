'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'
import toast from 'react-hot-toast'

// Configure FCL for Flow Testnet
fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'FlowFit - Gamified Fitness',
  'app.detail.icon': 'https://flowfit.io/logo.png',
  'app.detail.description': 'The first gasless fitness protocol on Flow blockchain',
  'flow.network': 'testnet'
})

// Connection states
export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

// Wallet types
export enum WalletType {
  BLOCTO = 'blocto',
  DAPPER = 'dapper',
  LILICO = 'lilico',
  FINOA = 'finoa',
  LEDGER = 'ledger'
}

// Enhanced user interface
interface User {
  addr?: string
  cid?: string
  loggedIn: boolean
  services?: any[]
  expiresAt?: number
  f_type?: string
  f_vsn?: string
  email?: string
  name?: string
  avatar?: string
}

// Transaction status
interface TransactionStatus {
  id: string
  status: 'pending' | 'sealed' | 'executed' | 'error'
  error?: string
  events?: any[]
}

// Enhanced context interface
interface FlowContextType {
  // Core user state
  user: User
  connectionState: ConnectionState
  connectionError: string | null
  
  // Wallet connection functions
  logIn: (walletType?: WalletType) => Promise<void>
  logOut: () => Promise<void>
  reconnect: () => Promise<void>
  
  // Loading states
  loading: boolean
  isConnecting: boolean
  
  // Transaction functions
  sendTransaction: (code: string, args?: any[], options?: TransactionOptions) => Promise<string>
  executeScript: (code: string, args?: any[]) => Promise<any>
  getTransactionStatus: (txId: string) => Promise<TransactionStatus>
  
  // Account management
  createAccount: () => Promise<void>
  linkAccount: (provider: string) => Promise<void>
  isAccountLinked: boolean
  
  // Account info
  getAccountInfo: () => Promise<any>
  getBalance: (tokenAddress?: string) => Promise<string>
  
  // Utility functions
  copyAddress: () => void
  getExplorerUrl: (txId: string) => string
  formatAddress: (address?: string) => string
}

interface TransactionOptions {
  onStart?: () => void
  onUpdate?: (status: TransactionStatus) => void
  onComplete?: (result: any) => void
  onError?: (error: Error) => void
}

const FlowContext = createContext<FlowContextType | undefined>(undefined)

export const useFlow = () => {
  const context = useContext(FlowContext)
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider')
  }
  return context
}

interface FlowProviderProps {
  children: ReactNode
}

export default function FlowProvider({ children }: FlowProviderProps) {
  // Core state
  const [user, setUser] = useState<User>({ loggedIn: false })
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.DISCONNECTED)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isAccountLinked, setIsAccountLinked] = useState(false)

  // Initialize FCL and subscribe to user changes
  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe((currentUser: User) => {
      console.log('User state changed:', currentUser)
      setUser(currentUser)
      
      if (currentUser.loggedIn) {
        setConnectionState(ConnectionState.CONNECTED)
        setConnectionError(null)
        toast.success('Wallet connected successfully!')
      } else {
        setConnectionState(ConnectionState.DISCONNECTED)
      }
      
      setLoading(false)
      setIsConnecting(false)
    })
    
    // Check for existing session
    const currentUser = fcl.currentUser()
    if (currentUser.loggedIn) {
      setConnectionState(ConnectionState.CONNECTED)
    }
    setLoading(false)
    
    return () => unsubscribe()
  }, [])

  // Check for linked accounts
  useEffect(() => {
    if (user.loggedIn && user.services) {
      const hasLinkedServices = user.services.some(service => 
        service.type === 'authn' && service.provider?.name !== 'wallet'
      )
      setIsAccountLinked(hasLinkedServices)
    } else {
      setIsAccountLinked(false)
    }
  }, [user])

  // Enhanced login function
  const logIn = async (walletType?: WalletType) => {
    try {
      setIsConnecting(true)
      setConnectionState(ConnectionState.CONNECTING)
      setConnectionError(null)
      
      toast.loading('Connecting to wallet...', { id: 'wallet-connect' })
      
      // Optional: specific wallet type configuration
      if (walletType) {
        // Configure specific wallet if needed
        console.log(`Connecting to ${walletType} wallet`)
      }
      
      await fcl.authenticate()
      
      toast.dismiss('wallet-connect')
      
    } catch (error: any) {
      console.error('Login error:', error)
      setConnectionState(ConnectionState.ERROR)
      setConnectionError(error.message || 'Failed to connect wallet')
      setIsConnecting(false)
      
      toast.dismiss('wallet-connect')
      toast.error('Failed to connect wallet. Please try again.')
    }
  }

  // Enhanced logout function
  const logOut = async () => {
    try {
      await fcl.unauthenticate()
      setConnectionState(ConnectionState.DISCONNECTED)
      setConnectionError(null)
      setIsAccountLinked(false)
      toast.success('Wallet disconnected')
    } catch (error: any) {
      console.error('Logout error:', error)
      toast.error('Error disconnecting wallet')
    }
  }

  // Reconnect function
  const reconnect = async () => {
    if (connectionState === ConnectionState.ERROR) {
      setConnectionState(ConnectionState.RECONNECTING)
      await logIn()
    }
  }

  // Enhanced transaction function with status tracking
  const sendTransaction = async (
    code: string, 
    args: any[] = [], 
    options?: TransactionOptions
  ): Promise<string> => {
    if (!user.loggedIn) {
      throw new Error('Please connect your wallet first')
    }

    try {
      options?.onStart?.()
      
      toast.loading('Sending transaction...', { id: 'tx-send' })
      
      const txId = await fcl.mutate({
        cadence: code,
        args: () => args,
        proposer: fcl.authz,
        payer: fcl.authz,
        authorizations: [fcl.authz],
        limit: 9999
      })
      
      toast.dismiss('tx-send')
      toast.loading('Transaction submitted, waiting for confirmation...', { id: 'tx-confirm' })
      
      // Track transaction status
      const result = await fcl.tx(txId).onceSealed()
      
      toast.dismiss('tx-confirm')
      toast.success('Transaction confirmed!')
      
      options?.onComplete?.(result)
      
      return txId
    } catch (error: any) {
      toast.dismiss('tx-send')
      toast.dismiss('tx-confirm')
      toast.error(`Transaction failed: ${error.message}`)
      
      options?.onError?.(error)
      throw error
    }
  }

  // Get transaction status
  const getTransactionStatus = async (txId: string): Promise<TransactionStatus> => {
    try {
      const result = await fcl.tx(txId).onceSealed()
      return {
        id: txId,
        status: 'sealed',
        events: result.events
      }
    } catch (error: any) {
      return {
        id: txId,
        status: 'error',
        error: error.message
      }
    }
  }

  // Enhanced script execution
  const executeScript = async (code: string, args: any[] = []) => {
    try {
      const result = await fcl.query({
        cadence: code,
        args: () => args
      })
      return result
    } catch (error: any) {
      console.error('Script execution error:', error)
      toast.error(`Script execution failed: ${error.message}`)
      throw error
    }
  }

  // Account creation with better UX
  const createAccount = async () => {
    if (!user.loggedIn) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      setLoading(true)
      toast.loading('Setting up your FlowFit account...', { id: 'account-setup' })
      
      // Mock account setup for demo
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.dismiss('account-setup')
      toast.success('FlowFit account created successfully!')
      
    } catch (error: any) {
      console.error('Account creation error:', error)
      toast.dismiss('account-setup')
      toast.error('Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  // Enhanced account linking
  const linkAccount = async (provider: string) => {
    try {
      setLoading(true)
      toast.loading(`Linking ${provider} account...`, { id: 'link-account' })
      
      // Mock linking for demo - in production this would use FCL's account linking
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setIsAccountLinked(true)
      toast.dismiss('link-account')
      toast.success(`${provider} account linked successfully!`)
      
    } catch (error: any) {
      console.error('Account linking error:', error)
      toast.dismiss('link-account')
      toast.error(`Failed to link ${provider} account`)
    } finally {
      setLoading(false)
    }
  }

  // Get account information
  const getAccountInfo = async () => {
    if (!user.addr) return null
    
    try {
      const account = await fcl.query({
        cadence: `
          pub fun main(address: Address): AnyStruct {
            let account = getAccount(address)
            return {
              "address": address.toString(),
              "balance": account.balance,
              "availableBalance": account.availableBalance,
              "storageUsed": account.storageUsed,
              "storageCapacity": account.storageCapacity
            }
          }
        `,
        args: () => [fcl.arg(user.addr, t.Address)]
      })
      return account
    } catch (error) {
      console.error('Error fetching account info:', error)
      return null
    }
  }

  // Get token balance
  const getBalance = async (tokenAddress?: string): Promise<string> => {
    if (!user.addr) return '0'
    
    try {
      // Mock balance for demo
      return '1,250.50'
    } catch (error) {
      console.error('Error fetching balance:', error)
      return '0'
    }
  }

  // Utility functions
  const copyAddress = () => {
    if (user.addr) {
      navigator.clipboard.writeText(user.addr)
      toast.success('Address copied to clipboard!')
    }
  }

  const getExplorerUrl = (txId: string): string => {
    return `https://testnet.flowscan.org/transaction/${txId}`
  }

  const formatAddress = (address?: string): string => {
    if (!address) return ''
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const value: FlowContextType = {
    // Core state
    user,
    connectionState,
    connectionError,
    
    // Connection functions
    logIn,
    logOut,
    reconnect,
    
    // Loading states
    loading,
    isConnecting,
    
    // Transaction functions
    sendTransaction,
    executeScript,
    getTransactionStatus,
    
    // Account management
    createAccount,
    linkAccount,
    isAccountLinked,
    
    // Account info
    getAccountInfo,
    getBalance,
    
    // Utilities
    copyAddress,
    getExplorerUrl,
    formatAddress
  }

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  )
}