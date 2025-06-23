import FlowFitToken from "./FlowFitToken.cdc"
import RandomBeaconHistory from 0x8c5303eaa26202d6

pub contract FitnessChallenge {
    
    // Challenge Types
    pub enum ChallengeType: UInt8 {
        pub case CARDIO
        pub case STRENGTH  
        pub case FLEXIBILITY
        pub case ENDURANCE
        pub case BALANCE
        pub case HIIT
        pub case YOGA
        pub case WALKING
    }
    
    // Difficulty Levels with reward multipliers
    pub enum Difficulty: UInt8 {
        pub case BEGINNER    // 1x
        pub case INTERMEDIATE // 2x
        pub case ADVANCED    // 3x
        pub case EXPERT      // 5x
    }
    
    pub struct Challenge {
        pub let id: UInt64
        pub let challengeType: ChallengeType
        pub let difficulty: Difficulty
        pub let targetValue: UFix64    // minutes, reps, steps, etc.
        pub let baseReward: UFix64
        pub let description: String
        pub let timeLimit: UFix64      // seconds to complete
        pub let active: Bool
        
        init(
            id: UInt64,
            challengeType: ChallengeType,
            difficulty: Difficulty,
            targetValue: UFix64,
            baseReward: UFix64,
            description: String,
            timeLimit: UFix64,
            active: Bool
        ) {
            self.id = id
            self.challengeType = challengeType
            self.difficulty = difficulty
            self.targetValue = targetValue
            self.baseReward = baseReward
            self.description = description
            self.timeLimit = timeLimit
            self.active = active
        }
    }
    
    pub struct UserProgress {
        pub var currentValue: UFix64
        pub let startTime: UFix64
        pub var completed: Bool
        pub var claimed: Bool
        pub let challengeId: UInt64
        
        init(challengeId: UInt64) {
            self.currentValue = 0.0
            self.startTime = getCurrentBlock().timestamp
            self.completed = false
            self.claimed = false
            self.challengeId = challengeId
        }
        
        pub fun updateProgress(value: UFix64) {
            self.currentValue = value
        }
        
        pub fun complete() {
            self.completed = true
        }
        
        pub fun claim() {
            self.claimed = true
        }
    }
    
    pub struct UserStats {
        pub var totalChallengesCompleted: UInt64
        pub var totalTokensEarned: UFix64
        pub var currentStreak: UInt64
        pub var longestStreak: UInt64
        pub var lastCompletionDate: UFix64
        pub let typeCompletions: {ChallengeType: UInt64}
        pub let difficultyCompletions: {Difficulty: UInt64}
        
        init() {
            self.totalChallengesCompleted = 0
            self.totalTokensEarned = 0.0
            self.currentStreak = 0
            self.longestStreak = 0
            self.lastCompletionDate = 0.0
            self.typeCompletions = {}
            self.difficultyCompletions = {}
        }
        
        pub fun updateStats(
            challengeType: ChallengeType,
            difficulty: Difficulty,
            tokensEarned: UFix64
        ) {
            self.totalChallengesCompleted = self.totalChallengesCompleted + 1
            self.totalTokensEarned = self.totalTokensEarned + tokensEarned
            
            // Update type completions
            let currentTypeCount = self.typeCompletions[challengeType] ?? 0
            self.typeCompletions[challengeType] = currentTypeCount + 1
            
            // Update difficulty completions
            let currentDifficultyCount = self.difficultyCompletions[difficulty] ?? 0
            self.difficultyCompletions[difficulty] = currentDifficultyCount + 1
            
            // Update streak
            let today = getCurrentBlock().timestamp / 86400.0
            let lastDay = self.lastCompletionDate / 86400.0
            
            if today == lastDay + 1.0 {
                // Consecutive day
                self.currentStreak = self.currentStreak + 1
            } else if today == lastDay {
                // Same day - no streak change
            } else {
                // Streak broken
                self.currentStreak = 1
            }
            
            if self.currentStreak > self.longestStreak {
                self.longestStreak = self.currentStreak
            }
            
            self.lastCompletionDate = getCurrentBlock().timestamp
        }
    }
    
    // Contract state
    pub var challengeCounter: UInt64
    access(contract) let challenges: {UInt64: Challenge}
    access(contract) let userProgress: {Address: {UInt64: UserProgress}}
    access(contract) let userStats: {Address: UserStats}
    access(contract) let userDailyChallenge: {Address: UInt64}
    access(contract) let dailyChallengeIds: {UInt64: UInt64} // day => challengeId
    
    // Reward multipliers (basis points: 100 = 1x, 200 = 2x, etc.)
    pub let difficultyMultipliers: {Difficulty: UFix64}
    pub let streakBonus: UFix64        // 10% bonus per day in streak
    pub let maxStreakBonus: UFix64     // Max 100% bonus
    
    // Authorized contracts that can update progress
    access(contract) let authorizedUpdaters: {Address: Bool}
    
    // Events
    pub event ChallengeCreated(challengeId: UInt64, challengeType: ChallengeType, difficulty: Difficulty)
    pub event ChallengeAssigned(user: Address, challengeId: UInt64, day: UInt64)
    pub event ProgressUpdated(user: Address, challengeId: UInt64, progress: UFix64)
    pub event ChallengeCompleted(user: Address, challengeId: UInt64, reward: UFix64)
    pub event StreakUpdated(user: Address, newStreak: UInt64)
    
    // Admin resource for managing challenges
    pub resource Administrator {
        pub fun createChallenge(
            challengeType: ChallengeType,
            difficulty: Difficulty,
            targetValue: UFix64,
            baseReward: UFix64,
            description: String,
            timeLimit: UFix64
        ): UInt64 {
            FitnessChallenge.challengeCounter = FitnessChallenge.challengeCounter + 1
            let challengeId = FitnessChallenge.challengeCounter
            
            let challenge = Challenge(
                id: challengeId,
                challengeType: challengeType,
                difficulty: difficulty,
                targetValue: targetValue,
                baseReward: baseReward,
                description: description,
                timeLimit: timeLimit,
                active: true
            )
            
            FitnessChallenge.challenges[challengeId] = challenge
            
            emit ChallengeCreated(
                challengeId: challengeId,
                challengeType: challengeType,
                difficulty: difficulty
            )
            
            return challengeId
        }
        
        pub fun setAuthorizedUpdater(updater: Address, authorized: Bool) {
            FitnessChallenge.authorizedUpdaters[updater] = authorized
        }
    }
    
    // Get today's challenge for a user using VRF
    pub fun getTodaysChallenge(user: Address): (UInt64, Challenge?) {
        let today = UInt64(getCurrentBlock().timestamp / 86400.0)
        let challengeId = self.generateDailyChallenge(user: user, day: today)
        return (challengeId, self.challenges[challengeId])
    }
    
    // Generate VRF-based daily challenge
    pub fun generateDailyChallenge(user: Address, day: UInt64): UInt64 {
        // Get VRF randomness from Flow's Random Beacon
        let blockHeight = getCurrentBlock().height
        let randomSource = RandomBeaconHistory.sourceOfRandomness(atBlockHeight: blockHeight - 1)
        
        // Create seed from VRF + user + day for deterministic randomness
        let seed = String.join([
            randomSource.toString(),
            user.toString(),
            day.toString()
        ], separator: ":")
        
        let hash = HashAlgorithm.SHA3_256.hash(seed.utf8)
        let randomValue = UInt64.fromBigEndianBytes(hash) ?? 0
        
        // Get user stats for difficulty adjustment
        let stats = self.userStats[user] ?? UserStats()
        
        // Select challenge type (0-7)
        let challengeTypeIndex = randomValue % 8
        let challengeType = ChallengeType(rawValue: UInt8(challengeTypeIndex))!
        
        // Select difficulty based on user experience
        let difficultyIndex = self.getDifficultyForUser(stats: stats, randomness: randomValue)
        let difficulty = Difficulty(rawValue: UInt8(difficultyIndex))!
        
        // Find matching challenge
        for challengeId in self.challenges.keys {
            let challenge = self.challenges[challengeId]!
            if challenge.challengeType == challengeType && 
               challenge.difficulty == difficulty && 
               challenge.active {
                return challengeId
            }
        }
        
        // Fallback to first available challenge
        return 1
    }
    
    // Determine difficulty based on user experience
    access(contract) fun getDifficultyForUser(stats: UserStats, randomness: UInt64): UInt64 {
        let completedChallenges = stats.totalChallengesCompleted
        
        if completedChallenges < 5 {
            // Beginner: 80% beginner, 20% intermediate
            return randomness % 10 < 8 ? 0 : 1
        } else if completedChallenges < 20 {
            // Intermediate: 40% beginner, 40% intermediate, 20% advanced
            let rand = randomness % 10
            if rand < 4 { return 0 }
            else if rand < 8 { return 1 }
            else { return 2 }
        } else if completedChallenges < 50 {
            // Advanced: 20% intermediate, 60% advanced, 20% expert
            let rand = randomness % 10
            if rand < 2 { return 1 }
            else if rand < 8 { return 2 }
            else { return 3 }
        } else {
            // Expert: 20% advanced, 80% expert
            return randomness % 10 < 2 ? 2 : 3
        }
    }
    
    // Start today's challenge
    pub fun startTodaysChallenge(user: Address) {
        pre {
            user != nil: "Invalid user address"
        }
        
        let today = UInt64(getCurrentBlock().timestamp / 86400.0)
        let challengeId = self.generateDailyChallenge(user: user, day: today)
        
        let challenge = self.challenges[challengeId] 
            ?? panic("Challenge not found")
        
        assert(challenge.active, message: "Challenge not active")
        
        // Check if user already has progress for this challenge
        if self.userProgress[user] == nil {
            self.userProgress[user] = {}
        }
        
        if self.userProgress[user]![challengeId] != nil {
            panic("Challenge already started")
        }
        
        let progress = UserProgress(challengeId: challengeId)
        self.userProgress[user]![challengeId] = progress
        self.userDailyChallenge[user] = challengeId
        
        emit ChallengeAssigned(user: user, challengeId: challengeId, day: today)
    }
    
    // Update user progress
    pub fun updateProgress(user: Address, progressValue: UFix64) {
        pre {
            user != nil: "Invalid user address"
            self.authorizedUpdaters[user] == true: "Not authorized to update progress"
        }
        
        let challengeId = self.userDailyChallenge[user] 
            ?? panic("No active challenge")
        
        let progress = self.userProgress[user]?[challengeId] 
            ?? panic("Challenge not started")
        
        assert(!progress.completed, message: "Challenge already completed")
        
        let challenge = self.challenges[challengeId]!
        
        // Check time limit
        let timeElapsed = getCurrentBlock().timestamp - progress.startTime
        assert(timeElapsed <= challenge.timeLimit, message: "Challenge time expired")
        
        // Update progress
        progress.updateProgress(value: progressValue)
        
        // Check if challenge is completed
        if progress.currentValue >= challenge.targetValue {
            progress.complete()
            
            // Calculate reward with multipliers
            let reward = self.calculateReward(user: user, challengeId: challengeId)
            
            // Update user stats
            self.updateUserStats(user: user, challengeId: challengeId, tokensEarned: reward)
            
            // Mint reward tokens (this would call FlowFitToken contract)
            // Note: In a real implementation, this would require proper token minting setup
            
            emit ChallengeCompleted(user: user, challengeId: challengeId, reward: reward)
        }
        
        emit ProgressUpdated(user: user, challengeId: challengeId, progress: progressValue)
    }
    
    // Calculate reward with difficulty and streak multipliers
    access(contract) fun calculateReward(user: Address, challengeId: UInt64): UFix64 {
        let challenge = self.challenges[challengeId]!
        let stats = self.userStats[user] ?? UserStats()
        
        var reward = challenge.baseReward
        
        // Apply difficulty multiplier
        let difficultyMultiplier = self.difficultyMultipliers[challenge.difficulty]!
        reward = reward * difficultyMultiplier / 100.0
        
        // Apply streak bonus (max 100% bonus)
        let streakMultiplier = UFix64(stats.currentStreak) * self.streakBonus / 100.0
        let cappedStreakMultiplier = streakMultiplier > self.maxStreakBonus ? self.maxStreakBonus : streakMultiplier
        reward = reward * (1.0 + cappedStreakMultiplier)
        
        return reward
    }
    
    // Update user statistics
    access(contract) fun updateUserStats(user: Address, challengeId: UInt64, tokensEarned: UFix64) {
        let challenge = self.challenges[challengeId]!
        
        if self.userStats[user] == nil {
            self.userStats[user] = UserStats()
        }
        
        let stats = self.userStats[user]!
        let oldStreak = stats.currentStreak
        
        stats.updateStats(
            challengeType: challenge.challengeType,
            difficulty: challenge.difficulty,
            tokensEarned: tokensEarned
        )
        
        if stats.currentStreak != oldStreak {
            emit StreakUpdated(user: user, newStreak: stats.currentStreak)
        }
    }
    
    // Get user statistics
    pub fun getUserStats(user: Address): UserStats? {
        return self.userStats[user]
    }
    
    // Get challenge details
    pub fun getChallenge(challengeId: UInt64): Challenge? {
        return self.challenges[challengeId]
    }
    
    // Get user's current progress
    pub fun getUserProgress(user: Address, challengeId: UInt64): UserProgress? {
        return self.userProgress[user]?[challengeId]
    }
    
    init() {
        self.challengeCounter = 0
        self.challenges = {}
        self.userProgress = {}
        self.userStats = {}
        self.userDailyChallenge = {}
        self.dailyChallengeIds = {}
        self.authorizedUpdaters = {}
        
        // Set difficulty multipliers
        self.difficultyMultipliers = {
            Difficulty.BEGINNER: 100.0,    // 1x
            Difficulty.INTERMEDIATE: 200.0, // 2x
            Difficulty.ADVANCED: 300.0,    // 3x
            Difficulty.EXPERT: 500.0       // 5x
        }
        
        self.streakBonus = 10.0  // 10% per day
        self.maxStreakBonus = 100.0  // Max 100% bonus
        
        // Create admin resource
        let admin <- create Administrator()
        self.account.save(<-admin, to: /storage/fitnessAdmin)
        
        // Create initial challenges
        self.createInitialChallenges()
    }
    
    // Create initial challenge templates
    access(contract) fun createInitialChallenges() {
        // This would be called during contract initialization
        // to populate the challenges mapping with various challenge types
        // Implementation details would depend on specific challenge requirements
    }
} 