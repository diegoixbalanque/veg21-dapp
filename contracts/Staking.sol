// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title VEG21 Staking Contract
 * @dev Simple staking contract for VEG21 tokens on Astar Network
 * @notice Users can stake and unstake VEG21 tokens to earn rewards
 */
contract VEG21Staking {
    // State variables
    mapping(address => uint256) private stakes;
    mapping(address => uint256) private stakingTimestamps;
    
    uint256 public totalStaked;
    uint256 public rewardRate = 100; // 1% daily reward (100 basis points)
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 reward, uint256 timestamp);
    
    // Errors
    error InsufficientBalance();
    error InsufficientStake();
    error ZeroAmount();
    
    /**
     * @dev Stake tokens to earn rewards
     * @param amount Amount of tokens to stake (in wei)
     */
    function stake(uint256 amount) external payable {
        if (amount == 0) revert ZeroAmount();
        if (msg.value != amount) revert InsufficientBalance();
        
        // If user already has a stake, claim pending rewards first
        if (stakes[msg.sender] > 0) {
            uint256 pendingReward = calculateReward(msg.sender);
            if (pendingReward > 0) {
                payable(msg.sender).transfer(pendingReward);
                emit RewardClaimed(msg.sender, pendingReward, block.timestamp);
            }
        }
        
        stakes[msg.sender] += amount;
        stakingTimestamps[msg.sender] = block.timestamp;
        totalStaked += amount;
        
        emit Staked(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev Unstake tokens and claim rewards
     * @param amount Amount of tokens to unstake (in wei)
     */
    function unstake(uint256 amount) external {
        if (amount == 0) revert ZeroAmount();
        if (stakes[msg.sender] < amount) revert InsufficientStake();
        
        // Calculate and pay pending rewards
        uint256 pendingReward = calculateReward(msg.sender);
        
        // Update state
        stakes[msg.sender] -= amount;
        totalStaked -= amount;
        stakingTimestamps[msg.sender] = block.timestamp;
        
        // Transfer unstaked amount plus rewards
        uint256 totalTransfer = amount + pendingReward;
        if (address(this).balance >= totalTransfer) {
            payable(msg.sender).transfer(totalTransfer);
        } else {
            // Emergency: just transfer what's available
            payable(msg.sender).transfer(address(this).balance);
        }
        
        emit Unstaked(msg.sender, amount, block.timestamp);
        if (pendingReward > 0) {
            emit RewardClaimed(msg.sender, pendingReward, block.timestamp);
        }
    }
    
    /**
     * @dev Get user's current staked balance
     * @param user Address of the user
     * @return Current staked amount in wei
     */
    function getStake(address user) external view returns (uint256) {
        return stakes[user];
    }
    
    /**
     * @dev Get user's staking timestamp
     * @param user Address of the user
     * @return Timestamp when user last staked
     */
    function getStakingTimestamp(address user) external view returns (uint256) {
        return stakingTimestamps[user];
    }
    
    /**
     * @dev Calculate pending rewards for a user
     * @param user Address of the user
     * @return Pending reward amount in wei
     */
    function calculateReward(address user) public view returns (uint256) {
        if (stakes[user] == 0) return 0;
        
        uint256 stakingDuration = block.timestamp - stakingTimestamps[user];
        uint256 dailyReward = (stakes[user] * rewardRate) / 10000;
        
        return (dailyReward * stakingDuration) / SECONDS_PER_DAY;
    }
    
    /**
     * @dev Get pending rewards for caller
     * @return Pending reward amount in wei
     */
    function getPendingRewards() external view returns (uint256) {
        return calculateReward(msg.sender);
    }
    
    /**
     * @dev Claim pending rewards without unstaking
     */
    function claimRewards() external {
        uint256 pendingReward = calculateReward(msg.sender);
        if (pendingReward == 0) revert ZeroAmount();
        
        stakingTimestamps[msg.sender] = block.timestamp;
        
        if (address(this).balance >= pendingReward) {
            payable(msg.sender).transfer(pendingReward);
            emit RewardClaimed(msg.sender, pendingReward, block.timestamp);
        }
    }
    
    /**
     * @dev Get contract's total balance
     * @return Contract balance in wei
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get contract info
     * @return totalStaked Total amount staked across all users
     * @return contractBalance Current contract balance
     * @return currentRewardRate Current reward rate in basis points
     */
    function getContractInfo() external view returns (uint256, uint256, uint256) {
        return (totalStaked, address(this).balance, rewardRate);
    }
    
    // Allow contract to receive ETH
    receive() external payable {
        // Contract can receive ETH for rewards pool
    }
    
    fallback() external payable {
        // Contract can receive ETH for rewards pool
    }
}