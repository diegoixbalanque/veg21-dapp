// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title VEG21 Token Mock Contract
 * @notice This is a placeholder ERC20 token contract for the VEG21 dApp
 * @dev This contract will be deployed on Celo Alfajores testnet in Milestone 2
 * 
 * Features planned for Milestone 2:
 * - Standard ERC20 functionality (transfer, approve, transferFrom)
 * - Minting capabilities for challenge rewards
 * - Burning mechanism for donations
 * - Integration with VEG21 staking, donations, and rewards contracts
 * 
 * Network: Celo Alfajores Testnet (Chain ID: 44787)
 * RPC URL: https://alfajores-forno.celo-testnet.org
 * Explorer: https://alfajores.celoscan.io
 */

/**
 * @dev Interface of the ERC20 standard as defined in the EIP.
 */
interface IERC20 {
    /**
     * @dev Returns the total token supply.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the account balance of another account with address `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Transfers `amount` tokens to address `recipient`.
     * Returns a boolean value indicating whether the operation succeeded.
     */
    function transfer(address recipient, uint256 amount) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets `amount` as the allowance of `spender` over the caller's tokens.
     * Returns a boolean value indicating whether the operation succeeded.
     */
    function approve(address spender, uint256 amount) external returns (bool);

    /**
     * @dev Moves `amount` tokens from `sender` to `recipient` using the
     * allowance mechanism. `amount` is then deducted from the caller's allowance.
     * Returns a boolean value indicating whether the operation succeeded.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to another (`to`).
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

/**
 * @title VEG21Token
 * @dev Implementation of the VEG21 ERC20 Token
 * 
 * Token Economics:
 * - Name: VEG21 Token
 * - Symbol: VEG21
 * - Decimals: 18
 * - Initial Supply: 1,000,000 VEG21 (can be adjusted based on tokenomics)
 * 
 * Use Cases:
 * 1. Challenge Rewards: Users earn VEG21 for completing 21-day vegan challenges
 * 2. Staking: Users can stake VEG21 tokens to earn additional rewards
 * 3. Donations: Users can donate VEG21 to supported vegan charities
 * 4. Community Transfers: Peer-to-peer token transfers within the VEG21 ecosystem
 */
contract VEG21Token is IERC20 {
    // Token metadata
    string public name = "VEG21 Token";
    string public symbol = "VEG21";
    uint8 public decimals = 18;
    
    // Total supply tracking
    uint256 private _totalSupply;
    
    // Balance tracking
    mapping(address => uint256) private _balances;
    
    // Allowance tracking
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // Contract owner (for minting privileges)
    address public owner;
    
    // Authorized minters (staking, rewards contracts)
    mapping(address => bool) public authorizedMinters;
    
    /**
     * @dev Events for administrative actions
     */
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event TokensMinted(address indexed to, uint256 amount, string reason);
    event TokensBurned(address indexed from, uint256 amount, string reason);
    
    /**
     * @dev Modifier to restrict access to owner
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "VEG21: caller is not the owner");
        _;
    }
    
    /**
     * @dev Modifier to restrict access to authorized minters
     */
    modifier onlyMinter() {
        require(authorizedMinters[msg.sender] || msg.sender == owner, "VEG21: caller is not authorized to mint");
        _;
    }
    
    /**
     * @dev Constructor - initializes the token with initial supply
     * @param initialSupply The initial token supply (in whole tokens, will be converted to wei)
     */
    constructor(uint256 initialSupply) {
        owner = msg.sender;
        authorizedMinters[msg.sender] = true;
        
        // Mint initial supply to contract deployer
        _totalSupply = initialSupply * 10**decimals;
        _balances[msg.sender] = _totalSupply;
        
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    /**
     * @dev Returns the total token supply
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }
    
    /**
     * @dev Returns the balance of an account
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }
    
    /**
     * @dev Transfers tokens to a recipient
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev Returns the remaining allowance
     */
    function allowance(address tokenOwner, address spender) public view override returns (uint256) {
        return _allowances[tokenOwner][spender];
    }
    
    /**
     * @dev Approves a spender to spend tokens
     */
    function approve(address spender, uint256 amount) public override returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }
    
    /**
     * @dev Transfers tokens from one account to another using allowance
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public override returns (bool) {
        _transfer(sender, recipient, amount);
        
        uint256 currentAllowance = _allowances[sender][msg.sender];
        require(currentAllowance >= amount, "VEG21: transfer amount exceeds allowance");
        unchecked {
            _approve(sender, msg.sender, currentAllowance - amount);
        }
        
        return true;
    }
    
    /**
     * @dev Internal transfer function
     */
    function _transfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal {
        require(sender != address(0), "VEG21: transfer from the zero address");
        require(recipient != address(0), "VEG21: transfer to the zero address");
        require(_balances[sender] >= amount, "VEG21: transfer amount exceeds balance");
        
        unchecked {
            _balances[sender] -= amount;
            _balances[recipient] += amount;
        }
        
        emit Transfer(sender, recipient, amount);
    }
    
    /**
     * @dev Internal approve function
     */
    function _approve(
        address tokenOwner,
        address spender,
        uint256 amount
    ) internal {
        require(tokenOwner != address(0), "VEG21: approve from the zero address");
        require(spender != address(0), "VEG21: approve to the zero address");
        
        _allowances[tokenOwner][spender] = amount;
        emit Approval(tokenOwner, spender, amount);
    }
    
    /**
     * @dev Mints new tokens (only authorized minters)
     * @param to The address to mint tokens to
     * @param amount The amount to mint
     * @param reason The reason for minting (e.g., "challenge_completion", "staking_reward")
     */
    function mint(address to, uint256 amount, string memory reason) public onlyMinter returns (bool) {
        require(to != address(0), "VEG21: mint to the zero address");
        
        _totalSupply += amount;
        _balances[to] += amount;
        
        emit Transfer(address(0), to, amount);
        emit TokensMinted(to, amount, reason);
        
        return true;
    }
    
    /**
     * @dev Burns tokens from an account
     * @param from The address to burn tokens from
     * @param amount The amount to burn
     * @param reason The reason for burning (e.g., "donation", "charity_contribution")
     */
    function burn(address from, uint256 amount, string memory reason) public returns (bool) {
        require(from == msg.sender || authorizedMinters[msg.sender], "VEG21: unauthorized burn");
        require(_balances[from] >= amount, "VEG21: burn amount exceeds balance");
        
        unchecked {
            _balances[from] -= amount;
            _totalSupply -= amount;
        }
        
        emit Transfer(from, address(0), amount);
        emit TokensBurned(from, amount, reason);
        
        return true;
    }
    
    /**
     * @dev Adds an authorized minter (only owner)
     */
    function addMinter(address minter) public onlyOwner {
        require(minter != address(0), "VEG21: minter is the zero address");
        authorizedMinters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Removes an authorized minter (only owner)
     */
    function removeMinter(address minter) public onlyOwner {
        authorizedMinters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Transfers ownership of the contract (only owner)
     */
    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "VEG21: new owner is the zero address");
        owner = newOwner;
    }
}

/**
 * @title Deployment Notes for Milestone 2
 * 
 * Deployment Steps:
 * 1. Deploy VEG21Token contract with initial supply (e.g., 1,000,000 VEG21)
 * 2. Deploy VEG21Staking contract with VEG21Token address
 * 3. Deploy VEG21Donations contract with VEG21Token address
 * 4. Deploy VEG21Rewards contract with VEG21Token address
 * 5. Add staking and rewards contracts as authorized minters
 * 6. Transfer initial token allocation to staking rewards pool
 * 7. Update frontend config/contracts.ts with deployed addresses
 * 8. Test all contract interactions on Celo Alfajores
 * 9. Verify contracts on Celoscan
 * 
 * Required Environment Variables:
 * - VITE_VEG21_MODE=celo-testnet
 * - PRIVATE_KEY (for deployment)
 * - CELOSCAN_API_KEY (for verification)
 * 
 * Hardhat Configuration Example:
 * networks: {
 *   'celo-alfajores': {
 *     url: 'https://alfajores-forno.celo-testnet.org',
 *     accounts: [process.env.PRIVATE_KEY],
 *     chainId: 44787
 *   }
 * }
 */
