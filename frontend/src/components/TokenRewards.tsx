'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Coins, 
  Trophy, 
  Flame, 
  Star, 
  Gift, 
  TrendingUp, 
  Calendar, 
  Zap,
  Award,
  Target,
  CheckCircle,
  Clock,
  Sparkles
} from 'lucide-react'
import { useFlow } from '@/components/providers/FlowProvider'

interface TokenReward {
  type: 'challenge' | 'streak' | 'perfect_form' | 'level_up' | 'bonus'
  amount: number
  reason: string
  timestamp: Date
  multiplier?: number
}

interface RewardCalculation {
  baseReward: number
  streakBonus: number
  perfectFormBonus: number
  levelBonus: number
  totalReward: number
  breakdown: {
    label: string
    amount: number
    color: string
  }[]
}

interface TokenRewardsProps {
  challengeProgress: number
  targetValue: number
  baseReward: number
  currentStreak: number
  userLevel: number
  perfectForm: boolean
  onRewardCalculated?: (calculation: RewardCalculation) => void
}

export default function TokenRewards({
  challengeProgress,
  targetValue,
  baseReward,
  currentStreak,
  userLevel,
  perfectForm,
  onRewardCalculated
}: TokenRewardsProps) {
  const { user, sendTransaction } = useFlow()
  const [recentRewards, setRecentRewards] = useState<TokenReward[]>([])
  const [showRewardBreakdown, setShowRewardBreakdown] = useState(false)
  const [animatingReward, setAnimatingReward] = useState<TokenReward | null>(null)
  const [totalEarned, setTotalEarned] = useState(8500)

  // Calculate potential rewards in real-time
  const calculateRewards = (): RewardCalculation => {
    const completionPercentage = Math.min(100, (challengeProgress / targetValue) * 100)
    
    // Base reward (proportional to completion)
    const earnedBaseReward = Math.floor(baseReward * (completionPercentage / 100))
    
    // Streak bonus (5% per day, max 50%)
    const streakMultiplier = Math.min(currentStreak * 0.05, 0.5)
    const streakBonus = Math.floor(earnedBaseReward * streakMultiplier)
    
    // Perfect form bonus
    const perfectFormBonus = perfectForm ? Math.floor(baseReward * 0.2) : 0
    
    // Level bonus (2% per level)
    const levelMultiplier = userLevel * 0.02
    const levelBonus = Math.floor(earnedBaseReward * levelMultiplier)
    
    const totalReward = earnedBaseReward + streakBonus + perfectFormBonus + levelBonus
    
    const breakdown = [
      {
        label: 'Base Reward',
        amount: earnedBaseReward,
        color: 'text-cyan-400'
      },
      {
        label: `Streak Bonus (${currentStreak} days)`,
        amount: streakBonus,
        color: 'text-orange-400'
      },
      {
        label: 'Perfect Form Bonus',
        amount: perfectFormBonus,
        color: 'text-green-400'
      },
      {
        label: `Level Bonus (Lv.${userLevel})`,
        amount: levelBonus,
        color: 'text-purple-400'
      }
    ].filter(item => item.amount > 0)

    return {
      baseReward: earnedBaseReward,
      streakBonus,
      perfectFormBonus,
      levelBonus,
      totalReward,
      breakdown
    }
  }

  const rewardCalculation = calculateRewards()

  useEffect(() => {
    onRewardCalculated?.(rewardCalculation)
  }, [challengeProgress, perfectForm, currentStreak, userLevel])

  const addReward = async (reward: TokenReward) => {
    // Simulate blockchain transaction for minting tokens
    try {
      const transactionCode = `
        import FlowFitToken from 0xFLOWFIT_ADDRESS
        
        transaction(amount: UFix64, recipient: Address) {
          let minter: &FlowFitToken.Minter
          
          prepare(signer: AuthAccount) {
            self.minter = signer.borrow<&FlowFitToken.Minter>(from: FlowFitToken.MinterStoragePath)
              ?? panic("Could not borrow minter reference")
          }
          
          execute {
            let recipientVault = getAccount(recipient)
              .getCapability(FlowFitToken.VaultPublicPath)
              .borrow<&FlowFitToken.Vault{FungibleToken.Receiver}>()
              ?? panic("Could not borrow receiver reference")
            
            let tokens <- self.minter.mintTokens(amount: amount)
            recipientVault.deposit(from: <-tokens)
            
            log("Minted ".concat(amount.toString()).concat(" FFT tokens for workout completion"))
          }
        }
      `
      
      // In a real implementation, this would call the actual smart contract
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setRecentRewards(prev => [reward, ...prev.slice(0, 4)])
      setTotalEarned(prev => prev + reward.amount)
      setAnimatingReward(reward)
      
      setTimeout(() => setAnimatingReward(null), 3000)
      
    } catch (error) {
      console.error('Error minting tokens:', error)
    }
  }

  const claimRewards = async () => {
    if (rewardCalculation.totalReward === 0) return

    const reward: TokenReward = {
      type: 'challenge',
      amount: rewardCalculation.totalReward,
      reason: 'Challenge completed with bonuses',
      timestamp: new Date()
    }

    await addReward(reward)
  }

  return (
    <div className="space-y-6">
      {/* Real-time Reward Calculator */}
      <div className="neo-card !p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <Coins className="w-6 h-6 text-yellow-400" />
            <span>Token Rewards</span>
          </h3>
          <button
            onClick={() => setShowRewardBreakdown(!showRewardBreakdown)}
            className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold"
          >
            {showRewardBreakdown ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {/* Potential Rewards Display */}
        <div className="text-center mb-6">
          <motion.div
            key={rewardCalculation.totalReward}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-black text-yellow-400 mb-2"
          >
            +{rewardCalculation.totalReward} FFT
          </motion.div>
          <p className="text-gray-400">Potential reward for current progress</p>
        </div>

        {/* Progress to Rewards */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-cyan-400 font-semibold">
              {Math.min(100, (challengeProgress / targetValue) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${Math.min(100, (challengeProgress / targetValue) * 100)}%` 
              }}
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </motion.div>
          </div>
        </div>

        {/* Reward Breakdown */}
        <AnimatePresence>
          {showRewardBreakdown && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-gray-700"
            >
              {rewardCalculation.breakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-300">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>+{item.amount} FFT</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reward Multipliers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="neo-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-orange-400">
                {Math.min(currentStreak * 5, 50)}%
              </div>
              <div className="text-gray-400 text-sm">Streak Bonus</div>
            </div>
          </div>
        </div>

        <div className="neo-card !p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-purple-400">
                {perfectForm ? '20%' : '0%'}
              </div>
              <div className="text-gray-400 text-sm">Form Bonus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Rewards */}
      {recentRewards.length > 0 && (
        <div className="neo-card !p-6">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span>Recent Rewards</span>
          </h4>
          
          <div className="space-y-3">
            {recentRewards.map((reward, index) => (
              <motion.div
                key={`${reward.timestamp.getTime()}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{reward.reason}</div>
                    <div className="text-gray-400 text-sm">
                      {reward.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-bold">+{reward.amount} FFT</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Total Earned Stats */}
      <div className="neo-card !p-6 text-center">
        <div className="text-3xl font-black gradient-text mb-2">
          {totalEarned.toLocaleString()} FFT
        </div>
        <p className="text-gray-400 mb-4">Total Earned This Session</p>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-cyan-400">{recentRewards.length}</div>
            <div className="text-gray-400 text-sm">Rewards</div>
          </div>
          <div>
            <div className="text-xl font-bold text-orange-400">{currentStreak}</div>
            <div className="text-gray-400 text-sm">Day Streak</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">Lv.{userLevel}</div>
            <div className="text-gray-400 text-sm">Level</div>
          </div>
        </div>
      </div>

      {/* Floating Reward Animation */}
      <AnimatePresence>
        {animatingReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{ opacity: 1, scale: 1, y: -100 }}
            exit={{ opacity: 0, scale: 0.5, y: -200 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50
                     bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full
                     font-bold text-lg shadow-2xl"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>+{animatingReward.amount} FFT Earned!</span>
              <Coins className="w-5 h-5" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 