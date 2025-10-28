// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./VEG21Token.sol";

/**
 * @title VEG21 Donations Contract
 * @notice Manages charitable donations using VEG21 tokens
 * @dev Tracks donations to vegan charities and burns donated tokens
 * 
 * Features:
 * - Donate VEG21 tokens to registered charities
 * - Tokens are burned upon donation (deflationary)
 * - Track total donations per charity
 * - Track individual donor contributions
 * - Owner can register/unregister charities
 * 
 * Impact Tracking:
 * - Total tokens donated (burned)
 * - Per-charity donation totals
 * - Per-donor contribution history
 * - Leaderboard integration for top donors
 */
contract VEG21Donations is Ownable, ReentrancyGuard {
    VEG21Token public immutable veg21Token;
    
    // Charity struct
    struct Charity {
        string name;
        string description;
        address wallet;
        bool isActive;
        uint256 totalDonations;
    }
    
    // Mappings
    mapping(uint256 => Charity) public charities;
    mapping(address => mapping(uint256 => uint256)) public userDonations; // user => charityId => amount
    mapping(address => uint256) public totalUserDonations;
    
    uint256 public charityCount;
    uint256 public totalDonationsAllTime;
    
    // Events
    event CharityRegistered(uint256 indexed charityId, string name, address wallet);
    event CharityDeactivated(uint256 indexed charityId);
    event DonationMade(
        address indexed donor,
        uint256 indexed charityId,
        uint256 amount,
        uint256 timestamp
    );
    
    /**
     * @dev Constructor
     * @param _veg21Token Address of the VEG21 token contract
     * @param initialOwner Address of the initial owner
     */
    constructor(address _veg21Token, address initialOwner) Ownable(initialOwner) {
        require(_veg21Token != address(0), "VEG21Donations: token address cannot be zero");
        veg21Token = VEG21Token(_veg21Token);
    }
    
    /**
     * @dev Registers a new charity
     * @param name Name of the charity
     * @param description Brief description
     * @param wallet Charity's wallet address for transparency
     */
    function registerCharity(
        string memory name,
        string memory description,
        address wallet
    ) external onlyOwner {
        require(bytes(name).length > 0, "VEG21Donations: name cannot be empty");
        require(wallet != address(0), "VEG21Donations: wallet cannot be zero address");
        
        uint256 charityId = charityCount++;
        
        charities[charityId] = Charity({
            name: name,
            description: description,
            wallet: wallet,
            isActive: true,
            totalDonations: 0
        });
        
        emit CharityRegistered(charityId, name, wallet);
    }
    
    /**
     * @dev Deactivates a charity (prevents new donations)
     * @param charityId ID of the charity to deactivate
     */
    function deactivateCharity(uint256 charityId) external onlyOwner {
        require(charityId < charityCount, "VEG21Donations: invalid charity ID");
        require(charities[charityId].isActive, "VEG21Donations: charity already inactive");
        
        charities[charityId].isActive = false;
        emit CharityDeactivated(charityId);
    }
    
    /**
     * @dev Makes a donation to a charity
     * @param charityId ID of the charity to donate to
     * @param amount Amount of VEG21 tokens to donate (in wei)
     * 
     * Note: Donated tokens are burned (deflationary)
     */
    function donate(uint256 charityId, uint256 amount) external nonReentrant {
        require(amount > 0, "VEG21Donations: donation amount must be positive");
        require(charityId < charityCount, "VEG21Donations: invalid charity ID");
        require(charities[charityId].isActive, "VEG21Donations: charity is not active");
        
        // Transfer tokens from donor to contract
        require(
            veg21Token.transferFrom(msg.sender, address(this), amount),
            "VEG21Donations: transfer failed"
        );
        
        // Burn the donated tokens
        veg21Token.burnFrom(address(this), amount, "charity_donation");
        
        // Update donation tracking
        charities[charityId].totalDonations += amount;
        userDonations[msg.sender][charityId] += amount;
        totalUserDonations[msg.sender] += amount;
        totalDonationsAllTime += amount;
        
        emit DonationMade(msg.sender, charityId, amount, block.timestamp);
    }
    
    /**
     * @dev Returns charity information
     * @param charityId ID of the charity
     */
    function getCharity(uint256 charityId) 
        external 
        view 
        returns (
            string memory name,
            string memory description,
            address wallet,
            bool isActive,
            uint256 totalDonations
        ) 
    {
        require(charityId < charityCount, "VEG21Donations: invalid charity ID");
        Charity storage charity = charities[charityId];
        
        return (
            charity.name,
            charity.description,
            charity.wallet,
            charity.isActive,
            charity.totalDonations
        );
    }
    
    /**
     * @dev Returns user's total donations to a specific charity
     * @param user Address of the user
     * @param charityId ID of the charity
     */
    function getUserDonationToCharity(address user, uint256 charityId) 
        external 
        view 
        returns (uint256) 
    {
        return userDonations[user][charityId];
    }
    
    /**
     * @dev Returns list of all active charities
     * @return activeCharityIds Array of active charity IDs
     */
    function getActiveCharities() external view returns (uint256[] memory) {
        uint256 activeCount = 0;
        
        // Count active charities
        for (uint256 i = 0; i < charityCount; i++) {
            if (charities[i].isActive) {
                activeCount++;
            }
        }
        
        // Build array of active charity IDs
        uint256[] memory activeCharityIds = new uint256[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < charityCount; i++) {
            if (charities[i].isActive) {
                activeCharityIds[index++] = i;
            }
        }
        
        return activeCharityIds;
    }
}
