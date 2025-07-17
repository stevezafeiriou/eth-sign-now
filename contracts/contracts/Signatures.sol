// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Owner‐restricted Message Signing & Broadcasting (with toggle) + ETH‐weighted voting
/// @notice Owner can record at any time. Other users only when “open” is true.
///         Users can up/down vote on messages, weighted by on‑chain ETH balance.
contract Signatures is Ownable {
    bool public open;
    uint256 public messageCount;

    mapping(uint256 => uint256) public forVotes;
    mapping(uint256 => uint256) public againstVotes;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event MessageSigned(
        uint256 indexed messageId,
        address indexed signer,
        string  message,
        bytes   signature
    );
    event OpenToggled(bool open);
    event Voted(
        uint256 indexed messageId,
        address indexed voter,
        uint256 weight,
        bool    support
    );

    constructor() Ownable(msg.sender) {
        open = false;
    }

    function setOpen(bool _open) external onlyOwner {
        open = _open;
        emit OpenToggled(_open);
    }

    function storeSignedMessage(
        string calldata message,
        bytes  calldata signature
    ) external {
        if (!open) {
            require(msg.sender == owner(), "Store: disabled");
        }

        bytes32 raw = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(bytes(message).length),
                message
            )
        );

        address signer = ECDSA.recover(raw, signature);
        require(signer == msg.sender, "Invalid signature");

        uint256 id = messageCount++;
        emit MessageSigned(id, signer, message, signature);
    }

    function vote(uint256 messageId, bool support) external {
        require(messageId < messageCount,        "Invalid messageId");
        require(!hasVoted[messageId][msg.sender],"Already voted");

        uint256 weight = msg.sender.balance;
        require(weight > 0,                     "Zero voting weight");

        hasVoted[messageId][msg.sender] = true;
        if (support) {
            forVotes[messageId] += weight;
        } else {
            againstVotes[messageId] += weight;
        }
        emit Voted(messageId, msg.sender, weight, support);
    }

    function totalVotes(uint256 messageId) external view returns (uint256) {
        require(messageId < messageCount, "Invalid messageId");
        return forVotes[messageId] + againstVotes[messageId];
    }

    function recoverSigner(
        string calldata message,
        bytes  calldata signature
    ) public pure returns (address) {
        bytes32 raw = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(bytes(message).length),
                message
            )
        );
        return ECDSA.recover(raw, signature);
    }

    function verify(
        string calldata message,
        bytes  calldata signature,
        address expectedSigner
    ) external pure returns (bool) {
        return recoverSigner(message, signature) == expectedSigner;
    }
}
