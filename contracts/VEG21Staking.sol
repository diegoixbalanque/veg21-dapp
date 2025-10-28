// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VEG21Token.sol";

/**
 * @title VEG21 Staking Contract
 * @notice Allows users to stake VEG21 tokens and earn rewards
 * @dev Implements simple staking with fixed APR and time-based rewards
 * 
 * Features:
 * - Stake VEG21 tokens to earn rewards
 * - Unstake tokens at any time
 * - Claim accumulated rewards
 * - Owner can adjust reward rate
 * - Emergency withdrawal functionality
 * 
 * Reward Mechanism:
 * - Rewards calculated based on time staked
 * - Default APR: 10% (adjustable by owner)
 * - Rewards distributed in VEG21 tokens
 */
contract VEG21Staking is Ownable, ReentrancyGuard {
    VEG21Token public immutable veg21Token;
    
    // Reward rate: 10% APR = 10000 basis points (adjustable)
    uint256 public rewardRateBasisPoints = 1000; // 10%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant SECONDS_PER_YEAR = 365 days;
    
    // Staking data
    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => StakeInfo) public stakes;
    uint256 public totalStaked;
    
    // Events
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 reward);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    
    /**
     * @dev Constructor
     * @param _veg21Token Address of the VEG21 token contract
     * @param initialOwner Address of the initial owner
     */
    constructor(address _veg21Token, address initialOwner) Ownable(initialOwner) {
        require(_veg21Token != address(0), "VEG21Staking: token address cannot be zero");
        veg21Token = VEG21Token(_veg21Token);
    }
    
    /**
     * @dev Stakes VEG21 tokens
     * @param amount Amount of tokens to stake (in wei)
     */
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "VEG21Staking: cannot stake 0 tokens");
        
        // If user already has a stake, claim pending rewards first
        if (stakes[msg.sender].amount > 0) {
            _claimRewards();
        }
        
        // Transfer tokens from user to contract
        require(
            veg21Token.transferFrom(msg.sender, address(this), amount),
            "VEG21Staking: transfer failed"
        );
        
        // Update stake info
        stakes[msg.sender].amount += amount;
        stakes[msg.sender].startTime = block.timestamp;
        stakes[msg.sender].lastClaimTime = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount);
    }
    
    /**
     * @dev Unstakes all staked tokens and claims rewards
     */
    function unstake() external nonReentrant {
        StakeInfo storage stakeInfo = stakes[msg.sender];
        require(stakeInfo.amount > 0, "VEG21Staking: no tokens staked");
        
        uint256 stakedAmount = stakeInfo.amount;
        
        // Claim rewards first
        _claimRewards();
        
        // Reset stake info
        stakeInfo.amount = 0;
        stakeInfo.startTime = 0;
        stakeInfo.lastClaimTime = 0;
        totalStaked -= stakedAmount;
        
        // Transfer staked tokens back to user
        require(
            veg21Token.transfer(msg.sender, stakedAmount),
            "VEG21Staking: transfer failed"
        );
        
        emit Unstaked(msg.sender, stakedAmount);
    }
    
    /**
     * @dev Claims accumulated staking rewards
     */
    function claimRewards() external nonReentrant {
        require(stakes[msg.sender].amount > 0, "VEG21Staking: no tokens staked");
        _claimRewards();
    }
    
    /**
     * @dev Internal function to claim rewards
     */
    function _claimRewards() private {
        uint256 reward = calculateReward(msg.sender);
        
        if (reward > 0) {
            stakes[msg.sender].lastClaimTime = block.timestamp;
            
            // Mint reward tokens to user
            veg21Token.mint(msg.sender, reward, "staking_reward");
            
            emit RewardClaimed(msg.sender, reward);
        }
    }
    
    /**
     * @dev Calculates pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount in wei
     */
    function calculateReward(address user) public view returns (uint256) {
        StakeInfo storage stakeInfo = stakes[user];
        
        if (stakeInfo.amount == 0) {
            return 0;
        }
        
        uint256 timeStaked = block.timestamp - stakeInfo.lastClaimTime;
        
        // Calculate reward: (staked amount * time staked * APR) / (seconds per year * basis points)
        uint256 reward = (stakeInfo.amount * timeStaked * rewardRateBasisPoints) 
            / (SECONDS_PER_YEAR * BASIS_POINTS);
        
        return reward;
    }
    
    /**
     * @dev Returns stake information for a user
     * @param user Address of the user
     * @return amount Amount staked
     * @return startTime Time when stake began
     * @return pendingReward Pending reward amount
     */
    function getStakeInfo(address user) 
        external 
        view 
        returns (uint256 amount, uint256 startTime, uint256 pendingReward) 
    {
        StakeInfo storage stakeInfo = stakes[user];
        return (
            stakeInfo.amount,
            stakeInfo.startTime,
            calculateReward(user)
        );
    }
    
    /**
     * @dev Updates the reward rate (owner only)
     * @param newRateBasisPoints New reward rate in basis points (e.g., 1000 = 10%)
     */
    function setRewardRate(uint256 newRateBasisPoints) external onlyOwner {
        require(newRateBasisPoints <= 5000, "VEG21Staking: rate cannot exceed 50%");
        
        uint256 oldRate = rewardRateBasisPoints;
        rewardRateBasisPoints = newRateBasisPoints;
        
        emit RewardRateUpdated(oldRate, newRateBasisPoints);
    }
}
