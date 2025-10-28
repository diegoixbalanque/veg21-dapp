// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title VEG21 Token
 * @notice Official ERC20 token for the VEG21 vegan challenge platform
 * @dev Production-ready token contract with minting, burning, and access control
 * 
 * Features:
 * - Standard ERC20 functionality
 * - Role-based minting for rewards and staking contracts
 * - Burnable tokens for charity donations
 * - Pausable for emergency situations
 * - Owner-controlled access management
 * 
 * Token Economics:
 * - Name: VEG21 Token
 * - Symbol: VEG21
 * - Decimals: 18
 * - Initial Supply: Configurable at deployment
 * 
 * Use Cases:
 * 1. Challenge Rewards: Users earn VEG21 for completing 21-day vegan challenges
 * 2. Staking: Users stake VEG21 tokens to earn additional rewards
 * 3. Donations: Users donate VEG21 to supported vegan charities (tokens burned)
 * 4. P2P Transfers: Community token transfers within the VEG21 ecosystem
 * 
 * Deployment Networks:
 * - Celo Mainnet (Chain ID: 42220)
 * - Celo Alfajores Testnet (Chain ID: 44787)
 */
contract VEG21Token is ERC20, ERC20Burnable, ERC20Pausable, Ownable, AccessControl {
    // Role definitions
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    // Events
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    event MinterAdded(address indexed account);
    event MinterRemoved(address indexed account);
    
    /**
     * @dev Constructor initializes the token with name, symbol, and initial supply
     * @param initialSupply The initial token supply in whole tokens (will be converted to wei)
     * @param initialOwner The address that will receive the initial supply and owner rights
     */
    constructor(
        uint256 initialSupply,
        address initialOwner
    ) ERC20("VEG21 Token", "VEG21") Ownable(initialOwner) {
        require(initialOwner != address(0), "VEG21: owner cannot be zero address");
        
        // Grant roles to the initial owner
        _grantRole(DEFAULT_ADMIN_ROLE, initialOwner);
        _grantRole(MINTER_ROLE, initialOwner);
        _grantRole(PAUSER_ROLE, initialOwner);
        
        // Mint initial supply to owner
        if (initialSupply > 0) {
            _mint(initialOwner, initialSupply * 10**decimals());
            emit TokensMinted(initialOwner, initialSupply * 10**decimals(), "initial_supply");
        }
    }
    
    /**
     * @dev Mints new tokens to a specified address
     * @param to The address to mint tokens to
     * @param amount The amount to mint (in wei, not whole tokens)
     * @param reason Human-readable reason for minting
     * 
     * Requirements:
     * - Caller must have MINTER_ROLE
     * - Contract must not be paused
     * - Recipient cannot be zero address
     */
    function mint(address to, uint256 amount, string memory reason) 
        public 
        onlyRole(MINTER_ROLE) 
        whenNotPaused
    {
        require(to != address(0), "VEG21: mint to zero address");
        require(amount > 0, "VEG21: mint amount must be positive");
        
        _mint(to, amount);
        emit TokensMinted(to, amount, reason);
    }
    
    /**
     * @dev Burns tokens from a specified address
     * @param from The address to burn tokens from
     * @param amount The amount to burn (in wei)
     * @param reason Human-readable reason for burning
     * 
     * Requirements:
     * - Caller must be the token owner or have MINTER_ROLE
     * - Sender must have sufficient balance
     */
    function burnFrom(address from, uint256 amount, string memory reason) 
        public
    {
        require(
            from == _msgSender() || hasRole(MINTER_ROLE, _msgSender()),
            "VEG21: caller must be owner or minter"
        );
        require(balanceOf(from) >= amount, "VEG21: burn amount exceeds balance");
        
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }
    
    /**
     * @dev Pauses all token transfers
     * 
     * Requirements:
     * - Caller must have PAUSER_ROLE
     * 
     * Use Cases:
     * - Emergency situations
     * - Security incidents
     * - Contract upgrades
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Unpauses all token transfers
     * 
     * Requirements:
     * - Caller must have PAUSER_ROLE
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Adds a new minter address
     * @param account The address to grant MINTER_ROLE
     * 
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     * 
     * Typical use: Authorize staking and rewards contracts
     */
    function addMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(account != address(0), "VEG21: minter cannot be zero address");
        grantRole(MINTER_ROLE, account);
        emit MinterAdded(account);
    }
    
    /**
     * @dev Removes a minter address
     * @param account The address to revoke MINTER_ROLE from
     * 
     * Requirements:
     * - Caller must have DEFAULT_ADMIN_ROLE
     */
    function removeMinter(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        revokeRole(MINTER_ROLE, account);
        emit MinterRemoved(account);
    }
    
    /**
     * @dev Returns true if account has MINTER_ROLE
     */
    function isMinter(address account) public view returns (bool) {
        return hasRole(MINTER_ROLE, account);
    }
    
    /**
     * @dev Hook that is called before any transfer of tokens
     * Implements pausable functionality
     */
    function _update(
        address from,
        address to,
        uint256 value
    ) internal override(ERC20, ERC20Pausable) {
        super._update(from, to, value);
    }
}
