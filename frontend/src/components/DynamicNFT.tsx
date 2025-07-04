'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Crown, 
  Zap, 
  Award, 
  TrendingUp, 
  Sparkles, 
  Shield, 
  Flame,
  Diamond,
  Gem,
  Target,
  Activity,
  Calendar,
  Medal
} from 'lucide-react'
import { useFlow } from '@/components/providers/FlowProvider'

interface NFTTrait {
  name: string
  value: string | number
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythic'
  color: string
}

interface DynamicNFT {
  id: string
  name: string
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond'
  level: number
  experience: number
  maxExperience: number
  image: string
  description: string
  traits: NFTTrait[]
  evolutionProgress: number
  bonusMultiplier: number
  unlockedAt: Date
  lastEvolution?: Date
  evolutionHistory: string[]
}

interface DynamicNFTProps {
  userStats: {
    totalChallengesCompleted: number
    currentStreak: number
    totalTokensEarned: number
    longestStreak: number
    level: number
    experiencePoints: number
  } | null
  onNFTEvolution?: (nft: DynamicNFT) => void
}

export default function DynamicNFT({ userStats, onNFTEvolution }: DynamicNFTProps) {
  const { user, sendTransaction } = useFlow()
  const [userNFTs, setUserNFTs] = useState<DynamicNFT[]>([])
  const [selectedNFT, setSelectedNFT] = useState<DynamicNFT | null>(null)
  const [showEvolutionModal, setShowEvolutionModal] = useState(false)
  const [evolutionNFT, setEvolutionNFT] = useState<DynamicNFT | null>(null)
  const [isEvolving, setIsEvolving] = useState(false)

  // Generate NFT based on user progress
  const generateNFT = (userStats: any): DynamicNFT => {
    const getTier = (level: number): DynamicNFT['tier'] => {
      if (level >= 50) return 'Diamond'
      if (level >= 25) return 'Platinum'
      if (level >= 15) return 'Gold'
      if (level >= 8) return 'Silver'
      return 'Bronze'
    }

    const tier = getTier(userStats.level)
    const experience = userStats.experiencePoints
    const maxExperience = (userStats.level + 1) * 500

    const traits: NFTTrait[] = [
      {
        name: 'Fitness Level',
        value: userStats.level,
        rarity: userStats.level >= 20 ? 'legendary' : userStats.level >= 10 ? 'epic' : 'rare',
        color: 'text-purple-400'
      },
      {
        name: 'Current Streak',
        value: `${userStats.currentStreak} days`,
        rarity: userStats.currentStreak >= 30 ? 'mythic' : userStats.currentStreak >= 14 ? 'legendary' : 'epic',
        color: 'text-orange-400'
      },
      {
        name: 'Total Challenges',
        value: userStats.totalChallengesCompleted,
        rarity: userStats.totalChallengesCompleted >= 100 ? 'legendary' : userStats.totalChallengesCompleted >= 50 ? 'epic' : 'rare',
        color: 'text-cyan-400'
      },
      {
        name: 'Tokens Earned',
        value: `${userStats.totalTokensEarned.toLocaleString()} FFT`,
        rarity: userStats.totalTokensEarned >= 10000 ? 'mythic' : userStats.totalTokensEarned >= 5000 ? 'legendary' : 'epic',
        color: 'text-green-400'
      },
      {
        name: 'Best Streak',
        value: `${userStats.longestStreak} days`,
        rarity: userStats.longestStreak >= 60 ? 'mythic' : userStats.longestStreak >= 30 ? 'legendary' : 'epic',
        color: 'text-yellow-400'
      }
    ]

    return {
      id: 'flowfit-achievement-001',
      name: `${tier} Fitness Champion`,
      tier,
      level: userStats.level,
      experience,
      maxExperience,
      image: `/nft-${tier.toLowerCase()}.png`,
      description: `A dynamic NFT that evolves with your fitness journey. Currently at ${tier} tier.`,
      traits,
      evolutionProgress: (experience / maxExperience) * 100,
      bonusMultiplier: getBonusMultiplier(tier),
      unlockedAt: new Date(),
      evolutionHistory: [`Achieved ${tier} tier at level ${userStats.level}`]
    }
  }

  const getBonusMultiplier = (tier: DynamicNFT['tier']): number => {
    switch (tier) {
      case 'Diamond': return 2.5
      case 'Platinum': return 2.0
      case 'Gold': return 1.5
      case 'Silver': return 1.25
      case 'Bronze': return 1.1
      default: return 1.0
    }
  }

  const getTierColor = (tier: DynamicNFT['tier']): string => {
    switch (tier) {
      case 'Diamond': return 'from-cyan-400 to-blue-600'
      case 'Platinum': return 'from-gray-300 to-gray-500'
      case 'Gold': return 'from-yellow-400 to-orange-500'
      case 'Silver': return 'from-gray-200 to-gray-400'
      case 'Bronze': return 'from-orange-400 to-red-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getTierIcon = (tier: DynamicNFT['tier']) => {
    switch (tier) {
      case 'Diamond': return <Diamond className="w-8 h-8 text-cyan-400" />
      case 'Platinum': return <Crown className="w-8 h-8 text-gray-300" />
      case 'Gold': return <Trophy className="w-8 h-8 text-yellow-400" />
      case 'Silver': return <Medal className="w-8 h-8 text-gray-300" />
      case 'Bronze': return <Award className="w-8 h-8 text-orange-400" />
      default: return <Star className="w-8 h-8 text-gray-400" />
    }
  }

  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'mythic': return 'text-purple-400'
      case 'legendary': return 'text-yellow-400'
      case 'epic': return 'text-pink-400'
      case 'rare': return 'text-blue-400'
      case 'common': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  useEffect(() => {
    if (userStats) {
      const nft = generateNFT(userStats)
      setUserNFTs([nft])
      
      // Check for evolution
      if (nft.evolutionProgress >= 100) {
        checkForEvolution(nft)
      }
    }
  }, [userStats])

  const checkForEvolution = (nft: DynamicNFT) => {
    const currentTierIndex = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'].indexOf(nft.tier)
    if (currentTierIndex < 4 && nft.evolutionProgress >= 100) {
      setEvolutionNFT(nft)
      setShowEvolutionModal(true)
    }
  }

  const evolveNFT = async () => {
    if (!evolutionNFT) return
    
    setIsEvolving(true)
    
    try {
      // Simulate blockchain transaction for NFT evolution
      const transactionCode = `
        import AchievementNFT from 0xFLOWFIT_ADDRESS
        import MetadataViews from 0xMETADATAVIEWS_ADDRESS
        
        transaction(nftID: UInt64, newTier: String) {
          let collection: &AchievementNFT.Collection
          
          prepare(signer: AuthAccount) {
            self.collection = signer.borrow<&AchievementNFT.Collection>(from: AchievementNFT.CollectionStoragePath)
              ?? panic("Could not borrow collection reference")
          }
          
          execute {
            let nft = self.collection.borrowNFT(id: nftID) as! &AchievementNFT.NFT
            nft.evolve(newTier: newTier)
            
            log("NFT ".concat(nftID.toString()).concat(" evolved to ").concat(newTier))
          }
        }
      `
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const tiers: DynamicNFT['tier'][] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']
      const currentIndex = tiers.indexOf(evolutionNFT.tier)
      const newTier = tiers[currentIndex + 1]
      
      const evolvedNFT: DynamicNFT = {
        ...evolutionNFT,
        tier: newTier,
        bonusMultiplier: getBonusMultiplier(newTier),
        lastEvolution: new Date(),
        evolutionHistory: [
          ...evolutionNFT.evolutionHistory,
          `Evolved to ${newTier} tier`
        ]
      }
      
      setUserNFTs([evolvedNFT])
      onNFTEvolution?.(evolvedNFT)
      
    } catch (error) {
      console.error('Error evolving NFT:', error)
    } finally {
      setIsEvolving(false)
      setShowEvolutionModal(false)
      setEvolutionNFT(null)
    }
  }

  const mintNewNFT = async () => {
    if (!userStats) return
    
    try {
      const transactionCode = `
        import AchievementNFT from 0xFLOWFIT_ADDRESS
        import NonFungibleToken from 0xNONFUNGIBLETOKEN_ADDRESS
        
        transaction(recipient: Address, name: String, description: String, tier: String) {
          let minter: &AchievementNFT.NFTMinter
          
          prepare(signer: AuthAccount) {
            self.minter = signer.borrow<&AchievementNFT.NFTMinter>(from: AchievementNFT.MinterStoragePath)
              ?? panic("Could not borrow minter reference")
          }
          
          execute {
            let recipientCollection = getAccount(recipient)
              .getCapability(AchievementNFT.CollectionPublicPath)
              .borrow<&AchievementNFT.Collection{NonFungibleToken.CollectionPublic}>()
              ?? panic("Could not borrow receiver reference")
            
            let nft <- self.minter.mintNFT(
              name: name,
              description: description,
              tier: tier
            )
            
            recipientCollection.deposit(token: <-nft)
            
            log("Minted new achievement NFT for ".concat(recipient.toString()))
          }
        }
      `
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newNFT = generateNFT(userStats)
      setUserNFTs([newNFT])
      
    } catch (error) {
      console.error('Error minting NFT:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* NFT Collection */}
      <div className="neo-card !p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <span>Dynamic NFT Achievements</span>
          </h3>
          
          {userNFTs.length === 0 && (
            <button
              onClick={mintNewNFT}
              className="morphing-button !py-2 !px-4 text-sm"
            >
              Mint Achievement NFT
            </button>
          )}
        </div>

        {userNFTs.length > 0 ? (
          <div className="grid gap-6">
            {userNFTs.map((nft) => (
              <div key={nft.id} className="relative">
                {/* Main NFT Card */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 cursor-pointer"
                  onClick={() => setSelectedNFT(selectedNFT?.id === nft.id ? null : nft)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 bg-gradient-to-r ${getTierColor(nft.tier)} rounded-2xl flex items-center justify-center`}>
                        {getTierIcon(nft.tier)}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white">{nft.name}</h4>
                        <div className="flex items-center space-x-2">
                          <span className={`text-sm font-semibold ${getRarityColor('legendary')}`}>
                            {nft.tier} Tier
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-400 text-sm">Level {nft.level}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        +{((nft.bonusMultiplier - 1) * 100).toFixed(0)}% Bonus
                      </div>
                      <div className="text-gray-400 text-sm">Reward Multiplier</div>
                    </div>
                  </div>

                  {/* Evolution Progress */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Evolution Progress</span>
                      <span className="text-cyan-400 font-semibold">
                        {nft.evolutionProgress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, nft.evolutionProgress)}%` }}
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-600 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-400">{nft.level}</div>
                      <div className="text-gray-400 text-xs">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-400">{nft.traits.length}</div>
                      <div className="text-gray-400 text-xs">Traits</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-orange-400">{nft.evolutionHistory.length}</div>
                      <div className="text-gray-400 text-xs">Evolutions</div>
                    </div>
                  </div>
                </motion.div>

                {/* Detailed View */}
                <AnimatePresence>
                  {selectedNFT?.id === nft.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 bg-gray-800/50 rounded-2xl p-6 space-y-6"
                    >
                      {/* Traits */}
                      <div>
                        <h5 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-purple-400" />
                          <span>NFT Traits</span>
                        </h5>
                        <div className="grid md:grid-cols-2 gap-4">
                          {nft.traits.map((trait, index) => (
                            <div key={index} className="bg-gray-900/50 rounded-xl p-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-300">{trait.name}</span>
                                <span className={`font-bold ${trait.color}`}>{trait.value}</span>
                              </div>
                              <div className="text-xs mt-1">
                                <span className={`${getRarityColor(trait.rarity)} font-semibold capitalize`}>
                                  {trait.rarity}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Evolution History */}
                      <div>
                        <h5 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                          <TrendingUp className="w-5 h-5 text-green-400" />
                          <span>Evolution History</span>
                        </h5>
                        <div className="space-y-2">
                          {nft.evolutionHistory.map((event, index) => (
                            <div key={index} className="flex items-center space-x-3 text-sm">
                              <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                              <span className="text-gray-300">{event}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-4">
                        <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold">
                          View on Explorer
                        </button>
                        <button className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold">
                          Share NFT
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-600 rounded-3xl 
                         flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No Achievement NFTs Yet</h4>
            <p className="text-gray-400 mb-6">Complete challenges to unlock your first dynamic NFT!</p>
            <button
              onClick={mintNewNFT}
              className="morphing-button !py-3 !px-6"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      {/* Evolution Modal */}
      <AnimatePresence>
        {showEvolutionModal && evolutionNFT && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 mx-4 max-w-md w-full
                       border border-purple-400/30 shadow-2xl shadow-purple-400/20"
            >
              <div className="text-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-600 rounded-full 
                               flex items-center justify-center mx-auto mb-6">
                    <Zap className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 
                                text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                    READY!
                  </div>
                </div>
                
                <div>
                  <h3 className="text-3xl font-bold gradient-text mb-2">🎉 Evolution Ready!</h3>
                  <p className="text-gray-300 mb-4">
                    Your {evolutionNFT.tier} NFT is ready to evolve to the next tier!
                  </p>
                  
                  <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Current Tier:</span>
                      <span className="font-bold text-white">{evolutionNFT.tier}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-gray-400">Next Tier:</span>
                      <span className="font-bold text-purple-400">
                        {(['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'])[
                          (['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']).indexOf(evolutionNFT.tier) + 1
                        ]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    onClick={() => setShowEvolutionModal(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold"
                  >
                    Later
                  </button>
                  <button
                    onClick={evolveNFT}
                    disabled={isEvolving}
                    className="flex-1 morphing-button py-3 disabled:opacity-50"
                  >
                    {isEvolving ? (
                      <span className="flex items-center justify-center space-x-2">
                        <div className="cosmic-loader !w-4 !h-4"></div>
                        <span>Evolving...</span>
                      </span>
                    ) : (
                      'Evolve Now! ⚡'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
} 