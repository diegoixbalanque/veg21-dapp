// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VEG21Token.sol";

/**
 * @title VEG21 Rewards Contract
 * @notice Manages challenge completion rewards for VEG21 users
 * @dev Allows authorized verifiers to distribute rewards for completed challenges
 * 
 * Features:
 * - Reward users for completing 21-day vegan challenges
 * - Multiple reward tiers based on challenge difficulty
 * - Daily check-in rewards
 * - Challenge completion bonuses
 * - Owner-controlled verifier management
 * - Prevents duplicate reward claims
 * 
 * Reward Types:
 * - Daily Check-In: +5 VEG21 per day
 * - 21-Day Completion: +50 VEG21 bonus
 * - Challenge Types: Meat-Free, Vegan Meals, Full Vegan, Zero Waste
 */
contract VEG21Rewards is Ownable, ReentrancyGuard {
    VEG21Token public immutable veg21Token;
    
    // Reward amounts (in whole tokens, converted to wei when minting)
    uint256 public dailyCheckInReward = 5 * 10**18;      // 5 VEG21
    uint256 public challengeCompletionBonus = 50 * 10**18; // 50 VEG21
    
    // Challenge types
    enum ChallengeType {
        MeatFree,
        VeganMeals,
        FullVegan,
        ZeroWaste
    }
    
    // Challenge tracking
    struct Challenge {
        address user;
        ChallengeType challengeType;
        uint256 startDate;
        uint256 checkInsCompleted;
        bool isComplete;
        bool bonusClaimed;
    }
    
    // Mappings
    mapping(address => Challenge) public userChallenges;
    mapping(address => uint256) public totalRewardsEarned;
    mapping(address => bool) public isVerifier;
    
    // Stats
    uint256 public totalChallengesCompleted;
    uint256 public totalRewardsDistributed;
    
    // Events
    event ChallengeStarted(address indexed user, ChallengeType challengeType, uint256 startDate);
    event CheckInRewarded(address indexed user, uint256 day, uint256 reward);
    event ChallengeCompleted(address indexed user, uint256 completionBonus);
    event VerifierAdded(address indexed verifier);
    event VerifierRemoved(address indexed verifier);
    event RewardAmountsUpdated(uint256 dailyReward, uint256 completionBonus);
    
    /**
     * @dev Constructor
     * @param _veg21Token Address of the VEG21 token contract
     * @param initialOwner Address of the initial owner
     */
    constructor(address _veg21Token, address initialOwner) Ownable(initialOwner) {
        require(_veg21Token != address(0), "VEG21Rewards: token address cannot be zero");
        veg21Token = VEG21Token(_veg21Token);
        
        // Owner is automatically a verifier
        isVerifier[initialOwner] = true;
    }
    
    modifier onlyVerifier() {
        require(isVerifier[msg.sender], "VEG21Rewards: caller is not a verifier");
        _;
    }
    
    /**
     * @dev Starts a new challenge for a user
     * @param user Address of the user
     * @param challengeType Type of challenge (0-3)
     */
    function startChallenge(address user, ChallengeType challengeType) 
        external 
        onlyVerifier 
    {
        require(user != address(0), "VEG21Rewards: user cannot be zero address");
        require(
            userChallenges[user].startDate == 0 || userChallenges[user].isComplete,
            "VEG21Rewards: user already has an active challenge"
        );
        
        userChallenges[user] = Challenge({
            user: user,
            challengeType: challengeType,
            startDate: block.timestamp,
            checkInsCompleted: 0,
            isComplete: false,
            bonusClaimed: false
        });
        
        emit ChallengeStarted(user, challengeType, block.timestamp);
    }
    
    /**
     * @dev Records a daily check-in and rewards the user
     * @param user Address of the user
     */
    function recordCheckIn(address user) external onlyVerifier nonReentrant {
        Challenge storage challenge = userChallenges[user];
        
        require(challenge.startDate > 0, "VEG21Rewards: no active challenge");
        require(!challenge.isComplete, "VEG21Rewards: challenge already complete");
        require(challenge.checkInsCompleted < 21, "VEG21Rewards: maximum check-ins reached");
        
        // Increment check-ins
        challenge.checkInsCompleted++;
        uint256 currentDay = challenge.checkInsCompleted;
        
        // Mint daily reward
        veg21Token.mint(user, dailyCheckInReward, "daily_checkin");
        totalRewardsEarned[user] += dailyCheckInReward;
        totalRewardsDistributed += dailyCheckInReward;
        
        emit CheckInRewarded(user, currentDay, dailyCheckInReward);
        
        // Check if challenge is complete
        if (currentDay == 21 && !challenge.bonusClaimed) {
            challenge.isComplete = true;
            challenge.bonusClaimed = true;
            
            // Mint completion bonus
            veg21Token.mint(user, challengeCompletionBonus, "challenge_completion");
            totalRewardsEarned[user] += challengeCompletionBonus;
            totalRewardsDistributed += challengeCompletionBonus;
            totalChallengesCompleted++;
            
            emit ChallengeCompleted(user, challengeCompletionBonus);
        }
    }
    
    /**
     * @dev Returns challenge progress for a user
     * @param user Address of the user
     */
    function getChallengeProgress(address user) 
        external 
        view 
        returns (
            ChallengeType challengeType,
            uint256 startDate,
            uint256 checkInsCompleted,
            bool isComplete,
            uint256 daysRemaining
        ) 
    {
        Challenge storage challenge = userChallenges[user];
        
        uint256 remaining = 0;
        if (!challenge.isComplete && challenge.checkInsCompleted < 21) {
            remaining = 21 - challenge.checkInsCompleted;
        }
        
        return (
            challenge.challengeType,
            challenge.startDate,
            challenge.checkInsCompleted,
            challenge.isComplete,
            remaining
        );
    }
    
    /**
     * @dev Adds a new verifier
     * @param verifier Address to grant verifier role
     */
    function addVerifier(address verifier) external onlyOwner {
        require(verifier != address(0), "VEG21Rewards: verifier cannot be zero address");
        require(!isVerifier[verifier], "VEG21Rewards: already a verifier");
        
        isVerifier[verifier] = true;
        emit VerifierAdded(verifier);
    }
    
    /**
     * @dev Removes a verifier
     * @param verifier Address to revoke verifier role from
     */
    function removeVerifier(address verifier) external onlyOwner {
        require(isVerifier[verifier], "VEG21Rewards: not a verifier");
        
        isVerifier[verifier] = false;
        emit VerifierRemoved(verifier);
    }
    
    /**
     * @dev Updates reward amounts (owner only)
     * @param newDailyReward New daily check-in reward (in wei)
     * @param newCompletionBonus New completion bonus (in wei)
     */
    function setRewardAmounts(uint256 newDailyReward, uint256 newCompletionBonus) 
        external 
        onlyOwner 
    {
        require(newDailyReward > 0, "VEG21Rewards: daily reward must be positive");
        require(newCompletionBonus > 0, "VEG21Rewards: completion bonus must be positive");
        
        dailyCheckInReward = newDailyReward;
        challengeCompletionBonus = newCompletionBonus;
        
        emit RewardAmountsUpdated(newDailyReward, newCompletionBonus);
    }
}
