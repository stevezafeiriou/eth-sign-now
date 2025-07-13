// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title  Owner‐restricted Message Signing & Broadcasting (with toggle)
/// @notice Owner can record at any time. Other users only when “open” is true.
contract Signatures is Ownable {
    bool public open;

    event MessageSigned(
        address indexed signer,
        string message,
        bytes   signature
    );
    event OpenToggled(bool open);

    constructor() Ownable(msg.sender) {
        open = false;
    }

    /// @notice Toggle whether non‐owners may call storeSignedMessage
    function setOpen(bool _open) external onlyOwner {
        open = _open;
        emit OpenToggled(_open);
    }

    /// @notice Submit your off‐chain signed message for on‐chain recording
    function storeSignedMessage(
        string calldata message,
        bytes  calldata signature
    ) external {
        // if closed, only owner may call
        if (!open) {
            require(msg.sender == owner(), "Store: disabled");
        }

        // re‐compute the "\x19Ethereum Signed Message:\n" digest
        bytes memory m = bytes(message);
        bytes32 raw = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(m.length),
                message
            )
        );

        // recover signer and enforce it matches msg.sender
        address signer = ECDSA.recover(raw, signature);
        require(signer == msg.sender, "Invalid signature");

        emit MessageSigned(signer, message, signature);
    }

    /// @notice Recover the address that signed `message`
    function recoverSigner(
        string calldata message,
        bytes  calldata signature
    ) public pure returns (address) {
        bytes memory m = bytes(message);
        bytes32 raw = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(m.length),
                message
            )
        );
        return ECDSA.recover(raw, signature);
    }

    /// @notice Check that `expectedSigner` truly signed `message`
    function verify(
        string calldata message,
        bytes  calldata signature,
        address expectedSigner
    ) external pure returns (bool) {
        return recoverSigner(message, signature) == expectedSigner;
    }
}
