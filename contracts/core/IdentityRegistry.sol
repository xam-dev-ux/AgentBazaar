// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../interfaces/IERC8004Identity.sol";

/**
 * @title IdentityRegistry
 * @notice ERC-8004 compliant Identity Registry for AI agents
 * @dev Agents are ERC-721 NFTs with portable, verifiable identity
 * @custom:security-contact security@agentbazaar.xyz
 */
contract IdentityRegistry is
    ERC721URIStorage,
    Ownable,
    ReentrancyGuard,
    IERC8004Identity
{
    // Counter for agent IDs
    uint256 private _agentIdCounter;

    // Mapping: agentId => AgentInfo
    mapping(uint256 => AgentInfo) private _agents;

    // Mapping: agentAddress => agentId (one agent per address)
    mapping(address => uint256) private _addressToAgentId;

    // Custom errors (gas optimization)
    error AgentNotFound(uint256 agentId);
    error AgentAlreadyRegistered(address agentAddress);
    error NotAgentOwner(uint256 agentId, address caller);
    error InvalidAgentDomain();
    error InvalidContentHash();
    error InvalidTokenURI();

    /**
     * @notice Constructor
     */
    constructor() ERC721("AgentBazaar Agent", "AGENT") Ownable(msg.sender) {
        _agentIdCounter = 1; // Start from 1
    }

    /**
     * @notice Register a new agent
     * @param agentDomain URL to the AgentCard JSON (IPFS recommended)
     * @param contentHash KECCAK256 hash of the AgentCard JSON
     * @param tokenURI URI for the agent NFT metadata
     * @return agentId The unique identifier assigned to the agent
     */
    function registerAgent(
        string calldata agentDomain,
        bytes32 contentHash,
        string calldata tokenURI
    ) external nonReentrant returns (uint256 agentId) {
        // Validate inputs
        if (bytes(agentDomain).length == 0) revert InvalidAgentDomain();
        if (contentHash == bytes32(0)) revert InvalidContentHash();
        if (bytes(tokenURI).length == 0) revert InvalidTokenURI();

        // Check if address already has an agent
        if (_addressToAgentId[msg.sender] != 0) {
            revert AgentAlreadyRegistered(msg.sender);
        }

        // Get new agent ID
        agentId = _agentIdCounter++;

        // Create agent info
        _agents[agentId] = AgentInfo({
            agentId: agentId,
            agentAddress: msg.sender,
            agentDomain: agentDomain,
            contentHash: contentHash,
            registrationTime: block.timestamp,
            isActive: true
        });

        // Map address to agent ID
        _addressToAgentId[msg.sender] = agentId;

        // Mint NFT to msg.sender
        _safeMint(msg.sender, agentId);

        // Set token URI
        _setTokenURI(agentId, tokenURI);

        emit AgentRegistered(agentId, msg.sender, agentDomain, contentHash);
    }

    /**
     * @notice Update an agent's AgentCard
     * @param agentId Agent identifier
     * @param newAgentDomain Updated URL to AgentCard
     * @param newContentHash Updated content hash
     */
    function updateAgentCard(
        uint256 agentId,
        string calldata newAgentDomain,
        bytes32 newContentHash
    ) external {
        // Validate inputs
        if (bytes(newAgentDomain).length == 0) revert InvalidAgentDomain();
        if (newContentHash == bytes32(0)) revert InvalidContentHash();

        // Check ownership
        if (ownerOf(agentId) != msg.sender) {
            revert NotAgentOwner(agentId, msg.sender);
        }

        // Update agent info
        _agents[agentId].agentDomain = newAgentDomain;
        _agents[agentId].contentHash = newContentHash;

        emit AgentCardUpdated(agentId, newAgentDomain, newContentHash);
    }

    /**
     * @notice Set agent active status
     * @param agentId Agent identifier
     * @param isActive New active status
     */
    function setAgentStatus(uint256 agentId, bool isActive) external {
        // Check ownership
        if (ownerOf(agentId) != msg.sender) {
            revert NotAgentOwner(agentId, msg.sender);
        }

        _agents[agentId].isActive = isActive;

        emit AgentStatusChanged(agentId, isActive);
    }

    /**
     * @notice Verify AgentCard content matches stored hash
     * @param agentId Agent identifier
     * @param agentCardJSON The AgentCard JSON content
     * @return bool True if hash matches, false otherwise
     */
    function verifyAgentCard(uint256 agentId, string calldata agentCardJSON)
        external
        view
        returns (bool)
    {
        if (_agents[agentId].agentId == 0) revert AgentNotFound(agentId);

        bytes32 calculatedHash = keccak256(abi.encodePacked(agentCardJSON));
        return calculatedHash == _agents[agentId].contentHash;
    }

    /**
     * @notice Get agent information by ID
     * @param agentId Agent identifier
     * @return AgentInfo structure
     */
    function getAgent(uint256 agentId)
        external
        view
        returns (AgentInfo memory)
    {
        if (_agents[agentId].agentId == 0) revert AgentNotFound(agentId);
        return _agents[agentId];
    }

    /**
     * @notice Get agent information by address
     * @param agentAddress Owner address
     * @return AgentInfo structure
     */
    function getAgentByAddress(address agentAddress)
        external
        view
        returns (AgentInfo memory)
    {
        uint256 agentId = _addressToAgentId[agentAddress];
        if (agentId == 0) revert AgentNotFound(0);
        return _agents[agentId];
    }

    /**
     * @notice Check if an address has a registered agent
     * @param agentAddress Address to check
     * @return bool True if address has an agent
     */
    function hasAgent(address agentAddress) external view returns (bool) {
        return _addressToAgentId[agentAddress] != 0;
    }

    /**
     * @notice Get list of agents with pagination
     * @param offset Starting index
     * @param limit Number of agents to return
     * @return AgentInfo[] Array of agent information
     */
    function listAgents(uint256 offset, uint256 limit)
        external
        view
        returns (AgentInfo[] memory)
    {
        uint256 total = _agentIdCounter - 1; // Total agents registered

        // Handle edge cases
        if (offset >= total) {
            return new AgentInfo[](0);
        }

        // Calculate actual limit
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        uint256 resultSize = end - offset;

        // Create result array
        AgentInfo[] memory result = new AgentInfo[](resultSize);
        uint256 resultIndex = 0;

        // Fill result array (agentIds start from 1)
        for (uint256 i = offset + 1; i <= end; i++) {
            result[resultIndex] = _agents[i];
            resultIndex++;
        }

        return result;
    }

    /**
     * @notice Get total number of registered agents
     * @return uint256 Total count
     */
    function totalAgents() external view returns (uint256) {
        return _agentIdCounter - 1;
    }

    /**
     * @notice Override _update to handle agent transfer
     * @dev Updates agentAddress mapping when NFT is transferred
     */
    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = super._update(to, tokenId, auth);

        // Update agent address mapping if transfer (not mint/burn)
        if (from != address(0) && to != address(0)) {
            // Remove old address mapping
            delete _addressToAgentId[from];

            // Add new address mapping
            _addressToAgentId[to] = tokenId;

            // Update agent info
            _agents[tokenId].agentAddress = to;

            emit AgentTransferred(tokenId, from, to);
        }

        return from;
    }

    /**
     * @notice Get agent ID by owner address
     * @param owner Owner address
     * @return agentId Agent identifier (0 if not found)
     */
    function getAgentIdByAddress(address owner)
        external
        view
        returns (uint256)
    {
        return _addressToAgentId[owner];
    }
}
