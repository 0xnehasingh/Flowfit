'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as fcl from '@onflow/fcl'
import * as t from '@onflow/types'

// Configure FCL for Flow Testnet with Account Linking
fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'FlowFit',
  'app.detail.icon': 'https://flowfit.app/logo.png',
  'flow.network': 'testnet',
  'walletconnect.projectId': process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  
  // Account Linking Configuration
  'service.openid.scopes': 'email profile',
  'fcl.accountProof.resolver': async () => ({
    appIdentifier: 'FlowFit',
    nonce: Math.random().toString(36).substring(7)
  })
})

interface User {
  addr?: string
  cid?: string
  loggedIn: boolean
  services?: any[]
  expiresAt?: number
}

interface FlowContextType {
  user: User
  logIn: () => Promise<void>
  logOut: () => void
  loading: boolean
  sendTransaction: (code: string, args?: any[]) => Promise<string>
  executeScript: (code: string, args?: any[]) => Promise<any>
  createAccount: () => Promise<void>
  linkAccount: (provider: string) => Promise<void>
  isAccountLinked: boolean
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
  const [user, setUser] = useState<User>({ loggedIn: false })
  const [loading, setLoading] = useState(true)
  const [isAccountLinked, setIsAccountLinked] = useState(false)

  useEffect(() => {
    // Listen for user authentication changes
    const unsubscribe = fcl.currentUser.subscribe(setUser)
    setLoading(false)
    
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    // Check if account has linked services
    if (user.loggedIn && user.services) {
      const hasLinkedServices = user.services.some(service => 
        service.type === 'authn' && service.provider?.name !== 'wallet'
      )
      setIsAccountLinked(hasLinkedServices)
    }
  }, [user])

  const logIn = async () => {
    try {
      setLoading(true)
      await fcl.authenticate()
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const logOut = () => {
    fcl.unauthenticate()
    setIsAccountLinked(false)
  }

  const createAccount = async () => {
    try {
      setLoading(true)
      
      // Create account transaction with sponsored transactions enabled
      const transactionCode = `
        import FlowFitToken from 0xTOKEN_ADDRESS
        
        transaction() {
          prepare(signer: AuthAccount) {
            // Create FlowFit token vault
            if signer.borrow<&FlowFitToken.Vault>(from: FlowFitToken.VaultStoragePath) == nil {
              signer.save(<-FlowFitToken.createEmptyVault(), to: FlowFitToken.VaultStoragePath)
              
              signer.link<&FlowFitToken.Vault{FungibleToken.Receiver}>(
                FlowFitToken.VaultPublicPath,
                target: FlowFitToken.VaultStoragePath
              )
              
              signer.link<&FlowFitToken.Vault{FungibleToken.Balance}>(
                FlowFitToken.VaultPublicPath,
                target: FlowFitToken.VaultStoragePath
              )
            }
            
            // Create Achievement NFT collection
            if signer.borrow<&AchievementNFT.Collection>(from: AchievementNFT.CollectionStoragePath) == nil {
              signer.save(<-AchievementNFT.createEmptyCollection(), to: AchievementNFT.CollectionStoragePath)
              
              signer.link<&AchievementNFT.Collection{NonFungibleToken.CollectionPublic, AchievementNFT.AchievementNFTCollectionPublic}>(
                AchievementNFT.CollectionPublicPath,
                target: AchievementNFT.CollectionStoragePath
              )
            }
            
            log("FlowFit account setup complete")
          }
        }
      `
      
      const txId = await fcl.mutate({
        cadence: transactionCode,
        proposer: fcl.authz,
        payer: fcl.authz, // In production, this would be sponsored
        authorizations: [fcl.authz],
        limit: 9999
      })
      
      await fcl.tx(txId).onceSealed()
      console.log('Account created successfully:', txId)
      
    } catch (error) {
      console.error('Account creation error:', error)
    } finally {
      setLoading(false)
    }
  }

  const linkAccount = async (provider: string) => {
    try {
      setLoading(true)
      
      // Use FCL's account linking for social recovery
      await fcl.authenticate({
        service: {
          f_type: 'Service',
          f_vsn: '1.0.0',
          type: 'authn',
          uid: `${provider}-link`,
          endpoint: `https://fcl-discovery.onflow.org/testnet/authn/${provider}`,
          provider: {
            name: provider,
            icon: `https://flowfit.app/icons/${provider}.png`,
            description: `Link your ${provider} account for social recovery`
          }
        }
      })
      
      setIsAccountLinked(true)
      
    } catch (error) {
      console.error('Account linking error:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendTransaction = async (code: string, args: any[] = []) => {
    try {
      const txId = await fcl.mutate({
        cadence: code,
        args: () => args,
        proposer: fcl.authz,
        payer: fcl.authz, // In production, this would be sponsored
        authorizations: [fcl.authz],
        limit: 9999
      })
      
      const result = await fcl.tx(txId).onceSealed()
      return txId
    } catch (error) {
      console.error('Transaction error:', error)
      throw error
    }
  }

  const executeScript = async (code: string, args: any[] = []) => {
    try {
      const result = await fcl.query({
        cadence: code,
        args: () => args
      })
      return result
    } catch (error) {
      console.error('Script execution error:', error)
      throw error
    }
  }

  const value: FlowContextType = {
    user,
    logIn,
    logOut,
    loading,
    sendTransaction,
    executeScript,
    createAccount,
    linkAccount,
    isAccountLinked
  }

  return (
    <FlowContext.Provider value={value}>
      {children}
    </FlowContext.Provider>
  )
}