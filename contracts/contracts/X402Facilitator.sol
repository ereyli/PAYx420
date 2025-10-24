// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface IPAY402Token {
    function mintForUser(address user, uint256 usdcAmount, bytes32 txHash) external;
}

/**
 * @title X402 Facilitator
 * @notice Handles USDC payments and coordinates PAY402 token minting
 * @dev This contract acts as the payment receiver and settlement coordinator
 */
contract X402Facilitator is Ownable {
    using SafeERC20 for IERC20;
    
    // Contracts
    IPAY402Token public pay402Token;
    IERC20 public usdcToken;
    
    // State
    mapping(bytes32 => bool) public processedPayments;
    mapping(address => uint256) public totalPaidByUser;
    mapping(address => uint256) public totalTokensMinted;
    
    uint256 public totalUSDCReceived;
    uint256 public totalPaymentsProcessed;
    
    // Events
    event PaymentProcessed(
        address indexed user,
        uint256 usdcAmount,
        uint256 tokenAmount,
        bytes32 indexed txHash
    );
    event USDCWithdrawn(address indexed owner, uint256 amount);
    event ContractsUpdated(address indexed pay402Token, address indexed usdcToken);
    
    // Errors
    error PaymentAlreadyProcessed();
    error InvalidAmount();
    error ZeroAddress();
    error TransferFailed();
    
    constructor(address _pay402Token, address _usdcToken) Ownable(msg.sender) {
        if (_pay402Token == address(0) || _usdcToken == address(0)) revert ZeroAddress();
        
        pay402Token = IPAY402Token(_pay402Token);
        usdcToken = IERC20(_usdcToken);
    }
    
    /**
     * @notice Process x402 payment and mint tokens
     * @param user Address to receive PAY402 tokens
     * @param usdcAmount Amount of USDC paid (6 decimals)
     * @param txHash Unique transaction hash from payment
     * @dev Called by backend after verifying onchain payment
     */
    function processPayment(
        address user,
        uint256 usdcAmount,
        bytes32 txHash
    ) external onlyOwner {
        if (user == address(0)) revert ZeroAddress();
        if (usdcAmount == 0) revert InvalidAmount();
        if (processedPayments[txHash]) revert PaymentAlreadyProcessed();
        
        // Mark payment as processed (prevent double-spend)
        processedPayments[txHash] = true;
        
        // Update stats
        totalPaidByUser[user] += usdcAmount;
        totalUSDCReceived += usdcAmount;
        totalPaymentsProcessed++;
        
        // Mint tokens via PAY402 contract
        pay402Token.mintForUser(user, usdcAmount, txHash);
        
        // Calculate token amount for event
        uint256 tokenAmount = (usdcAmount * 10_000 * 10**18) / 1e6;
        totalTokensMinted[user] += tokenAmount;
        
        emit PaymentProcessed(user, usdcAmount, tokenAmount, txHash);
    }
    
    /**
     * @notice Direct payment function (users can send USDC directly)
     * @param amount USDC amount to pay
     * @dev Automatically mints tokens after receiving USDC
     */
    function payAndMint(uint256 amount) external {
        if (amount == 0) revert InvalidAmount();
        
        // Transfer USDC from user
        usdcToken.safeTransferFrom(msg.sender, address(this), amount);
        
        // Generate unique tx hash (using block data + user address)
        bytes32 txHash = keccak256(
            abi.encodePacked(block.timestamp, block.number, msg.sender, amount)
        );
        
        // Process payment
        processedPayments[txHash] = true;
        totalPaidByUser[msg.sender] += amount;
        totalUSDCReceived += amount;
        totalPaymentsProcessed++;
        
        // Mint tokens
        pay402Token.mintForUser(msg.sender, amount, txHash);
        
        uint256 tokenAmount = (amount * 10_000 * 10**18) / 1e6;
        totalTokensMinted[msg.sender] += tokenAmount;
        
        emit PaymentProcessed(msg.sender, amount, tokenAmount, txHash);
    }
    
    /**
     * @notice Withdraw collected USDC
     * @param amount Amount to withdraw
     */
    function withdrawUSDC(uint256 amount) external onlyOwner {
        if (amount == 0) revert InvalidAmount();
        
        uint256 balance = usdcToken.balanceOf(address(this));
        if (amount > balance) revert InvalidAmount();
        
        usdcToken.safeTransfer(owner(), amount);
        
        emit USDCWithdrawn(owner(), amount);
    }
    
    /**
     * @notice Update contract addresses
     * @param _pay402Token New PAY402 token address
     * @param _usdcToken New USDC token address
     */
    function updateContracts(address _pay402Token, address _usdcToken) external onlyOwner {
        if (_pay402Token == address(0) || _usdcToken == address(0)) revert ZeroAddress();
        
        pay402Token = IPAY402Token(_pay402Token);
        usdcToken = IERC20(_usdcToken);
        
        emit ContractsUpdated(_pay402Token, _usdcToken);
    }
    
    /**
     * @notice Check if payment has been processed
     * @param txHash Transaction hash to check
     * @return processed True if already processed
     */
    function isPaymentProcessed(bytes32 txHash) external view returns (bool processed) {
        processed = processedPayments[txHash];
    }
    
    /**
     * @notice Get user statistics
     * @param user User address
     * @return totalPaid Total USDC paid by user
     * @return totalMinted Total PAY402 tokens minted for user
     */
    function getUserStats(address user) external view returns (
        uint256 totalPaid,
        uint256 totalMinted
    ) {
        totalPaid = totalPaidByUser[user];
        totalMinted = totalTokensMinted[user];
    }
    
    /**
     * @notice Get global statistics
     * @return totalUSDC Total USDC received
     * @return totalPayments Total number of payments
     * @return balance Current USDC balance
     */
    function getGlobalStats() external view returns (
        uint256 totalUSDC,
        uint256 totalPayments,
        uint256 balance
    ) {
        totalUSDC = totalUSDCReceived;
        totalPayments = totalPaymentsProcessed;
        balance = usdcToken.balanceOf(address(this));
    }
}

