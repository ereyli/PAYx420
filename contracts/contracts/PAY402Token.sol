// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PAY402 Token
 * @notice Meme token mintable via x402 payment protocol
 * @dev Uses trusted minter pattern for x402 integration
 */
contract PAY402Token is ERC20, Ownable {
    // Constants
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    uint256 public constant TOKENS_PER_USDC = 10_000 * 10**18;   // 10,000 PAY402 per 1 USDC
    
    // State variables
    address public trustedMinter;
    uint256 public totalMintedViaX402;
    
    // Events
    event TrustedMinterSet(address indexed oldMinter, address indexed newMinter);
    event TokensMintedViaX402(address indexed user, uint256 usdcAmount, uint256 tokenAmount, bytes32 txHash);
    
    // Errors
    error NotAuthorizedMinter();
    error MaxSupplyExceeded();
    error ZeroAddress();
    error ZeroAmount();
    
    constructor() ERC20("PAY402 Token", "PAY402") Ownable(msg.sender) {
        // Initial supply for liquidity (10% of max supply)
        _mint(msg.sender, 100_000_000 * 10**18);
    }
    
    /**
     * @notice Set the trusted minter address (backend service)
     * @param _minter Address of the x402 backend service
     */
    function setTrustedMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert ZeroAddress();
        
        address oldMinter = trustedMinter;
        trustedMinter = _minter;
        
        emit TrustedMinterSet(oldMinter, _minter);
    }
    
    /**
     * @notice Mint tokens for user after x402 payment verification
     * @param user Address to receive tokens
     * @param usdcAmount Amount of USDC paid (6 decimals)
     * @param txHash Transaction hash of the payment (for tracking)
     * @dev Only callable by trusted minter (x402 backend)
     */
    function mintForUser(
        address user,
        uint256 usdcAmount,
        bytes32 txHash
    ) external {
        if (msg.sender != trustedMinter) revert NotAuthorizedMinter();
        if (user == address(0)) revert ZeroAddress();
        if (usdcAmount == 0) revert ZeroAmount();
        
        // Calculate token amount (USDC has 6 decimals, PUMP has 18)
        uint256 tokenAmount = (usdcAmount * TOKENS_PER_USDC) / 1e6;
        
        // Check max supply
        if (totalSupply() + tokenAmount > MAX_SUPPLY) revert MaxSupplyExceeded();
        
        // Mint tokens
        _mint(user, tokenAmount);
        
        // Track total minted via x402
        totalMintedViaX402 += tokenAmount;
        
        emit TokensMintedViaX402(user, usdcAmount, tokenAmount, txHash);
    }
    
    /**
     * @notice Get price in USDC for specific token amount
     * @param tokenAmount Amount of PUMP tokens
     * @return usdcAmount Required USDC amount (6 decimals)
     */
    function getPrice(uint256 tokenAmount) public pure returns (uint256 usdcAmount) {
        // tokenAmount (18 decimals) / TOKENS_PER_USDC * 1e6 (USDC decimals)
        usdcAmount = (tokenAmount * 1e6) / TOKENS_PER_USDC;
    }
    
    /**
     * @notice Get token amount for specific USDC amount
     * @param usdcAmount Amount of USDC (6 decimals)
     * @return tokenAmount PUMP tokens to receive (18 decimals)
     */
    function getTokenAmount(uint256 usdcAmount) public pure returns (uint256 tokenAmount) {
        tokenAmount = (usdcAmount * TOKENS_PER_USDC) / 1e6;
    }
    
    /**
     * @notice Get remaining mintable supply
     * @return remaining Tokens that can still be minted
     */
    function remainingSupply() public view returns (uint256 remaining) {
        remaining = MAX_SUPPLY - totalSupply();
    }
}

