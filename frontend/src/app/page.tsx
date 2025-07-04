'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Zap, Trophy, Users, Coins, Star, ChevronRight, Activity, Sparkles, Flame, Target, Award } from 'lucide-react'
import Link from 'next/link'
import { useFlow } from '@/components/providers/FlowProvider'

interface Challenge {
  description: string
  targetValue: number
  baseReward: number
  challengeType: string
  difficulty: string
}

interface UserStats {
  totalChallengesCompleted: number
  currentStreak: number
  totalTokensEarned: number
  longestStreak: number
  level: number
  experiencePoints: number
}

const FlowFitLanding = () => {
  const { user, logIn, logOut, loading, createAccount, linkAccount, isAccountLinked, sendTransaction, executeScript } = useFlow()
  const [isClient, setIsClient] = useState(false)
  const [todaysChallenge, setTodaysChallenge] = useState<[number, Challenge] | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [tokenBalance, setTokenBalance] = useState('0')
  const [challengeProgress, setChallengeProgress] = useState(0)
  const [isStartingChallenge, setIsStartingChallenge] = useState(false)
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setIsClient(true)
    
    // Auto-rotate featured content
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 6)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (user.loggedIn) {
      loadUserData()
    }
  }, [user.loggedIn])

  const loadUserData = async () => {
    try {
      // Simulate loading with proper typing
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock data for demo
      setTokenBalance('1,250')
      setTodaysChallenge([1, {
        description: "Complete 50 Push-ups with Perfect Form",
        targetValue: 50,
        baseReward: 100,
        challengeType: "Strength",
        difficulty: "Intermediate"
      }])
      setUserStats({
        totalChallengesCompleted: 42,
        currentStreak: 7,
        totalTokensEarned: 8500,
        longestStreak: 15,
        level: 8,
        experiencePoints: 2340
      })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleStartChallenge = async () => {
    if (!user.loggedIn) return
    
    setIsStartingChallenge(true)
    try {
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
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
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
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
      icon: <Target className="w-8 h-8" />,
      title: "VRF-Powered Challenges",
      description: "Fair, unpredictable daily challenges using Flow's Verifiable Random Function",
      highlight: "Truly Random & Fair",
      color: "from-cyan-400 to-blue-600"
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Earn FlowFit Tokens",
      description: "Get rewarded with FFT tokens for completing workouts and maintaining streaks",
      highlight: "Real Crypto Rewards",
      color: "from-yellow-400 to-orange-600"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Dynamic NFT Achievements",
      description: "Unlock evolving NFTs that level up with your fitness progress",
      highlight: "Evolving Digital Assets",
      color: "from-purple-400 to-pink-600"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Sponsored Transactions",
      description: "Zero gas fees with Flow's sponsored transactions for seamless UX",
      highlight: "Gasless Experience",
      color: "from-green-400 to-emerald-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Social Recovery",
      description: "Connect social accounts for easy onboarding and recovery",
      highlight: "Web2 Simplicity",
      color: "from-indigo-400 to-purple-600"
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Real-World Rewards",
      description: "Redeem tokens for gym memberships, gear, and supplements",
      highlight: "Tangible Benefits",
      color: "from-rose-400 to-red-600"
    }
  ]

  const statsData = [
    { label: "Active Users", value: 125, suffix: "K+", icon: <Users className="w-6 h-6" />, color: "text-cyan-400" },
    { label: "Workouts Completed", value: 850, suffix: "K+", icon: <Activity className="w-6 h-6" />, color: "text-green-400" },
    { label: "Tokens Earned", value: 2.1, suffix: "M+", icon: <Coins className="w-6 h-6" />, color: "text-yellow-400" },
    { label: "NFTs Minted", value: 87, suffix: "K+", icon: <Trophy className="w-6 h-6" />, color: "text-purple-400" }
  ]

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="cosmic-background"></div>
        <div className="cosmic-loader"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Unique Animated Background */}
      <div className="cosmic-background"></div>
      <div className="energy-particles"></div>
      <div className="aurora-overlay"></div>
      
      {/* Navigation */}
      <nav className="relative z-50 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">FlowFit</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user.loggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="glass-card !p-3">
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <span className="font-semibold">{tokenBalance} FFT</span>
                  </div>
                </div>
                <button
                  onClick={logOut}
                  className="secondary-button !py-2 !px-4"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={logIn}
                className="morphing-button"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-20">
        <div className="max-w-7xl mx-auto">
          {!user.loggedIn ? (
            // Landing Page
            <div className="space-y-20">
              {/* Hero Section */}
              <div className="text-center space-y-8 pt-10">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-6"
                >
                  <h1 className="text-6xl md:text-8xl font-black leading-tight">
                    <span className="gradient-text glow-text">FlowFit</span>
                    <br />
                    <span className="text-white">Revolution</span>
                  </h1>
                  <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto">
                    The first <span className="gradient-text font-bold">gasless fitness protocol</span> 
                    that rewards your workouts with crypto and evolving NFTs
                  </p>
                  <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                    Powered by Flow's VRF for fair challenges, Account Linking for seamless onboarding, 
                    and Sponsored Transactions for zero-barrier entry
                  </p>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                  <button
                    onClick={logIn}
                    className="morphing-button text-xl py-6 px-12"
                  >
                    <span className="flex items-center space-x-3">
                      <Flame className="w-6 h-6" />
                      <span>Start Your Journey</span>
                    </span>
                  </button>
                  <button className="secondary-button text-xl py-6 px-12">
                    <span className="flex items-center space-x-3">
                      <Play className="w-6 h-6" />
                      <span>Watch Demo</span>
                    </span>
                  </button>
                </motion.div>
              </div>

              {/* Interactive Features Grid */}
              <div className="grid md:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`glass-card hover:scale-105 cursor-pointer ${
                      activeFeature === index ? 'border-cyan-400/50 shadow-2xl shadow-cyan-400/20' : ''
                    }`}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 interactive-icon`}>
                      {feature.icon}
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-cyan-400 uppercase tracking-wide">
                          {feature.highlight}
                        </div>
                        <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                      </div>
                      <p className="text-gray-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Animated Stats */}
              <div className="neo-card">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold gradient-text mb-4">Platform Statistics</h2>
                  <p className="text-gray-300 text-lg">Join thousands of users earning crypto through fitness</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {statsData.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="text-center space-y-3"
                    >
                      <div className="flex justify-center mb-3">
                        <div className={`${stat.color} interactive-icon`}>
                          {stat.icon}
                        </div>
                      </div>
                      <div className={`text-4xl md:text-5xl font-black ${stat.color} glow-text`}>
                        {stat.value}{stat.suffix}
                      </div>
                      <div className="text-gray-300 font-medium text-lg">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // User Dashboard
            <div className="space-y-8">
              {/* Welcome Banner */}
              <div className="glass-card text-center">
                <h2 className="text-4xl font-bold gradient-text mb-4">
                  Welcome back, Fitness Champion! 🏆
                </h2>
                <p className="text-gray-300 text-lg">
                  Ready to crush today's VRF-powered challenge and earn some FFT?
                </p>
              </div>

              {/* Account Linking Alert */}
              {!isAccountLinked && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card border-2 border-yellow-400/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">Secure Your Account</h3>
                        <p className="text-gray-300">
                          Link your social accounts for easy recovery and enhanced security.
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAccountLink('google')}
                        className="morphing-button !py-3 !px-6"
                      >
                        Link Google
                      </button>
                      <button
                        onClick={() => handleAccountLink('discord')}
                        className="secondary-button !py-3 !px-6"
                      >
                        Link Discord
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Main Dashboard Grid */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Today's Challenge */}
                <div className="glass-card space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold gradient-text">Today's VRF Challenge</h3>
                  </div>
                  
                  {todaysChallenge ? (
                    <div className="space-y-6">
                      <div className="neo-card !p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-400 font-semibold text-lg">Challenge:</span>
                            <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                              {todaysChallenge[1]?.difficulty}
                            </span>
                          </div>
                          <p className="text-white text-xl font-medium">
                            {todaysChallenge[1]?.description}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{todaysChallenge[1]?.targetValue}</div>
                              <div className="text-gray-400">Target Reps</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">{todaysChallenge[1]?.baseReward}</div>
                              <div className="text-gray-400">FFT Reward</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Input */}
                      <div className="space-y-4">
                        <label className="block text-lg font-semibold text-white">
                          Enter Your Progress
                        </label>
                        <input
                          type="number"
                          value={challengeProgress}
                          onChange={(e) => setChallengeProgress(Number(e.target.value))}
                          placeholder="How many did you complete?"
                          className="w-full bg-gray-800/50 text-white px-6 py-4 rounded-2xl border border-gray-600 focus:border-cyan-400 focus:outline-none text-lg font-medium"
                        />
                        
                        {/* Progress Bar */}
                        {challengeProgress > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-400">Progress</span>
                              <span className="text-cyan-400 font-semibold">
                                {Math.min(100, (challengeProgress / (todaysChallenge[1]?.targetValue || 1)) * 100).toFixed(0)}%
                              </span>
                            </div>
                            <div 
                              className="energy-progress" 
                              style={{
                                '--progress': `${Math.min(100, (challengeProgress / (todaysChallenge[1]?.targetValue || 1)) * 100)}%`
                              } as React.CSSProperties}
                            ></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-4">
                        <button
                          onClick={handleStartChallenge}
                          disabled={isStartingChallenge}
                          className="flex-1 morphing-button !py-4"
                        >
                          {isStartingChallenge ? (
                            <span className="flex items-center justify-center space-x-2">
                              <div className="cosmic-loader !w-5 !h-5"></div>
                              <span>Starting...</span>
                            </span>
                          ) : (
                            'Start Challenge'
                          )}
                        </button>
                        <button
                          onClick={handleSubmitProgress}
                          disabled={isSubmittingProgress || challengeProgress <= 0}
                          className="flex-1 secondary-button !py-4 disabled:opacity-50"
                        >
                          {isSubmittingProgress ? (
                            <span className="flex items-center justify-center space-x-2">
                              <div className="cosmic-loader !w-5 !h-5"></div>
                              <span>Submitting...</span>
                            </span>
                          ) : (
                            'Submit Progress'
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="cosmic-loader mx-auto mb-4"></div>
                      <div className="text-gray-400 text-lg">Loading today's challenge...</div>
                    </div>
                  )}
                </div>

                {/* User Stats */}
                <div className="glass-card space-y-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-600 rounded-xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold gradient-text">Your Progress</h3>
                  </div>
                  
                  {userStats ? (
                    <div className="space-y-6">
                      {/* Level Progress */}
                      <div className="neo-card !p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-2xl font-bold text-white">Level {userStats.level}</div>
                            <div className="text-gray-400">Fitness Champion</div>
                          </div>
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full flex items-center justify-center">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">XP Progress</span>
                            <span className="text-purple-400 font-semibold">
                              {userStats.experiencePoints} / {(userStats.level + 1) * 500} XP
                            </span>
                          </div>
                          <div 
                            className="energy-progress" 
                            style={{
                              '--progress': `${(userStats.experiencePoints / ((userStats.level + 1) * 500)) * 100}%`
                            } as React.CSSProperties}
                          ></div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-cyan-400 mb-1">{userStats.totalChallengesCompleted}</div>
                          <div className="text-gray-300 text-sm">Challenges</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-purple-400 mb-1">{userStats.currentStreak}</div>
                          <div className="text-gray-300 text-sm">Day Streak</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-green-400 mb-1">{userStats.totalTokensEarned.toLocaleString()}</div>
                          <div className="text-gray-300 text-sm">FFT Earned</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-orange-400 mb-1">{userStats.longestStreak}</div>
                          <div className="text-gray-300 text-sm">Best Streak</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={createAccount}
                        className="w-full morphing-button !py-4 text-lg"
                      >
                        Setup FlowFit Account
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="cosmic-loader mx-auto mb-4"></div>
                      <div className="text-gray-400 text-lg">Loading your stats...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default FlowFitLanding 