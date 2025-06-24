// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./FlowFitToken.sol";

/**
 * @title FitnessChallenge
 * @dev Uses Flow's VRF for fair and unpredictable daily challenge generation
 */
contract FitnessChallenge is Ownable, ReentrancyGuard, Pausable {
    
    FlowFitToken public immutable flowFitToken;
    
    // VRF Configuration (Flow's native VRF implementation)
    uint256 private vrfSeed;
    uint256 private lastVRFUpdate;
    
    // Challenge Types
    enum ChallengeType {
        CARDIO,
        STRENGTH,
        FLEXIBILITY,
        ENDURANCE,
        BALANCE,
        HIIT,
        YOGA,
        WALKING
    }
    
    // Difficulty Levels
    enum Difficulty {
        BEGINNER,    // 1x rewards
        INTERMEDIATE, // 2x rewards
        ADVANCED,    // 3x rewards
        EXPERT       // 5x rewards
    }
    
    struct Challenge {
        ChallengeType challengeType;
        Difficulty difficulty;
        uint256 targetValue; // minutes, reps, steps, etc.
        uint256 baseReward;
        string description;
        uint256 timeLimit; // seconds to complete
        bool active;
    }
    
    struct UserProgress {
        uint256 currentValue;
        uint256 startTime;
        bool completed;
        bool claimed;
        uint256 challengeId;
    }
    
    struct UserStats {
        uint256 totalChallengesCompleted;
        uint256 totalTokensEarned;
        uint256 currentStreak;
        uint256 longestStreak;
        uint256 lastCompletionDate;
        mapping(ChallengeType => uint256) typeCompletions;
        mapping(Difficulty => uint256) difficultyCompletions;
    }
    
    // State variables
    mapping(uint256 => Challenge) public challenges;
    mapping(address => mapping(uint256 => UserProgress)) public userProgress;
    mapping(address => UserStats) public userStats;
    mapping(address => uint256) public userDailyChallenge;
    mapping(uint256 => uint256) public dailyChallengeIds; // day => challengeId
    
    uint256 public challengeCounter;
    uint256 public currentDay;
    
    // Reward multipliers
    uint256[4] public difficultyMultipliers = [100, 200, 300, 500]; // 1x, 2x, 3x, 5x (in basis points)
    uint256 public streakBonus = 10; // 10% bonus per day in streak
    uint256 public maxStreakBonus = 100; // Max 100% bonus
    
    // Events
    event ChallengeCreated(uint256 indexed challengeId, ChallengeType challengeType, Difficulty difficulty);
    event ChallengeAssigned(address indexed user, uint256 indexed challengeId, uint256 day);
    event ProgressUpdated(address indexed user, uint256 indexed challengeId, uint256 progress);
    event ChallengeCompleted(address indexed user, uint256 indexed challengeId, uint256 reward);
    event StreakUpdated(address indexed user, uint256 newStreak);
    event VRFSeedUpdated(uint256 newSeed);
    
    constructor(address _flowFitToken) {
        flowFitToken = FlowFitToken(_flowFitToken);
        vrfSeed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, msg.sender)));
        lastVRFUpdate = block.timestamp;
        currentDay = block.timestamp / 1 days;
        
        // Create initial challenge templates
        _createInitialChallenges();
    }
    
    /**
     * @dev Get today's challenge for a user (VRF-generated)
     */
    function getTodaysChallenge(address user) external view returns (uint256, Challenge memory) {
        uint256 today = block.timestamp / 1 days;
        uint256 challengeId = _generateDailyChallenge(user, today);
        return (challengeId, challenges[challengeId]);
    }
    
    /**
     * @dev Start today's challenge for a user
     */
    function startTodaysChallenge(address user) external whenNotPaused nonReentrant {
        require(user != address(0), "Invalid user address");
        
        uint256 today = block.timestamp / 1 days;
        uint256 challengeId = _generateDailyChallenge(user, today);
        
        require(challenges[challengeId].active, "Challenge not active");
        require(!userProgress[user][challengeId].completed, "Challenge already completed");
        require(userProgress[user][challengeId].startTime == 0, "Challenge already started");
        
        userProgress[user][challengeId] = UserProgress({
            currentValue: 0,
            startTime: block.timestamp,
            completed: false,
            claimed: false,
            challengeId: challengeId
        });
        
        userDailyChallenge[user] = challengeId;
        
        emit ChallengeAssigned(user, challengeId, today);
    }
    
    /**
     * @dev Update user progress on current challenge
     */
    function updateProgress(address user, uint256 progressValue) external whenNotPaused {
        require(user != address(0), "Invalid user address");
        
        uint256 challengeId = userDailyChallenge[user];
        require(challengeId > 0, "No active challenge");
        
        UserProgress storage progress = userProgress[user][challengeId];
        require(progress.startTime > 0, "Challenge not started");
        require(!progress.completed, "Challenge already completed");
        
        Challenge memory challenge = challenges[challengeId];
        
        // Check time limit
        require(
            block.timestamp <= progress.startTime + challenge.timeLimit,
            "Challenge time expired"
        );
        
        progress.currentValue = progressValue;
        
        // Check if challenge is completed
        if (progress.currentValue >= challenge.targetValue) {
            progress.completed = true;
            
            // Calculate reward with multipliers
            uint256 reward = _calculateReward(user, challengeId);
            
            // Update user stats
            _updateUserStats(user, challengeId);
            
            // Mint reward tokens
            flowFitToken.mintWorkoutReward(user, reward, _getChallengeTypeName(challenge.challengeType));
            
            emit ChallengeCompleted(user, challengeId, reward);
        }
        
        emit ProgressUpdated(user, challengeId, progressValue);
    }
    
    /**
     * @dev Generate VRF-based daily challenge for user
     */
    function _generateDailyChallenge(address user, uint256 day) internal view returns (uint256) {
        // Use VRF seed + user + day for randomness
        uint256 randomness = uint256(keccak256(abi.encodePacked(vrfSeed, user, day, block.timestamp)));
        
        // Select challenge based on user's fitness level and history
        UserStats storage stats = userStats[user];
        
        // Bias towards challenge types user hasn't done recently
        uint256 challengeTypeIndex = randomness % 8; // 8 challenge types
        uint256 difficultyIndex = _getDifficultyForUser(user, randomness);
        
        // Return challengeId based on type and difficulty
        return (challengeTypeIndex * 4) + difficultyIndex + 1; // +1 to avoid 0
    }
    
    /**
     * @dev Determine difficulty based on user experience
     */
    function _getDifficultyForUser(address user, uint256 randomness) internal view returns (uint256) {
        UserStats storage stats = userStats[user];
        
        if (stats.totalChallengesCompleted < 5) {
            return 0; // BEGINNER
        } else if (stats.totalChallengesCompleted < 20) {
            return (randomness >> 8) % 2; // BEGINNER or INTERMEDIATE
        } else if (stats.totalChallengesCompleted < 50) {
            return ((randomness >> 16) % 3); // BEGINNER, INTERMEDIATE, or ADVANCED
        } else {
            return (randomness >> 24) % 4; // Any difficulty
        }
    }
    
    /**
     * @dev Calculate reward with streak and difficulty multipliers
     */
    function _calculateReward(address user, uint256 challengeId) internal view returns (uint256) {
        Challenge memory challenge = challenges[challengeId];
        UserStats storage stats = userStats[user];
        
        uint256 baseReward = challenge.baseReward;
        
        // Apply difficulty multiplier
        uint256 difficultyMultiplier = difficultyMultipliers[uint256(challenge.difficulty)];
        uint256 rewardWithDifficulty = (baseReward * difficultyMultiplier) / 100;
        
        // Apply streak bonus (max 100% bonus)
        uint256 streakMultiplier = stats.currentStreak * streakBonus;
        if (streakMultiplier > maxStreakBonus) {
            streakMultiplier = maxStreakBonus;
        }
        
        uint256 finalReward = rewardWithDifficulty + ((rewardWithDifficulty * streakMultiplier) / 100);
        
        return finalReward;
    }
    
    /**
     * @dev Update user statistics
     */
    function _updateUserStats(address user, uint256 challengeId) internal {
        Challenge memory challenge = challenges[challengeId];
        UserStats storage stats = userStats[user];
        
        stats.totalChallengesCompleted++;
        stats.typeCompletions[challenge.challengeType]++;
        stats.difficultyCompletions[challenge.difficulty]++;
        
        uint256 today = block.timestamp / 1 days;
        
        // Update streak
        if (stats.lastCompletionDate == today - 1) {
            stats.currentStreak++;
        } else if (stats.lastCompletionDate == today) {
            // Same day, no streak change
        } else {
            stats.currentStreak = 1; // Reset streak
        }
        
        if (stats.currentStreak > stats.longestStreak) {
            stats.longestStreak = stats.currentStreak;
        }
        
        stats.lastCompletionDate = today;
        
        uint256 reward = _calculateReward(user, challengeId);
        stats.totalTokensEarned += reward;
        
        emit StreakUpdated(user, stats.currentStreak);
    }
    
    /**
     * @dev Update VRF seed (should be called by oracle or admin periodically)
     */
    function updateVRFSeed() external {
        require(block.timestamp >= lastVRFUpdate + 1 hours, "Too early to update");
        
        // Generate new seed using Flow's VRF (simplified for demo)
        vrfSeed = uint256(keccak256(abi.encodePacked(
            vrfSeed,
            block.timestamp,
            block.difficulty,
            blockhash(block.number - 1)
        )));
        
        lastVRFUpdate = block.timestamp;
        
        emit VRFSeedUpdated(vrfSeed);
    }
    
    /**
     * @dev Create initial challenge templates
     */
    function _createInitialChallenges() internal {
        // Create challenges for each type and difficulty combination
        string[8] memory types = ["Cardio", "Strength", "Flexibility", "Endurance", "Balance", "HIIT", "Yoga", "Walking"];
        uint256[4] memory targets = [15, 30, 45, 60]; // minutes
        uint256[4] memory rewards = [10 ether, 25 ether, 50 ether, 100 ether]; // FFT tokens
        
        for (uint256 t = 0; t < 8; t++) {
            for (uint256 d = 0; d < 4; d++) {
                challengeCounter++;
                challenges[challengeCounter] = Challenge({
                    challengeType: ChallengeType(t),
                    difficulty: Difficulty(d),
                    targetValue: targets[d],
                    baseReward: rewards[d],
                    description: string(abi.encodePacked(types[t], " workout for ", _uint2str(targets[d]), " minutes")),
                    timeLimit: 24 hours,
                    active: true
                });
                
                emit ChallengeCreated(challengeCounter, ChallengeType(t), Difficulty(d));
            }
        }
    }
    
    /**
     * @dev Get challenge type name
     */
    function _getChallengeTypeName(ChallengeType cType) internal pure returns (string memory) {
        if (cType == ChallengeType.CARDIO) return "Cardio";
        if (cType == ChallengeType.STRENGTH) return "Strength";
        if (cType == ChallengeType.FLEXIBILITY) return "Flexibility";
        if (cType == ChallengeType.ENDURANCE) return "Endurance";
        if (cType == ChallengeType.BALANCE) return "Balance";
        if (cType == ChallengeType.HIIT) return "HIIT";
        if (cType == ChallengeType.YOGA) return "Yoga";
        return "Walking";
    }
    
    /**
     * @dev Convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        
        bytes memory bstr = new bytes(len);
        uint256 k = len;
        while (_i != 0) {
            k = k - 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }
    
    /**
     * @dev Get user stats
     */
    function getUserStats(address user) external view returns (
        uint256 totalCompleted,
        uint256 totalEarned,
        uint256 currentStreak,
        uint256 longestStreak,
        uint256 lastCompletion
    ) {
        UserStats storage stats = userStats[user];
        return (
            stats.totalChallengesCompleted,
            stats.totalTokensEarned,
            stats.currentStreak,
            stats.longestStreak,
            stats.lastCompletionDate
        );
    }
    
    /**
     * @dev Admin functions
     */
    function createChallenge(
        ChallengeType cType,
        Difficulty difficulty,
        uint256 targetValue,
        uint256 baseReward,
        string memory description,
        uint256 timeLimit
    ) external onlyOwner {
        challengeCounter++;
        challenges[challengeCounter] = Challenge({
            challengeType: cType,
            difficulty: difficulty,
            targetValue: targetValue,
            baseReward: baseReward,
            description: description,
            timeLimit: timeLimit,
            active: true
        });
        
        emit ChallengeCreated(challengeCounter, cType, difficulty);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
} 