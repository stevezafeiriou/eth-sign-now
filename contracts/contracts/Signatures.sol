// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title  Owner‐restricted Message Signing & Broadcasting (with toggle)
/// @notice Owner can record at any time.  Other users can record only when “open” is true.
contract Signatures is Ownable {
    /// @dev when open==false, only owner may call storeSignedMessage
    bool public open;

    /// @notice Emitted when a valid signed message is recorded
    event MessageSigned(
        address indexed signer,
        string message,
        bytes signature
    );

    /// @notice Owner can flip this to allow or disable non-owner calls
    event OpenToggled(bool open);

    constructor() Ownable(msg.sender) {
        open = false; // start closed
    }

    /// @notice Enable or disable storeSignedMessage for non-owners
    /// @param _open  true = anyone (with valid sig) can call; false = only owner
    function setOpen(bool _open) external onlyOwner {
        open = _open;
        emit OpenToggled(_open);
    }

    /// @notice Submit a signed message for on-chain recording
    /// @param message    The plaintext that was signed off-chain
    /// @param signature  The ECDSA signature over `message`
    function storeSignedMessage(
        string calldata message,
        bytes calldata signature
    )
        external
    {
        // if we're closed, only owner may call
        if (!open) {
            require(msg.sender == owner(), "Store: disabled");
        }

        bytes memory m = bytes(message);
        // recreate the "\x19Ethereum Signed Message:\n<length><message>" hash
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(m.length),
                message
            )
        );

        address signer = ECDSA.recover(digest, signature);
        require(signer == msg.sender, "Invalid signature");

        emit MessageSigned(signer, message, signature);
    }

    /// @notice Recover the address that signed `message`
    function recoverSigner(
        string calldata message,
        bytes calldata signature
    )
        public
        pure
        returns (address)
    {
        bytes memory m = bytes(message);
        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n",
                Strings.toString(m.length),
                message
            )
        );
        return ECDSA.recover(digest, signature);
    }

    /// @notice Check if `expectedSigner` really signed `message`
    function verify(
        string calldata message,
        bytes calldata signature,
        address expectedSigner
    )
        external
        pure
        returns (bool)
    {
        return recoverSigner(message, signature) == expectedSigner;
    }
}
