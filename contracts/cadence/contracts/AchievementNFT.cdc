import NonFungibleToken from 0x631e88ae7f1d7c20
import MetadataViews from 0x631e88ae7f1d7c20

pub contract AchievementNFT: NonFungibleToken {
    
    // Total number of Achievement NFTs that have been minted
    pub var totalSupply: UInt64
    
    // Achievement Types
    pub enum AchievementType: UInt8 {
        pub case STREAK_WARRIOR      // Consecutive day achievements
        pub case CHALLENGE_MASTER    // Total challenges completed  
        pub case FITNESS_EXPLORER    // Different workout types completed
        pub case ENDURANCE_LEGEND    // Long workout achievements
        pub case CONSISTENCY_KING    // Weekly/monthly consistency
        pub case SOCIAL_BUTTERFLY    // Team challenges and referrals
        pub case TOKEN_EARNER        // Total tokens earned milestones
        pub case LEVEL_UP           // Overall level progression
    }
    
    // Achievement Tiers - NFTs evolve through these tiers
    pub enum Tier: UInt8 {
        pub case BRONZE    // Entry level
        pub case SILVER    // Intermediate
        pub case GOLD      // Advanced
        pub case PLATINUM  // Expert
        pub case DIAMOND   // Legendary
    }
    
    pub struct Achievement {
        pub let id: UInt64
        pub let achievementType: AchievementType
        pub let tier: Tier
        pub let threshold: UFix64        // Required value to unlock
        pub let name: String
        pub let description: String
        pub let baseImageURI: String     // Base image for this achievement
        pub let active: Bool
        pub let createdAt: UFix64
        
        init(
            id: UInt64,
            achievementType: AchievementType,
            tier: Tier,
            threshold: UFix64,
            name: String,
            description: String,
            baseImageURI: String,
            active: Bool
        ) {
            self.id = id
            self.achievementType = achievementType
            self.tier = tier
            self.threshold = threshold
            self.name = name
            self.description = description
            self.baseImageURI = baseImageURI
            self.active = active
            self.createdAt = getCurrentBlock().timestamp
        }
    }
    
    pub struct NFTMetadata {
        pub let achievementId: UInt64
        pub var tier: Tier
        pub var progress: UFix64
        pub let unlockedAt: UFix64
        pub var evolutionStage: String
        pub var bonusMultiplier: UFix64  // Bonus for holding this NFT
        
        init(
            achievementId: UInt64,
            tier: Tier,
            progress: UFix64,
            evolutionStage: String,
            bonusMultiplier: UFix64
        ) {
            self.achievementId = achievementId
            self.tier = tier
            self.progress = progress
            self.unlockedAt = getCurrentBlock().timestamp
            self.evolutionStage = evolutionStage
            self.bonusMultiplier = bonusMultiplier
        }
        
        pub fun updateTier(newTier: Tier) {
            self.tier = newTier
            self.evolutionStage = AchievementNFT.getTierName(tier: newTier)
            self.bonusMultiplier = AchievementNFT.getBonusMultiplier(tier: newTier)
        }
        
        pub fun updateProgress(newProgress: UFix64) {
            self.progress = newProgress
        }
    }
    
    // Contract state
    access(contract) let achievements: {UInt64: Achievement}
    access(contract) let nftMetadata: {UInt64: NFTMetadata}
    access(contract) let achievementsByType: {AchievementType: [UInt64]}
    access(contract) let userAchievements: {Address: {UInt64: UInt64}} // user -> achievementId -> tokenId
    
    pub var achievementCounter: UInt64
    pub let baseMetadataURI: String
    
    // Authorized contracts that can trigger achievement updates
    access(contract) let authorizedUpdaters: {Address: Bool}
    
    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event AchievementCreated(achievementId: UInt64, achievementType: AchievementType, tier: Tier)
    pub event AchievementUnlocked(user: Address, tokenId: UInt64, achievementId: UInt64)
    pub event AchievementEvolved(user: Address, tokenId: UInt64, newTier: Tier)
    pub event ProgressUpdated(user: Address, achievementId: UInt64, newProgress: UFix64)
    
    // NFT Resource
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let achievementId: UInt64
        
        init(id: UInt64, achievementId: UInt64) {
            self.id = id
            self.achievementId = achievementId
        }
        
        pub fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Serial>()
            ]
        }
        
        pub fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: "FlowFit Achievement",
                        description: "A dynamic achievement NFT from FlowFit",
                        thumbnail: MetadataViews.HTTPFile(
                            url: "https://flowfit.app/achievements/".concat(self.id.toString())
                        )
                    )
                case Type<MetadataViews.Serial>():
                    return MetadataViews.Serial(self.id)
            }
            return nil
        }
    }
    
    // Collection interface that users will publish
    pub resource interface AchievementNFTCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowAchievementNFT(id: UInt64): &AchievementNFT.NFT?
    }
    
    // Collection Resource
    pub resource Collection: AchievementNFTCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}
        
        init() {
            self.ownedNFTs <- {}
        }
        
        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }
        
        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @AchievementNFT.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }
        
        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }
        
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }
        
        pub fun borrowAchievementNFT(id: UInt64): &AchievementNFT.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &AchievementNFT.NFT
            }
            return nil
        }
        
        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let achievementNFT = nft as! &AchievementNFT.NFT
            return achievementNFT as &AnyResource{MetadataViews.Resolver}
        }
        
        destroy() {
            destroy self.ownedNFTs
        }
    }
    
    // Minter resource for creating achievement NFTs
    pub resource Minter {
        pub fun mintNFT(recipient: &{NonFungibleToken.CollectionPublic}, achievementId: UInt64): UInt64 {
            AchievementNFT.totalSupply = AchievementNFT.totalSupply + 1
            let tokenId = AchievementNFT.totalSupply
            
            let nft <- create NFT(id: tokenId, achievementId: achievementId)
            
            recipient.deposit(token: <-nft)
            
            emit AchievementUnlocked(
                user: recipient.owner?.address!,
                tokenId: tokenId,
                achievementId: achievementId
            )
            
            return tokenId
        }
    }
    
    // Administrator resource for managing achievements
    pub resource Administrator {
        pub fun createAchievement(
            achievementType: AchievementType,
            tier: Tier,
            threshold: UFix64,
            name: String,
            description: String,
            baseImageURI: String
        ): UInt64 {
            AchievementNFT.achievementCounter = AchievementNFT.achievementCounter + 1
            let achievementId = AchievementNFT.achievementCounter
            
            let achievement = Achievement(
                id: achievementId,
                achievementType: achievementType,
                tier: tier,
                threshold: threshold,
                name: name,
                description: description,
                baseImageURI: baseImageURI,
                active: true
            )
            
            AchievementNFT.achievements[achievementId] = achievement
            
            // Add to type mapping
            if AchievementNFT.achievementsByType[achievementType] == nil {
                AchievementNFT.achievementsByType[achievementType] = []
            }
            AchievementNFT.achievementsByType[achievementType]!.append(achievementId)
            
            emit AchievementCreated(
                achievementId: achievementId,
                achievementType: achievementType,
                tier: tier
            )
            
            return achievementId
        }
        
        pub fun setAuthorizedUpdater(updater: Address, authorized: Bool) {
            AchievementNFT.authorizedUpdaters[updater] = authorized
        }
        
        pub fun createMinter(): @Minter {
            return <-create Minter()
        }
    }
    
    // Public paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath
    pub let AdminStoragePath: StoragePath
    
    // Helper functions
    pub fun getTierName(tier: Tier): String {
        switch tier {
            case Tier.BRONZE: return "Bronze"
            case Tier.SILVER: return "Silver"
            case Tier.GOLD: return "Gold"
            case Tier.PLATINUM: return "Platinum"
            case Tier.DIAMOND: return "Diamond"
            default: return "Unknown"
        }
    }
    
    pub fun getAchievementTypeName(type: AchievementType): String {
        switch type {
            case AchievementType.STREAK_WARRIOR: return "Streak Warrior"
            case AchievementType.CHALLENGE_MASTER: return "Challenge Master"
            case AchievementType.FITNESS_EXPLORER: return "Fitness Explorer"
            case AchievementType.ENDURANCE_LEGEND: return "Endurance Legend"
            case AchievementType.CONSISTENCY_KING: return "Consistency King"
            case AchievementType.SOCIAL_BUTTERFLY: return "Social Butterfly"
            case AchievementType.TOKEN_EARNER: return "Token Earner"
            case AchievementType.LEVEL_UP: return "Level Up"
            default: return "Unknown"
        }
    }
    
    pub fun getBonusMultiplier(tier: Tier): UFix64 {
        switch tier {
            case Tier.BRONZE: return 1.05    // 5% bonus
            case Tier.SILVER: return 1.10    // 10% bonus
            case Tier.GOLD: return 1.15      // 15% bonus
            case Tier.PLATINUM: return 1.25  // 25% bonus
            case Tier.DIAMOND: return 1.50   // 50% bonus
            default: return 1.0
        }
    }
    
    // Update user progress and potentially evolve achievements
    pub fun updateProgress(
        user: Address,
        achievementType: AchievementType,
        newProgress: UFix64
    ) {
        pre {
            AchievementNFT.authorizedUpdaters[user] == true: "Not authorized to update"
        }
        
        let typeAchievements = AchievementNFT.achievementsByType[achievementType] ?? []
        
        for achievementId in typeAchievements {
            let achievement = AchievementNFT.achievements[achievementId]!
            
            if !achievement.active { continue }
            
            // Check if user already has this achievement
            let existingTokenId = AchievementNFT.userAchievements[user]?[achievementId]
            
            if existingTokenId == nil && newProgress >= achievement.threshold {
                // User can unlock this achievement - would need minter capability
                // This would typically be handled by an authorized minter
            } else if existingTokenId != nil {
                // User has this achievement, check for evolution
                let tokenId = existingTokenId!
                let metadata = AchievementNFT.nftMetadata[tokenId]!
                
                // Update progress
                metadata.updateProgress(newProgress: newProgress)
                
                // Check for tier evolution
                AchievementNFT.checkEvolution(user: user, tokenId: tokenId, newProgress: newProgress)
            }
            
            emit ProgressUpdated(user: user, achievementId: achievementId, newProgress: newProgress)
        }
    }
    
    // Check if NFT can evolve to next tier
    access(contract) fun checkEvolution(user: Address, tokenId: UInt64, newProgress: UFix64) {
        let metadata = AchievementNFT.nftMetadata[tokenId]!
        let currentAchievement = AchievementNFT.achievements[metadata.achievementId]!
        
        // Check if there's a next tier achievement of same type
        let nextTierValue = UInt8(metadata.tier.rawValue) + 1
        if nextTierValue > 4 { return } // Diamond is max tier
        
        let nextTier = Tier(rawValue: nextTierValue)!
        let typeAchievements = AchievementNFT.achievementsByType[currentAchievement.achievementType] ?? []
        
        for achievementId in typeAchievements {
            let achievement = AchievementNFT.achievements[achievementId]!
            
            if achievement.tier == nextTier && newProgress >= achievement.threshold {
                // Evolve the NFT
                metadata.updateTier(newTier: nextTier)
                
                emit AchievementEvolved(user: user, tokenId: tokenId, newTier: nextTier)
                break
            }
        }
    }
    
    // Get achievement info
    pub fun getAchievement(achievementId: UInt64): Achievement? {
        return AchievementNFT.achievements[achievementId]
    }
    
    // Get NFT metadata
    pub fun getNFTMetadata(tokenId: UInt64): NFTMetadata? {
        return AchievementNFT.nftMetadata[tokenId]
    }
    
    // Create empty collection
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <- create Collection()
    }
    
    init() {
        self.totalSupply = 0
        self.achievementCounter = 0
        self.achievements = {}
        self.nftMetadata = {}
        self.achievementsByType = {}
        self.userAchievements = {}
        self.authorizedUpdaters = {}
        self.baseMetadataURI = "https://flowfit.app/metadata/achievements"
        
        // Set storage paths
        self.CollectionStoragePath = /storage/achievementNFTCollection
        self.CollectionPublicPath = /public/achievementNFTCollection
        self.MinterStoragePath = /storage/achievementNFTMinter
        self.AdminStoragePath = /storage/achievementNFTAdmin
        
        // Create admin resource
        let admin <- create Administrator()
        self.account.save(<-admin, to: self.AdminStoragePath)
        
        // Create minter resource
        let minter <- create Minter()
        self.account.save(<-minter, to: self.MinterStoragePath)
        
        // Create collection for contract account
        let collection <- create Collection()
        self.account.save(<-collection, to: self.CollectionStoragePath)
        
        self.account.link<&AchievementNFT.Collection{NonFungibleToken.CollectionPublic, AchievementNFT.AchievementNFTCollectionPublic, MetadataViews.ResolverCollection}>(
            self.CollectionPublicPath,
            target: self.CollectionStoragePath
        )
        
        emit ContractInitialized()
    }
} 