'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Zap, Trophy, Users, Coins, Star, ChevronRight, Activity } from 'lucide-react'
import Link from 'next/link'
import { useFlow } from '@/components/providers/FlowProvider'

const FlowFitLanding = () => {
  const { user, logIn, logOut, loading, createAccount, linkAccount, isAccountLinked, sendTransaction, executeScript } = useFlow()
  const [isClient, setIsClient] = useState(false)
  const [todaysChallenge, setTodaysChallenge] = useState(null)
  const [userStats, setUserStats] = useState(null)
  const [tokenBalance, setTokenBalance] = useState('0')
  const [challengeProgress, setChallengeProgress] = useState(0)
  const [isStartingChallenge, setIsStartingChallenge] = useState(false)
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (user.loggedIn) {
      loadUserData()
    }
  }, [user.loggedIn])

  const loadUserData = async () => {
    try {
      // Load user's token balance
      const balanceScript = `
        import FlowFitToken from 0xTOKEN_ADDRESS
        import FungibleToken from 0x9a0766d93b6608b7
        
        pub fun main(address: Address): UFix64 {
          let account = getAccount(address)
          let vaultRef = account.getCapability(FlowFitToken.VaultPublicPath)
            .borrow<&FlowFitToken.Vault{FungibleToken.Balance}>()
            ?? panic("Could not borrow Balance reference")
          
          return vaultRef.balance
        }
      `
      
      const balance = await executeScript(balanceScript, [{ type: 'Address', value: user.addr }])
      setTokenBalance(balance)

      // Load today's challenge using VRF
      const challengeScript = `
        import FitnessChallenge from 0xCHALLENGE_ADDRESS
        
        pub fun main(address: Address): (UInt64, FitnessChallenge.Challenge?) {
          return FitnessChallenge.getTodaysChallenge(user: address)
        }
      `
      
      const challenge = await executeScript(challengeScript, [{ type: 'Address', value: user.addr }])
      setTodaysChallenge(challenge)

      // Load user stats
      const statsScript = `
        import FitnessChallenge from 0xCHALLENGE_ADDRESS
        
        pub fun main(address: Address): FitnessChallenge.UserStats? {
          return FitnessChallenge.getUserStats(user: address)
        }
      `
      
      const stats = await executeScript(statsScript, [{ type: 'Address', value: user.addr }])
      setUserStats(stats)

    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleStartChallenge = async () => {
    if (!user.loggedIn) return
    
    setIsStartingChallenge(true)
    try {
      const transactionCode = `
        import FitnessChallenge from 0xCHALLENGE_ADDRESS
        
        transaction() {
          prepare(signer: AuthAccount) {
            FitnessChallenge.startTodaysChallenge(user: signer.address)
          }
        }
      `
      
      await sendTransaction(transactionCode)
      await loadUserData()
    } catch (error) {
      console.error('Error starting challenge:', error)
    } finally {
      setIsStartingChallenge(false)
    }
  }

  const handleSubmitProgress = async () => {
    if (!user.loggedIn || challengeProgress <= 0) return
    
    setIsSubmittingProgress(true)
    try {
      const transactionCode = `
        import FitnessChallenge from 0xCHALLENGE_ADDRESS
        
        transaction(progress: UFix64) {
          prepare(signer: AuthAccount) {
            FitnessChallenge.updateProgress(user: signer.address, progressValue: progress)
          }
        }
      `
      
      await sendTransaction(transactionCode, [{ type: 'UFix64', value: challengeProgress.toString() }])
      await loadUserData()
      setChallengeProgress(0)
    } catch (error) {
      console.error('Error submitting progress:', error)
    } finally {
      setIsSubmittingProgress(false)
    }
  }

  const handleAccountLink = async (provider: string) => {
    try {
      await linkAccount(provider)
    } catch (error) {
      console.error('Error linking account:', error)
    }
  }

  const features = [
    {
      icon: "🎯",
      title: "VRF-Powered Challenges",
      description: "Fair, unpredictable daily challenges using Flow's Verifiable Random Function",
      gradient: "from-neon-400 to-electric-500",
      glow: "neon"
    },
    {
      icon: "🪙",
      title: "Earn FlowFit Tokens",
      description: "Get rewarded with FFT tokens for completing workouts and maintaining streaks",
      gradient: "from-lime-400 to-neon-500",
      glow: "lime"
    },
    {
      icon: "🏆",
      title: "Dynamic NFT Achievements",
      description: "Unlock evolving NFTs that level up with your fitness progress",
      gradient: "from-electric-400 to-flame-500",
      glow: "electric"
    },
    {
      icon: "⚡",
      title: "Sponsored Transactions",
      description: "Zero gas fees with Flow's sponsored transactions for seamless UX",
      gradient: "from-flame-400 to-electric-600",
      glow: "flame"
    },
    {
      icon: "🔗",
      title: "Account Linking",
      description: "Connect social accounts for easy onboarding and recovery",
      gradient: "from-electric-500 to-neon-400",
      glow: "electric"
    },
    {
      icon: "🏪",
      title: "Real-World Rewards",
      description: "Redeem tokens for gym memberships, gear, and supplements",
      gradient: "from-lime-500 to-flame-400",
      glow: "lime"
    }
  ]

  const statsData = [
    { label: "Active Users", value: 12500, color: "neon" },
    { label: "Workouts Completed", value: 85000, color: "lime" },
    { label: "Tokens Earned", value: 2100000, color: "electric" },
    { label: "NFTs Minted", value: 8750, color: "flame" }
  ]

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-gray-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">FF</span>
                </div>
                <h1 className="text-2xl font-bold text-white">FlowFit</h1>
                <span className="px-2 py-1 bg-gradient-to-r from-cyan-400 to-purple-600 text-white text-xs rounded-full">
                  Flow Native
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {user.loggedIn && (
                  <div className="flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="text-sm text-gray-300">FFT Balance:</span>
                    <span className="text-lg font-bold text-cyan-400">{tokenBalance}</span>
                  </div>
                )}
                
                {loading ? (
                  <div className="bg-gray-800/50 px-4 py-2 rounded-full">
                    <span className="text-gray-300">Loading...</span>
                  </div>
                ) : user.loggedIn ? (
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-300">
                      {user.addr?.slice(0, 6)}...{user.addr?.slice(-4)}
                    </div>
                    <button
                      onClick={logOut}
                      className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-full transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={logIn}
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105"
                  >
                    Connect Flow Wallet
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12">
          {!user.loggedIn ? (
            // Landing Page
            <div className="space-y-16">
              {/* Hero Section */}
              <div className="text-center space-y-8">
                <div className="space-y-4">
                  <h2 className="text-6xl md:text-8xl font-bold">
                    <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                      FlowFit
                    </span>
                  </h2>
                  <p className="text-2xl md:text-3xl font-bold text-white">
                    The First Truly <span className="text-cyan-400">Gasless</span> Fitness Protocol
                  </p>
                  <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                    Powered by Flow's VRF for fair challenges, Account Linking for seamless onboarding, 
                    and Sponsored Transactions for zero-barrier entry
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={logIn}
                    className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
                  >
                    Start Your Fitness Journey
                  </button>
                  <button className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 border border-gray-700">
                    Learn More
                  </button>
                </div>
              </div>

              {/* Flow Features */}
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-cyan-400/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-xl">🎲</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Flow VRF Challenges</h3>
                  <p className="text-gray-300">
                    Truly random, fair challenges generated by Flow's Verifiable Random Function. 
                    No gaming the system - just pure fitness motivation.
                  </p>
                </div>

                <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-purple-400/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-xl">🔗</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Account Linking</h3>
                  <p className="text-gray-300">
                    Link your social accounts for seamless recovery and onboarding. 
                    Lost your wallet? No problem - recover with your Google account.
                  </p>
                </div>

                <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50 hover:border-green-400/50 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-white text-xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Sponsored Transactions</h3>
                  <p className="text-gray-300">
                    Complete gasless transactions. Focus on your fitness, not gas fees. 
                    FlowFit covers all transaction costs for the ultimate UX.
                  </p>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {statsData.map((stat, index) => (
                  <div key={index} className="text-center space-y-2">
                    <div className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="text-gray-300 font-medium">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // User Dashboard
            <div className="space-y-8">
              {/* Account Linking Section */}
              {!isAccountLinked && (
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-8 border border-amber-500/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Secure Your Account</h3>
                      <p className="text-gray-300">
                        Link your social accounts for easy recovery and enhanced security.
                      </p>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAccountLink('google')}
                        className="bg-white text-gray-800 px-4 py-2 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                      >
                        Link Google
                      </button>
                      <button
                        onClick={() => handleAccountLink('discord')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        Link Discord
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Challenge Section */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                  <h3 className="text-2xl font-bold text-white mb-6">Today's VRF Challenge</h3>
                  
                  {todaysChallenge ? (
                    <div className="space-y-4">
                      <div className="text-lg text-gray-300">
                        <strong className="text-cyan-400">Challenge:</strong> {todaysChallenge[1]?.description || "Loading..."}
                      </div>
                      <div className="text-lg text-gray-300">
                        <strong className="text-purple-400">Target:</strong> {todaysChallenge[1]?.targetValue || "0"} units
                      </div>
                      <div className="text-lg text-gray-300">
                        <strong className="text-green-400">Reward:</strong> {todaysChallenge[1]?.baseReward || "0"} FFT
                      </div>
                      
                      <div className="pt-4">
                        <input
                          type="number"
                          value={challengeProgress}
                          onChange={(e) => setChallengeProgress(Number(e.target.value))}
                          placeholder="Enter your progress"
                          className="w-full bg-gray-700/50 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-cyan-400 focus:outline-none"
                        />
                      </div>
                      
                      <div className="flex space-x-4 pt-4">
                        <button
                          onClick={handleStartChallenge}
                          disabled={isStartingChallenge}
                          className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          {isStartingChallenge ? 'Starting...' : 'Start Challenge'}
                        </button>
                        <button
                          onClick={handleSubmitProgress}
                          disabled={isSubmittingProgress || challengeProgress <= 0}
                          className="flex-1 bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50"
                        >
                          {isSubmittingProgress ? 'Submitting...' : 'Submit Progress'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">Loading today's challenge...</div>
                    </div>
                  )}
                </div>

                {/* User Stats */}
                <div className="bg-gray-800/20 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                  <h3 className="text-2xl font-bold text-white mb-6">Your Progress</h3>
                  
                  {userStats ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-cyan-400">{userStats.totalChallengesCompleted}</div>
                          <div className="text-gray-300">Challenges</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-purple-400">{userStats.currentStreak}</div>
                          <div className="text-gray-300">Day Streak</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400">{userStats.totalTokensEarned}</div>
                          <div className="text-gray-300">FFT Earned</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-orange-400">{userStats.longestStreak}</div>
                          <div className="text-gray-300">Best Streak</div>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          onClick={createAccount}
                          className="w-full bg-gradient-to-r from-pink-400 to-red-600 hover:from-pink-500 hover:to-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200"
                        >
                          Setup FlowFit Account
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-400">Loading your stats...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default FlowFitLanding 