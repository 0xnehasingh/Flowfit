// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title FlowFitToken (FFT)
 * @dev ERC20 token for the FlowFit fitness ecosystem with sponsored transaction support
 */
contract FlowFitToken is ERC20, Pausable, Ownable, ReentrancyGuard {
    
    // Constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant DAILY_MINT_LIMIT = 100_000 * 10**18; // 100k tokens per day
    
    // State variables
    mapping(address => bool) public authorizedMinters;
    mapping(address => bool) public sponsoredContracts;
    mapping(address => uint256) public dailyMinted;
    mapping(address => uint256) public lastMintDay;
    
    // Partner redemption tracking
    mapping(address => mapping(string => uint256)) public partnerRedemptions;
    mapping(string => PartnerInfo) public partners;
    
    struct PartnerInfo {
        address wallet;
        uint256 rate; // Tokens per unit (e.g., tokens per gym day)
        bool active;
        string category; // "gym", "food", "equipment", etc.
    }
    
    // Events
    event WorkoutReward(address indexed user, uint256 amount, string workoutType);
    event PartnerRedemption(address indexed user, string partnerId, uint256 tokens, string service);
    event MinterAuthorized(address indexed minter);
    event MinterRevoked(address indexed minter);
    event SponsoredContract(address indexed contractAddr, bool sponsored);
    
    constructor() ERC20("FlowFit Token", "FFT") {
        // Mint initial supply to deployer for partnerships and liquidity
        _mint(msg.sender, 10_000_000 * 10**18); // 10M initial tokens
    }
    
    /**
     * @dev Mint tokens for completed workouts (called by authorized contracts)
     */
    function mintWorkoutReward(
        address to,
        uint256 amount,
        string memory workoutType
    ) external whenNotPaused nonReentrant {
        require(authorizedMinters[msg.sender], "Not authorized to mint");
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0, "Amount must be positive");
        
        uint256 currentDay = block.timestamp / 1 days;
        
        // Reset daily counter if new day
        if (lastMintDay[msg.sender] != currentDay) {
            dailyMinted[msg.sender] = 0;
            lastMintDay[msg.sender] = currentDay;
        }
        
        // Check daily mint limit
        require(
            dailyMinted[msg.sender] + amount <= DAILY_MINT_LIMIT,
            "Daily mint limit exceeded"
        );
        
        // Check max supply
        require(
            totalSupply() + amount <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        
        dailyMinted[msg.sender] += amount;
        _mint(to, amount);
        
        emit WorkoutReward(to, amount, workoutType);
    }
    
    /**
     * @dev Redeem tokens with partners (gyms, stores, etc.)
     */
    function redeemWithPartner(
        string memory partnerId,
        uint256 tokenAmount,
        string memory service
    ) external whenNotPaused nonReentrant {
        require(bytes(partnerId).length > 0, "Invalid partner ID");
        require(tokenAmount > 0, "Amount must be positive");
        require(partners[partnerId].active, "Partner not active");
        require(balanceOf(msg.sender) >= tokenAmount, "Insufficient balance");
        
        PartnerInfo memory partner = partners[partnerId];
        
        // Transfer tokens to partner
        _transfer(msg.sender, partner.wallet, tokenAmount);
        
        // Track redemption
        partnerRedemptions[msg.sender][partnerId] += tokenAmount;
        
        emit PartnerRedemption(msg.sender, partnerId, tokenAmount, service);
    }
    
    /**
     * @dev Add or update partner
     */
    function updatePartner(
        string memory partnerId,
        address wallet,
        uint256 rate,
        bool active,
        string memory category
    ) external onlyOwner {
        require(wallet != address(0), "Invalid wallet address");
        
        partners[partnerId] = PartnerInfo({
            wallet: wallet,
            rate: rate,
            active: active,
            category: category
        });
    }
    
    /**
     * @dev Authorize/revoke minter contracts
     */
    function setMinterAuthorization(address minter, bool authorized) external onlyOwner {
        authorizedMinters[minter] = authorized;
        
        if (authorized) {
            emit MinterAuthorized(minter);
        } else {
            emit MinterRevoked(minter);
        }
    }
    
    /**
     * @dev Set sponsored contracts for gasless transactions
     */
    function setSponsoredContract(address contractAddr, bool sponsored) external onlyOwner {
        sponsoredContracts[contractAddr] = sponsored;
        emit SponsoredContract(contractAddr, sponsored);
    }
    
    /**
     * @dev Check if transfer is sponsored (gasless)
     */
    function isTransferSponsored(address from) external view returns (bool) {
        return sponsoredContracts[from];
    }
    
    /**
     * @dev Get user's redemption history with a partner
     */
    function getUserPartnerRedemptions(address user, string memory partnerId) 
        external 
        view 
        returns (uint256) 
    {
        return partnerRedemptions[user][partnerId];
    }
    
    /**
     * @dev Get partner info
     */
    function getPartnerInfo(string memory partnerId) 
        external 
        view 
        returns (PartnerInfo memory) 
    {
        return partners[partnerId];
    }
    
    /**
     * @dev Emergency pause
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev Unpause
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev Override _beforeTokenTransfer to respect pause
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
} 