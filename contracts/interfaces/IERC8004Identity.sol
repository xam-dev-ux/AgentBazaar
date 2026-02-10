// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IERC8004Identity
 * @notice Interface for ERC-8004 Identity Registry
 * @dev Agents are registered as ERC-721 NFTs with verifiable identity
 */
interface IERC8004Identity {
    /**
     * @notice Agent information structure
     * @param agentId Unique identifier for the agent
     * @param agentAddress Owner address of the agent
     * @param agentDomain URL to the AgentCard JSON (typically IPFS)
     * @param contentHash KECCAK256 hash of the AgentCard JSON for integrity verification
     * @param registrationTime Timestamp when agent was registered
     * @param isActive Whether the agent is currently active
     */
    struct AgentInfo {
        uint256 agentId;
        address agentAddress;
        string agentDomain;
        bytes32 contentHash;
        uint256 registrationTime;
        bool isActive;
    }

    /**
     * @notice Emitted when a new agent is registered
     * @param agentId Unique identifier assigned to the agent
     * @param agentAddress Owner address of the agent
     * @param agentDomain URL to the AgentCard JSON
     * @param contentHash Hash of the AgentCard content
     */
    event AgentRegistered(
        uint256 indexed agentId,
        address indexed agentAddress,
        string agentDomain,
        bytes32 contentHash
    );

    /**
     * @notice Emitted when an agent's card is updated
     * @param agentId Agent identifier
     * @param newAgentDomain Updated URL to AgentCard
     * @param newContentHash Updated content hash
     */
    event AgentCardUpdated(
        uint256 indexed agentId,
        string newAgentDomain,
        bytes32 newContentHash
    );

    /**
     * @notice Emitted when agent ownership is transferred
     * @param agentId Agent identifier
     * @param from Previous owner
     * @param to New owner
     */
    event AgentTransferred(
        uint256 indexed agentId,
        address indexed from,
        address indexed to
    );

    /**
     * @notice Emitted when agent active status changes
     * @param agentId Agent identifier
     * @param isActive New active status
     */
    event AgentStatusChanged(uint256 indexed agentId, bool isActive);

    /**
     * @notice Register a new agent
     * @param agentDomain URL to the AgentCard JSON
     * @param contentHash KECCAK256 hash of the AgentCard JSON
     * @param tokenURI URI for the agent NFT metadata
     * @return agentId The unique identifier assigned to the agent
     */
    function registerAgent(
        string calldata agentDomain,
        bytes32 contentHash,
        string calldata tokenURI
    ) external returns (uint256 agentId);

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
    ) external;

    /**
     * @notice Set agent active status
     * @param agentId Agent identifier
     * @param isActive New active status
     */
    function setAgentStatus(uint256 agentId, bool isActive) external;

    /**
     * @notice Verify AgentCard content matches stored hash
     * @param agentId Agent identifier
     * @param agentCardJSON The AgentCard JSON content
     * @return bool True if hash matches, false otherwise
     */
    function verifyAgentCard(uint256 agentId, string calldata agentCardJSON)
        external
        view
        returns (bool);

    /**
     * @notice Get agent information by ID
     * @param agentId Agent identifier
     * @return AgentInfo structure
     */
    function getAgent(uint256 agentId) external view returns (AgentInfo memory);

    /**
     * @notice Get agent information by address
     * @param agentAddress Owner address
     * @return AgentInfo structure
     */
    function getAgentByAddress(address agentAddress)
        external
        view
        returns (AgentInfo memory);

    /**
     * @notice Check if an address has a registered agent
     * @param agentAddress Address to check
     * @return bool True if address has an agent
     */
    function hasAgent(address agentAddress) external view returns (bool);

    /**
     * @notice Get list of agents with pagination
     * @param offset Starting index
     * @param limit Number of agents to return
     * @return AgentInfo[] Array of agent information
     */
    function listAgents(uint256 offset, uint256 limit)
        external
        view
        returns (AgentInfo[] memory);

    /**
     * @notice Get total number of registered agents
     * @return uint256 Total count
     */
    function totalAgents() external view returns (uint256);
}
