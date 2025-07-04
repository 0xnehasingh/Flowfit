'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Zap, Trophy, Users, Coins, Star, ChevronRight, Activity, Sparkles, Flame, Target, Award, Wallet, Settings, Timer, CheckCircle, Crown, Gift, Calendar, Clock, Medal, Diamond, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useFlow } from '@/components/providers/FlowProvider'
import WalletConnection from '@/components/WalletConnection'
import TokenRewards from '@/components/TokenRewards'
import DynamicNFT from '@/components/DynamicNFT'

interface Challenge {
  description: string
  targetValue: number
  baseReward: number
  challengeType: string
  difficulty: string
  timeLimit?: number
  bonusReward?: number
}

interface UserStats {
  totalChallengesCompleted: number
  currentStreak: number
  totalTokensEarned: number
  longestStreak: number
  level: number
  experiencePoints: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  reward: number
}

const FlowFitLanding = () => {
  const { user, logIn, logOut, loading, createAccount, linkAccount, isAccountLinked, sendTransaction, executeScript, formatAddress } = useFlow()
  const [isClient, setIsClient] = useState(false)
  const [todaysChallenge, setTodaysChallenge] = useState<[number, Challenge] | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [tokenBalance, setTokenBalance] = useState('0')
  const [challengeProgress, setChallengeProgress] = useState(0)
  const [isStartingChallenge, setIsStartingChallenge] = useState(false)
  const [isSubmittingProgress, setIsSubmittingProgress] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)
  
  // Enhanced challenge states
  const [challengeStarted, setChallengeStarted] = useState(false)
  const [challengeStartTime, setChallengeStartTime] = useState<Date | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [showAchievement, setShowAchievement] = useState(false)
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([])
  const [streakBonus, setStreakBonus] = useState(0)
  const [perfectForm, setPerfectForm] = useState(false)
  
  // Wallet connection modal states
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [walletModalMode, setWalletModalMode] = useState<'connect' | 'account'>('connect')

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

  // Timer effect for active challenges
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (challengeStarted && challengeStartTime && timeRemaining && timeRemaining > 0) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - challengeStartTime.getTime()) / 1000)
        const remaining = Math.max(0, (todaysChallenge?.[1]?.timeLimit || 0) - elapsed)
        setTimeRemaining(remaining)
        
        if (remaining === 0) {
          setChallengeStarted(false)
          // Auto-submit progress if time runs out
          if (challengeProgress > 0) {
            handleSubmitProgress()
          }
        }
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [challengeStarted, challengeStartTime, timeRemaining, challengeProgress])

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
        difficulty: "Intermediate",
        timeLimit: 600, // 10 minutes
        bonusReward: 25
      }])
      setUserStats({
        totalChallengesCompleted: 42,
        currentStreak: 7,
        totalTokensEarned: 8500,
        longestStreak: 15,
        level: 8,
        experiencePoints: 2340
      })
      
      // Calculate streak bonus
      const currentStreak = 7
      setStreakBonus(Math.min(currentStreak * 5, 50)) // Max 50% bonus
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleStartChallenge = async () => {
    if (!user.loggedIn) return
    
    setIsStartingChallenge(true)
    try {
      // Start the challenge
      setChallengeStarted(true)
      setChallengeStartTime(new Date())
      setTimeRemaining(todaysChallenge?.[1]?.timeLimit || 600)
      
      // Simulate blockchain transaction to start challenge
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success message
      const toast = await import('react-hot-toast')
      toast.default.success('Challenge started! Get ready to crush it! 🔥', {
        duration: 3000,
        icon: '🚀'
      })
      
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
      // Calculate rewards and achievements
      const completionPercentage = (challengeProgress / (todaysChallenge?.[1]?.targetValue || 1)) * 100
      const baseReward = todaysChallenge?.[1]?.baseReward || 0
      const bonusReward = streakBonus > 0 ? Math.floor(baseReward * (streakBonus / 100)) : 0
      const perfectFormBonus = perfectForm ? 20 : 0
      const totalReward = baseReward + bonusReward + perfectFormBonus
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Check for achievements
      const achievements: Achievement[] = []
      
      if (completionPercentage >= 100) {
        achievements.push({
          id: 'challenge_complete',
          title: 'Challenge Crusher',
          description: 'Completed daily challenge!',
          icon: <Trophy className="w-6 h-6" />,
          rarity: 'common',
          reward: 25
        })
      }
      
      if (perfectForm) {
        achievements.push({
          id: 'perfect_form',
          title: 'Form Master',
          description: 'Perfect form execution!',
          icon: <Star className="w-6 h-6" />,
          rarity: 'rare',
          reward: 50
        })
      }
      
      if (userStats && userStats.currentStreak >= 7) {
        achievements.push({
          id: 'week_warrior',
          title: 'Week Warrior',
          description: '7-day streak achieved!',
                     icon: <Flame className="w-6 h-6" />,
          rarity: 'epic',
          reward: 100
        })
      }
      
      // Update balance
      const currentBalance = parseInt(tokenBalance.replace(',', ''))
      setTokenBalance((currentBalance + totalReward).toLocaleString())
      
      // Show achievements
      if (achievements.length > 0) {
        setNewAchievements(achievements)
        setShowAchievement(true)
      }
      
      // Reset challenge state
      setChallengeStarted(false)
      setChallengeProgress(0)
      
      // Update user stats
      if (userStats) {
        setUserStats({
          ...userStats,
          totalChallengesCompleted: userStats.totalChallengesCompleted + 1,
          totalTokensEarned: userStats.totalTokensEarned + totalReward,
          experiencePoints: userStats.experiencePoints + Math.floor(totalReward / 2)
        })
      }
      
      const toast = await import('react-hot-toast')
      toast.default.success(`🎉 Progress submitted! Earned ${totalReward} FFT tokens!`, {
        duration: 4000
      })
      
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

  // Enhanced wallet connection handlers
  const handleConnectWallet = () => {
    setWalletModalMode('connect')
    setShowWalletModal(true)
  }

  const handleAccountClick = () => {
    setWalletModalMode('account')
    setShowWalletModal(true)
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return 'from-green-400 to-emerald-500'
    if (percentage >= 75) return 'from-yellow-400 to-orange-500'
    if (percentage >= 50) return 'from-cyan-400 to-blue-500'
    return 'from-purple-400 to-pink-500'
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
                  onClick={handleAccountClick}
                  className="glass-card !p-3 hover:scale-105 transition-all duration-200 flex items-center space-x-2"
                >
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  <span className="font-semibold">{formatAddress(user.addr)}</span>
                </button>
                <button
                  onClick={handleAccountClick}
                  className="secondary-button !py-2 !px-4 flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Account</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="morphing-button flex items-center space-x-2"
                disabled={loading}
              >
                <Wallet className="w-5 h-5" />
                <span>{loading ? 'Connecting...' : 'Connect Wallet'}</span>
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
                    onClick={handleConnectWallet}
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

              {/* Real Crypto Rewards Feature Highlight */}
              <div className="neo-card !p-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl 
                               flex items-center justify-center mx-auto mb-6">
                    <Coins className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-2">
                    REAL CRYPTO REWARDS
                  </div>
                  <h2 className="text-4xl font-bold gradient-text mb-4">Earn FlowFit Tokens</h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Get rewarded with FFT tokens for completing workouts and maintaining streaks
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Challenge Rewards</h3>
                    <p className="text-gray-400 mb-3">Earn 100+ FFT for completing daily challenges</p>
                    <div className="text-2xl font-bold text-cyan-400">100 FFT</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Flame className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Streak Bonuses</h3>
                    <p className="text-gray-400 mb-3">Get up to 50% bonus for maintaining streaks</p>
                    <div className="text-2xl font-bold text-orange-400">+50%</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Star className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Perfect Form</h3>
                    <p className="text-gray-400 mb-3">Extra rewards for maintaining perfect form</p>
                    <div className="text-2xl font-bold text-green-400">+20%</div>
                  </div>
                </div>
                
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-cyan-400/10 to-purple-600/10 
                             border border-cyan-400/20 rounded-2xl px-6 py-3">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  <span className="text-cyan-400 font-semibold">Gasless transactions - No fees ever!</span>
                </div>
              </div>

              {/* Dynamic NFT Achievements Feature */}
              <div className="neo-card !p-8 text-center">
                <div className="mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-600 rounded-3xl 
                               flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">
                    EVOLVING DIGITAL ASSETS
                  </div>
                  <h2 className="text-4xl font-bold gradient-text mb-4">Dynamic NFT Achievements</h2>
                  <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                    Unlock evolving NFTs that level up with your fitness progress
                  </p>
                </div>
                
                <div className="grid md:grid-cols-5 gap-4 mb-8">
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-600 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Bronze</h3>
                    <p className="text-gray-400 text-sm mb-2">Starting tier</p>
                    <div className="text-xl font-bold text-orange-400">+10%</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-400 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Silver</h3>
                    <p className="text-gray-400 text-sm mb-2">Level 8+</p>
                    <div className="text-xl font-bold text-gray-300">+25%</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6 ring-2 ring-yellow-400/30">
                    <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Gold</h3>
                    <p className="text-gray-400 text-sm mb-2">Level 15+</p>
                    <div className="text-xl font-bold text-yellow-400">+50%</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-300 to-gray-500 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Platinum</h3>
                    <p className="text-gray-400 text-sm mb-2">Level 25+</p>
                    <div className="text-xl font-bold text-gray-300">+100%</div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-2xl p-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl 
                                 flex items-center justify-center mx-auto mb-4">
                      <Diamond className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Diamond</h3>
                    <p className="text-gray-400 text-sm mb-2">Level 50+</p>
                    <div className="text-xl font-bold text-cyan-400">+150%</div>
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-400/10 to-pink-600/10 
                               border border-purple-400/20 rounded-xl px-4 py-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-purple-400 font-semibold text-sm">Dynamic Traits</span>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 
                               border border-cyan-400/20 rounded-xl px-4 py-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-semibold text-sm">Auto Evolution</span>
                  </div>
                  <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/10 to-orange-500/10 
                               border border-yellow-400/20 rounded-xl px-4 py-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">Bonus Multipliers</span>
                  </div>
                </div>
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
                
                {/* Streak Bonus Banner */}
                {streakBonus > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 inline-flex items-center space-x-2 bg-gradient-to-r from-orange-400 to-red-500 
                             text-white px-4 py-2 rounded-full font-bold"
                  >
                                         <Flame className="w-5 h-5" />
                     <span>🔥 {streakBonus}% Streak Bonus Active!</span>
                  </motion.div>
                )}
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center">
                        <Target className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold gradient-text">Today's VRF Challenge</h3>
                    </div>
                    
                    {/* Timer Display */}
                    {challengeStarted && timeRemaining !== null && (
                      <div className="flex items-center space-x-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 
                                   border border-red-500/30 rounded-xl px-4 py-2">
                        <Timer className="w-5 h-5 text-red-400" />
                        <span className="font-bold text-red-400">{formatTime(timeRemaining)}</span>
                      </div>
                    )}
                  </div>
                  
                  {todaysChallenge ? (
                    <div className="space-y-6">
                      <div className="neo-card !p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-cyan-400 font-semibold text-lg">Challenge:</span>
                            <div className="flex items-center space-x-2">
                              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-semibold">
                                {todaysChallenge[1]?.difficulty}
                              </span>
                              {challengeStarted && (
                                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                  <span>Active</span>
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-white text-xl font-medium">
                            {todaysChallenge[1]?.description}
                          </p>
                          
                          <div className="grid grid-cols-3 gap-4 pt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-400">{todaysChallenge[1]?.targetValue}</div>
                              <div className="text-gray-400 text-sm">Target Reps</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-400">{todaysChallenge[1]?.baseReward}</div>
                              <div className="text-gray-400 text-sm">Base FFT</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-400">+{streakBonus}%</div>
                              <div className="text-gray-400 text-sm">Streak Bonus</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Input */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="block text-lg font-semibold text-white">
                            Enter Your Progress
                          </label>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => setPerfectForm(!perfectForm)}
                              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold transition-all ${
                                perfectForm 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-gray-700/50 text-gray-400 border border-gray-600'
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>Perfect Form</span>
                            </button>
                          </div>
                        </div>
                        
                        <input
                          type="number"
                          value={challengeProgress}
                          onChange={(e) => setChallengeProgress(Number(e.target.value))}
                          placeholder="How many did you complete?"
                          className="w-full bg-gray-800/50 text-white px-6 py-4 rounded-2xl border border-gray-600 focus:border-cyan-400 focus:outline-none text-lg font-medium"
                          disabled={!challengeStarted}
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
                            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${Math.min(100, (challengeProgress / (todaysChallenge[1]?.targetValue || 1)) * 100)}%` 
                                }}
                                className={`h-full bg-gradient-to-r ${getProgressColor((challengeProgress / (todaysChallenge[1]?.targetValue || 1)) * 100)} 
                                          relative overflow-hidden`}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </motion.div>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-4">
                        {!challengeStarted ? (
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
                              <span className="flex items-center justify-center space-x-2">
                                <Play className="w-5 h-5" />
                                <span>Start Challenge</span>
                              </span>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={handleSubmitProgress}
                            disabled={isSubmittingProgress || challengeProgress <= 0}
                            className="flex-1 morphing-button !py-4 disabled:opacity-50"
                          >
                            {isSubmittingProgress ? (
                              <span className="flex items-center justify-center space-x-2">
                                <div className="cosmic-loader !w-5 !h-5"></div>
                                <span>Submitting...</span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center space-x-2">
                                <CheckCircle className="w-5 h-5" />
                                <span>Submit Progress ({challengeProgress} reps)</span>
                              </span>
                            )}
                          </button>
                        )}
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
                            <div className="text-2xl font-bold text-white flex items-center space-x-2">
                              <span>Level {userStats.level}</span>
                              {userStats.level >= 5 && <Crown className="w-6 h-6 text-yellow-400" />}
                            </div>
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
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(userStats.experiencePoints / ((userStats.level + 1) * 500)) * 100}%` 
                              }}
                              className="h-full bg-gradient-to-r from-purple-400 to-pink-600 relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </motion.div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-cyan-400 mb-1 flex items-center justify-center space-x-2">
                            <span>{userStats.totalChallengesCompleted}</span>
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div className="text-gray-300 text-sm">Challenges</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                                                     <div className="text-3xl font-bold text-purple-400 mb-1 flex items-center justify-center space-x-2">
                             <span>{userStats.currentStreak}</span>
                             <Flame className="w-6 h-6" />
                           </div>
                          <div className="text-gray-300 text-sm">Day Streak</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-green-400 mb-1 flex items-center justify-center space-x-2">
                            <span>{userStats.totalTokensEarned.toLocaleString()}</span>
                            <Coins className="w-6 h-6" />
                          </div>
                          <div className="text-gray-300 text-sm">FFT Earned</div>
                        </div>
                        <div className="neo-card !p-4 text-center">
                          <div className="text-3xl font-bold text-orange-400 mb-1 flex items-center justify-center space-x-2">
                            <span>{userStats.longestStreak}</span>
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="text-gray-300 text-sm">Best Streak</div>
                        </div>
                      </div>
                      
                      <button
                        onClick={createAccount}
                        className="w-full morphing-button !py-4 text-lg flex items-center justify-center space-x-2"
                      >
                        <Gift className="w-6 h-6" />
                        <span>Setup FlowFit Account</span>
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

              {/* Token Rewards and NFT Section */}
              <div className="grid lg:grid-cols-2 gap-8 mt-8">
                {/* Token Rewards Panel */}
                <div className="glass-card space-y-6">
                  <TokenRewards
                    challengeProgress={challengeProgress}
                    targetValue={todaysChallenge?.[1]?.targetValue || 50}
                    baseReward={todaysChallenge?.[1]?.baseReward || 100}
                    currentStreak={userStats?.currentStreak || 7}
                    userLevel={userStats?.level || 8}
                    perfectForm={perfectForm}
                    onRewardCalculated={(calculation) => {
                      console.log('Reward calculation:', calculation)
                    }}
                  />
                </div>

                {/* Dynamic NFT Panel */}
                <div className="glass-card space-y-6">
                  <DynamicNFT
                    userStats={userStats}
                    onNFTEvolution={(nft) => {
                      console.log('NFT evolved:', nft)
                      // Could trigger celebrations or update UI
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Achievement Modal */}
      <AnimatePresence>
        {showAchievement && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowAchievement(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mx-4 max-w-md w-full
                       border border-cyan-400/30 shadow-2xl shadow-cyan-400/20"
            >
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full 
                                flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-400 to-pink-500 
                                text-white text-xs px-2 py-1 rounded-full font-bold">
                    NEW!
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold gradient-text mb-2">🎉 Achievement Unlocked!</h3>
                  <div className="space-y-3">
                    {newAchievements.map((achievement, index) => (
                      <div key={achievement.id} className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-yellow-400">{achievement.icon}</div>
                          <div>
                            <h4 className="font-bold text-white">{achievement.title}</h4>
                            <p className="text-gray-300 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <span className="text-green-400 font-bold">+{achievement.reward} FFT</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAchievement(false)}
                  className="morphing-button w-full py-3"
                >
                  Awesome! 🚀
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wallet Connection Modal */}
      <WalletConnection
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        mode={walletModalMode}
      />
    </div>
  )
}

export default FlowFitLanding 