// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title AchievementNFT
 * @dev Dynamic NFTs that evolve based on fitness achievements and milestones
 */
contract AchievementNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    Counters.Counter private _tokenIdCounter;
    
    // Achievement Types
    enum AchievementType {
        STREAK_WARRIOR,      // Consecutive day achievements
        CHALLENGE_MASTER,    // Total challenges completed  
        FITNESS_EXPLORER,    // Different workout types completed
        ENDURANCE_LEGEND,    // Long workout achievements
        CONSISTENCY_KING,    // Weekly/monthly consistency
        SOCIAL_BUTTERFLY,    // Team challenges and referrals
        TOKEN_EARNER,        // Total tokens earned milestones
        LEVEL_UP            // Overall level progression
    }
    
    // Achievement Tiers
    enum Tier {
        BRONZE,    // Entry level
        SILVER,    // Intermediate
        GOLD,      // Advanced
        PLATINUM,  // Expert
        DIAMOND    // Legendary
    }
    
    struct Achievement {
        AchievementType achievementType;
        Tier tier;
        uint256 threshold;        // Required value to unlock
        string name;
        string description;
        string baseImageURI;      // Base image for this achievement
        bool active;
        uint256 createdAt;
    }
    
    struct UserAchievement {
        uint256 tokenId;
        uint256 achievementId;
        uint256 unlockedAt;
        uint256 currentProgress;
        Tier currentTier;
        bool maxTierReached;
    }
    
    struct NFTMetadata {
        uint256 achievementId;
        Tier tier;
        uint256 progress;
        uint256 unlockedAt;
        string evolutionStage;
        uint256 bonusMultiplier; // Bonus for holding this NFT
    }
    
    // State variables
    mapping(uint256 => Achievement) public achievements;
    mapping(address => mapping(uint256 => UserAchievement)) public userAchievements;
    mapping(uint256 => NFTMetadata) public nftMetadata;
    mapping(address => uint256[]) public userTokens;
    mapping(AchievementType => uint256[]) public achievementsByType;
    
    uint256 public achievementCounter;
    string public baseMetadataURI;
    
    // Authorized contracts that can trigger achievement updates
    mapping(address => bool) public authorizedUpdaters;
    
    // Events
    event AchievementCreated(uint256 indexed achievementId, AchievementType achievementType, Tier tier);
    event AchievementUnlocked(address indexed user, uint256 indexed tokenId, uint256 indexed achievementId);
    event AchievementEvolved(address indexed user, uint256 indexed tokenId, Tier newTier);
    event ProgressUpdated(address indexed user, uint256 indexed achievementId, uint256 newProgress);
    
    constructor(string memory _baseMetadataURI) ERC721("FlowFit Achievement", "FFA") {
        baseMetadataURI = _baseMetadataURI;
        _createInitialAchievements();
    }
    
    /**
     * @dev Update user progress and potentially unlock/evolve achievements
     */
    function updateProgress(
        address user,
        AchievementType achievementType,
        uint256 newProgress
    ) external {
        require(authorizedUpdaters[msg.sender], "Not authorized to update");
        require(user != address(0), "Invalid user address");
        
        uint256[] memory typeAchievements = achievementsByType[achievementType];
        
        for (uint256 i = 0; i < typeAchievements.length; i++) {
            uint256 achievementId = typeAchievements[i];
            Achievement memory achievement = achievements[achievementId];
            
            if (!achievement.active) continue;
            
            UserAchievement storage userAchievement = userAchievements[user][achievementId];
            
            // Update progress
            userAchievement.currentProgress = newProgress;
            
            // Check if user can unlock this achievement
            if (userAchievement.tokenId == 0 && newProgress >= achievement.threshold) {
                _mintAchievement(user, achievementId);
            }
            // Check if user can evolve existing achievement
            else if (userAchievement.tokenId > 0 && !userAchievement.maxTierReached) {
                _checkEvolution(user, achievementId, newProgress);
            }
            
            emit ProgressUpdated(user, achievementId, newProgress);
        }
    }
    
    /**
     * @dev Mint new achievement NFT
     */
    function _mintAchievement(address user, uint256 achievementId) internal {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        Achievement memory achievement = achievements[achievementId];
        
        // Create user achievement record
        userAchievements[user][achievementId] = UserAchievement({
            tokenId: tokenId,
            achievementId: achievementId,
            unlockedAt: block.timestamp,
            currentProgress: userAchievements[user][achievementId].currentProgress,
            currentTier: achievement.tier,
            maxTierReached: achievement.tier == Tier.DIAMOND
        });
        
        // Create NFT metadata
        nftMetadata[tokenId] = NFTMetadata({
            achievementId: achievementId,
            tier: achievement.tier,
            progress: userAchievements[user][achievementId].currentProgress,
            unlockedAt: block.timestamp,
            evolutionStage: _getTierName(achievement.tier),
            bonusMultiplier: _getBonusMultiplier(achievement.tier)
        });
        
        // Mint NFT
        _safeMint(user, tokenId);
        userTokens[user].push(tokenId);
        
        // Set token URI
        _setTokenURI(tokenId, _generateTokenURI(tokenId));
        
        emit AchievementUnlocked(user, tokenId, achievementId);
    }
    
    /**
     * @dev Check if achievement can evolve to next tier
     */
    function _checkEvolution(address user, uint256 achievementId, uint256 newProgress) internal {
        UserAchievement storage userAchievement = userAchievements[user][achievementId];
        
        // Get next tier achievement
        Tier nextTier = Tier(uint256(userAchievement.currentTier) + 1);
        if (nextTier > Tier.DIAMOND) return;
        
        // Find next tier achievement of same type
        Achievement memory currentAchievement = achievements[achievementId];
        uint256[] memory typeAchievements = achievementsByType[currentAchievement.achievementType];
        
        for (uint256 i = 0; i < typeAchievements.length; i++) {
            uint256 nextAchievementId = typeAchievements[i];
            Achievement memory nextAchievement = achievements[nextAchievementId];
            
            if (nextAchievement.tier == nextTier && newProgress >= nextAchievement.threshold) {
                // Evolve the NFT
                userAchievement.currentTier = nextTier;
                if (nextTier == Tier.DIAMOND) {
                    userAchievement.maxTierReached = true;
                }
                
                // Update NFT metadata
                uint256 tokenId = userAchievement.tokenId;
                nftMetadata[tokenId].tier = nextTier;
                nftMetadata[tokenId].evolutionStage = _getTierName(nextTier);
                nftMetadata[tokenId].bonusMultiplier = _getBonusMultiplier(nextTier);
                nftMetadata[tokenId].progress = newProgress;
                
                // Update token URI
                _setTokenURI(tokenId, _generateTokenURI(tokenId));
                
                emit AchievementEvolved(user, tokenId, nextTier);
                break;
            }
        }
    }
    
    /**
     * @dev Generate dynamic token URI based on achievement and tier
     */
    function _generateTokenURI(uint256 tokenId) internal view returns (string memory) {
        NFTMetadata memory metadata = nftMetadata[tokenId];
        Achievement memory achievement = achievements[metadata.achievementId];
        
        // Create dynamic metadata JSON
        string memory json = string(abi.encodePacked(
            '{"name": "', achievement.name, ' - ', _getTierName(metadata.tier), '",',
            '"description": "', achievement.description, '",',
            '"image": "', baseMetadataURI, '/', metadata.achievementId.toString(), '/', _getTierName(metadata.tier), '.png",',
            '"attributes": [',
                '{"trait_type": "Achievement Type", "value": "', _getAchievementTypeName(achievement.achievementType), '"},',
                '{"trait_type": "Tier", "value": "', _getTierName(metadata.tier), '"},',
                '{"trait_type": "Progress", "value": ', metadata.progress.toString(), '},',
                '{"trait_type": "Unlocked At", "value": ', metadata.unlockedAt.toString(), '},',
                '{"trait_type": "Bonus Multiplier", "value": ', metadata.bonusMultiplier.toString(), '},',
                '{"trait_type": "Evolution Stage", "value": "', metadata.evolutionStage, '"}',
            '],',
            '"bonus_multiplier": ', metadata.bonusMultiplier.toString(),
            '}'
        ));
        
        return string(abi.encodePacked(
            "data:application/json;base64,",
            _base64Encode(bytes(json))
        ));
    }
    
    /**
     * @dev Get user's total bonus multiplier from all held NFTs
     */
    function getUserTotalBonus(address user) external view returns (uint256) {
        uint256[] memory tokens = userTokens[user];
        uint256 totalBonus = 0;
        
        for (uint256 i = 0; i < tokens.length; i++) {
            totalBonus += nftMetadata[tokens[i]].bonusMultiplier;
        }
        
        return totalBonus;
    }
    
    /**
     * @dev Get all achievement NFTs owned by user
     */
    function getUserAchievements(address user) external view returns (uint256[] memory) {
        return userTokens[user];
    }
    
    /**
     * @dev Create initial achievement templates
     */
    function _createInitialAchievements() internal {
        // Streak Warrior achievements
        _createAchievement(AchievementType.STREAK_WARRIOR, Tier.BRONZE, 3, "Streak Starter", "Complete 3 days in a row", "streak_warrior");
        _createAchievement(AchievementType.STREAK_WARRIOR, Tier.SILVER, 7, "Week Warrior", "Complete 7 days in a row", "streak_warrior");
        _createAchievement(AchievementType.STREAK_WARRIOR, Tier.GOLD, 30, "Month Master", "Complete 30 days in a row", "streak_warrior");
        _createAchievement(AchievementType.STREAK_WARRIOR, Tier.PLATINUM, 100, "Century Crusher", "Complete 100 days in a row", "streak_warrior");
        _createAchievement(AchievementType.STREAK_WARRIOR, Tier.DIAMOND, 365, "Year Legend", "Complete 365 days in a row", "streak_warrior");
        
        // Challenge Master achievements
        _createAchievement(AchievementType.CHALLENGE_MASTER, Tier.BRONZE, 10, "Challenge Rookie", "Complete 10 challenges", "challenge_master");
        _createAchievement(AchievementType.CHALLENGE_MASTER, Tier.SILVER, 50, "Challenge Veteran", "Complete 50 challenges", "challenge_master");
        _createAchievement(AchievementType.CHALLENGE_MASTER, Tier.GOLD, 200, "Challenge Expert", "Complete 200 challenges", "challenge_master");
        _createAchievement(AchievementType.CHALLENGE_MASTER, Tier.PLATINUM, 500, "Challenge Master", "Complete 500 challenges", "challenge_master");
        _createAchievement(AchievementType.CHALLENGE_MASTER, Tier.DIAMOND, 1000, "Challenge Legend", "Complete 1000 challenges", "challenge_master");
        
        // Token Earner achievements
        _createAchievement(AchievementType.TOKEN_EARNER, Tier.BRONZE, 1000 ether, "Token Collector", "Earn 1,000 FFT tokens", "token_earner");
        _createAchievement(AchievementType.TOKEN_EARNER, Tier.SILVER, 10000 ether, "Token Accumulator", "Earn 10,000 FFT tokens", "token_earner");
        _createAchievement(AchievementType.TOKEN_EARNER, Tier.GOLD, 50000 ether, "Token Magnate", "Earn 50,000 FFT tokens", "token_earner");
        _createAchievement(AchievementType.TOKEN_EARNER, Tier.PLATINUM, 200000 ether, "Token Tycoon", "Earn 200,000 FFT tokens", "token_earner");
        _createAchievement(AchievementType.TOKEN_EARNER, Tier.DIAMOND, 1000000 ether, "Token Emperor", "Earn 1,000,000 FFT tokens", "token_earner");
    }
    
    /**
     * @dev Create new achievement template
     */
    function _createAchievement(
        AchievementType achievementType,
        Tier tier,
        uint256 threshold,
        string memory name,
        string memory description,
        string memory baseImageURI
    ) internal {
        achievementCounter++;
        
        achievements[achievementCounter] = Achievement({
            achievementType: achievementType,
            tier: tier,
            threshold: threshold,
            name: name,
            description: description,
            baseImageURI: baseImageURI,
            active: true,
            createdAt: block.timestamp
        });
        
        achievementsByType[achievementType].push(achievementCounter);
        
        emit AchievementCreated(achievementCounter, achievementType, tier);
    }
    
    /**
     * @dev Helper functions
     */
    function _getTierName(Tier tier) internal pure returns (string memory) {
        if (tier == Tier.BRONZE) return "Bronze";
        if (tier == Tier.SILVER) return "Silver";
        if (tier == Tier.GOLD) return "Gold";
        if (tier == Tier.PLATINUM) return "Platinum";
        return "Diamond";
    }
    
    function _getAchievementTypeName(AchievementType aType) internal pure returns (string memory) {
        if (aType == AchievementType.STREAK_WARRIOR) return "Streak Warrior";
        if (aType == AchievementType.CHALLENGE_MASTER) return "Challenge Master";
        if (aType == AchievementType.FITNESS_EXPLORER) return "Fitness Explorer";
        if (aType == AchievementType.ENDURANCE_LEGEND) return "Endurance Legend";
        if (aType == AchievementType.CONSISTENCY_KING) return "Consistency King";
        if (aType == AchievementType.SOCIAL_BUTTERFLY) return "Social Butterfly";
        if (aType == AchievementType.TOKEN_EARNER) return "Token Earner";
        return "Level Up";
    }
    
    function _getBonusMultiplier(Tier tier) internal pure returns (uint256) {
        if (tier == Tier.BRONZE) return 5;   // 5% bonus
        if (tier == Tier.SILVER) return 10;  // 10% bonus
        if (tier == Tier.GOLD) return 20;    // 20% bonus
        if (tier == Tier.PLATINUM) return 35; // 35% bonus
        return 50; // 50% bonus for Diamond
    }
    
    /**
     * @dev Base64 encoding for on-chain metadata
     */
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for { let i := 0 } lt(i, mload(data)) { i := add(i, 3) } {
                let input := and(mload(add(data, add(i, 32))), 0xffffff)
                
                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)
                
                mstore(resultPtr, out)
                resultPtr := add(resultPtr, 4)
            }
            
            switch mod(mload(data), 3)
            case 1 { mstore(sub(resultPtr, 2), shl(240, 0x3d3d)) }
            case 2 { mstore(sub(resultPtr, 1), shl(248, 0x3d)) }
        }
        
        return result;
    }
    
    /**
     * @dev Admin functions
     */
    function setAuthorizedUpdater(address updater, bool authorized) external onlyOwner {
        authorizedUpdaters[updater] = authorized;
    }
    
    function setBaseMetadataURI(string memory _baseMetadataURI) external onlyOwner {
        baseMetadataURI = _baseMetadataURI;
    }
    
    /**
     * @dev Override functions
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
}