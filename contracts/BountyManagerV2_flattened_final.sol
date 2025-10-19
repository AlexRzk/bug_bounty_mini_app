// SPDX-License-Identifier: MIT
pragma solidity =0.8.20 >=0.4.16 >=0.6.2 ^0.8.20;

// lib/openzeppelin-contracts/contracts/utils/Context.sol

// OpenZeppelin Contracts (last updated v5.0.1) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }
}

// lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC-165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[ERC].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[ERC section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (token/ERC20/IERC20.sol)

/**
 * @dev Interface of the ERC-20 standard as defined in the ERC.
 */
interface IERC20 {
    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev Emitted when the allowance of a `spender` for an `owner` is set by
     * a call to {approve}. `value` is the new allowance.
     */
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /**
     * @dev Returns the value of tokens in existence.
     */
    function totalSupply() external view returns (uint256);

    /**
     * @dev Returns the value of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns (uint256);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transfer(address to, uint256 value) external returns (bool);

    /**
     * @dev Returns the remaining number of tokens that `spender` will be
     * allowed to spend on behalf of `owner` through {transferFrom}. This is
     * zero by default.
     *
     * This value changes when {approve} or {transferFrom} are called.
     */
    function allowance(address owner, address spender) external view returns (uint256);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * IMPORTANT: Beware that changing an allowance with this method brings the risk
     * that someone may use both the old and the new allowance by unfortunate
     * transaction ordering. One possible solution to mitigate this race
     * condition is to first reduce the spender's allowance to 0 and set the
     * desired value afterwards:
     * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
     *
     * Emits an {Approval} event.
     */
    function approve(address spender, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the
     * allowance mechanism. `value` is then deducted from the caller's
     * allowance.
     *
     * Returns a boolean value indicating whether the operation succeeded.
     *
     * Emits a {Transfer} event.
     */
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol

// OpenZeppelin Contracts (last updated v5.1.0) (utils/ReentrancyGuard.sol)

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If EIP-1153 (transient storage) is available on the chain you're deploying at,
 * consider using {ReentrancyGuardTransient} instead.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;

    uint256 private _status;

    /**
     * @dev Unauthorized reentrant call.
     */
    error ReentrancyGuardReentrantCall();

    constructor() {
        _status = NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be NOT_ENTERED
        if (_status == ENTERED) {
            revert ReentrancyGuardReentrantCall();
        }

        // Any calls to nonReentrant after this point will fail
        _status = ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == ENTERED;
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC165.sol)

// lib/openzeppelin-contracts/contracts/interfaces/IERC20.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC20.sol)

// lib/openzeppelin-contracts/contracts/access/Ownable.sol

// OpenZeppelin Contracts (last updated v5.0.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * The initial owner is set to the address provided by the deployer. This can
 * later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error OwnableUnauthorizedAccount(address account);

    /**
     * @dev The owner is not a valid owner account. (eg. `address(0)`)
     */
    error OwnableInvalidOwner(address owner);

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the address provided by the deployer as the initial owner.
     */
    constructor(address initialOwner) {
        if (initialOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(initialOwner);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != _msgSender()) {
            revert OwnableUnauthorizedAccount(_msgSender());
        }
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        if (newOwner == address(0)) {
            revert OwnableInvalidOwner(address(0));
        }
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// lib/openzeppelin-contracts/contracts/utils/Pausable.sol

// OpenZeppelin Contracts (last updated v5.3.0) (utils/Pausable.sol)

/**
 * @dev Contract module which allows children to implement an emergency stop
 * mechanism that can be triggered by an authorized account.
 *
 * This module is used through inheritance. It will make available the
 * modifiers `whenNotPaused` and `whenPaused`, which can be applied to
 * the functions of your contract. Note that they will not be pausable by
 * simply including this module, only once the modifiers are put in place.
 */
abstract contract Pausable is Context {
    bool private _paused;

    /**
     * @dev Emitted when the pause is triggered by `account`.
     */
    event Paused(address account);

    /**
     * @dev Emitted when the pause is lifted by `account`.
     */
    event Unpaused(address account);

    /**
     * @dev The operation failed because the contract is paused.
     */
    error EnforcedPause();

    /**
     * @dev The operation failed because the contract is not paused.
     */
    error ExpectedPause();

    /**
     * @dev Modifier to make a function callable only when the contract is not paused.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    modifier whenNotPaused() {
        _requireNotPaused();
        _;
    }

    /**
     * @dev Modifier to make a function callable only when the contract is paused.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    modifier whenPaused() {
        _requirePaused();
        _;
    }

    /**
     * @dev Returns true if the contract is paused, and false otherwise.
     */
    function paused() public view virtual returns (bool) {
        return _paused;
    }

    /**
     * @dev Throws if the contract is paused.
     */
    function _requireNotPaused() internal view virtual {
        if (paused()) {
            revert EnforcedPause();
        }
    }

    /**
     * @dev Throws if the contract is not paused.
     */
    function _requirePaused() internal view virtual {
        if (!paused()) {
            revert ExpectedPause();
        }
    }

    /**
     * @dev Triggers stopped state.
     *
     * Requirements:
     *
     * - The contract must not be paused.
     */
    function _pause() internal virtual whenNotPaused {
        _paused = true;
        emit Paused(_msgSender());
    }

    /**
     * @dev Returns to normal state.
     *
     * Requirements:
     *
     * - The contract must be paused.
     */
    function _unpause() internal virtual whenPaused {
        _paused = false;
        emit Unpaused(_msgSender());
    }
}

// lib/openzeppelin-contracts/contracts/access/Ownable2Step.sol

// OpenZeppelin Contracts (last updated v5.1.0) (access/Ownable2Step.sol)

/**
 * @dev Contract module which provides access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * This extension of the {Ownable} contract includes a two-step mechanism to transfer
 * ownership, where the new owner must call {acceptOwnership} in order to replace the
 * old one. This can help prevent common mistakes, such as transfers of ownership to
 * incorrect accounts, or to contracts that are unable to interact with the
 * permission system.
 *
 * The initial owner is specified at deployment time in the constructor for `Ownable`. This
 * can later be changed with {transferOwnership} and {acceptOwnership}.
 *
 * This module is used through inheritance. It will make available all functions
 * from parent (Ownable).
 */
abstract contract Ownable2Step is Ownable {
    address private _pendingOwner;

    event OwnershipTransferStarted(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Returns the address of the pending owner.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @dev Starts the ownership transfer of the contract to a new account. Replaces the pending transfer if there is one.
     * Can only be called by the current owner.
     *
     * Setting `newOwner` to the zero address is allowed; this can be used to cancel an initiated ownership transfer.
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        _pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner(), newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`) and deletes any pending owner.
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        delete _pendingOwner;
        super._transferOwnership(newOwner);
    }

    /**
     * @dev The new owner accepts the ownership transfer.
     */
    function acceptOwnership() public virtual {
        address sender = _msgSender();
        if (pendingOwner() != sender) {
            revert OwnableUnauthorizedAccount(sender);
        }
        _transferOwnership(sender);
    }
}

// lib/openzeppelin-contracts/contracts/interfaces/IERC1363.sol

// OpenZeppelin Contracts (last updated v5.4.0) (interfaces/IERC1363.sol)

/**
 * @title IERC1363
 * @dev Interface of the ERC-1363 standard as defined in the https://eips.ethereum.org/EIPS/eip-1363[ERC-1363].
 *
 * Defines an extension interface for ERC-20 tokens that supports executing code on a recipient contract
 * after `transfer` or `transferFrom`, or code on a spender contract after `approve`, in a single transaction.
 */
interface IERC1363 is IERC20, IERC165 {
    /*
     * Note: the ERC-165 identifier for this interface is 0xb0202a11.
     * 0xb0202a11 ===
     *   bytes4(keccak256('transferAndCall(address,uint256)')) ^
     *   bytes4(keccak256('transferAndCall(address,uint256,bytes)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256)')) ^
     *   bytes4(keccak256('transferFromAndCall(address,address,uint256,bytes)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256)')) ^
     *   bytes4(keccak256('approveAndCall(address,uint256,bytes)'))
     */

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from the caller's account to `to`
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferAndCall(address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value) external returns (bool);

    /**
     * @dev Moves a `value` amount of tokens from `from` to `to` using the allowance mechanism
     * and then calls {IERC1363Receiver-onTransferReceived} on `to`.
     * @param from The address which you want to send tokens from.
     * @param to The address which you want to transfer to.
     * @param value The amount of tokens to be transferred.
     * @param data Additional data with no specified format, sent in call to `to`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function transferFromAndCall(address from, address to, uint256 value, bytes calldata data) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value) external returns (bool);

    /**
     * @dev Sets a `value` amount of tokens as the allowance of `spender` over the
     * caller's tokens and then calls {IERC1363Spender-onApprovalReceived} on `spender`.
     * @param spender The address which will spend the funds.
     * @param value The amount of tokens to be spent.
     * @param data Additional data with no specified format, sent in call to `spender`.
     * @return A boolean value indicating whether the operation succeeded unless throwing.
     */
    function approveAndCall(address spender, uint256 value, bytes calldata data) external returns (bool);
}

// lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol

// OpenZeppelin Contracts (last updated v5.3.0) (token/ERC20/utils/SafeERC20.sol)

/**
 * @title SafeERC20
 * @dev Wrappers around ERC-20 operations that throw on failure (when the token
 * contract returns false). Tokens that return no value (and instead revert or
 * throw on failure) are also supported, non-reverting calls are assumed to be
 * successful.
 * To use this library you can add a `using SafeERC20 for IERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
    /**
     * @dev An operation with an ERC-20 token failed.
     */
    error SafeERC20FailedOperation(address token);

    /**
     * @dev Indicates a failed `decreaseAllowance` request.
     */
    error SafeERC20FailedDecreaseAllowance(address spender, uint256 currentAllowance, uint256 requestedDecrease);

    /**
     * @dev Transfer `value` amount of `token` from the calling contract to `to`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     */
    function safeTransfer(IERC20 token, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Transfer `value` amount of `token` from `from` to `to`, spending the approval given by `from` to the
     * calling contract. If `token` returns no value, non-reverting calls are assumed to be successful.
     */
    function safeTransferFrom(IERC20 token, address from, address to, uint256 value) internal {
        _callOptionalReturn(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Variant of {safeTransfer} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransfer(IERC20 token, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transfer, (to, value)));
    }

    /**
     * @dev Variant of {safeTransferFrom} that returns a bool instead of reverting if the operation is not successful.
     */
    function trySafeTransferFrom(IERC20 token, address from, address to, uint256 value) internal returns (bool) {
        return _callOptionalReturnBool(token, abi.encodeCall(token.transferFrom, (from, to, value)));
    }

    /**
     * @dev Increase the calling contract's allowance toward `spender` by `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeIncreaseAllowance(IERC20 token, address spender, uint256 value) internal {
        uint256 oldAllowance = token.allowance(address(this), spender);
        forceApprove(token, spender, oldAllowance + value);
    }

    /**
     * @dev Decrease the calling contract's allowance toward `spender` by `requestedDecrease`. If `token` returns no
     * value, non-reverting calls are assumed to be successful.
     *
     * IMPORTANT: If the token implements ERC-7674 (ERC-20 with temporary allowance), and if the "client"
     * smart contract uses ERC-7674 to set temporary allowances, then the "client" smart contract should avoid using
     * this function. Performing a {safeIncreaseAllowance} or {safeDecreaseAllowance} operation on a token contract
     * that has a non-zero temporary allowance (for that particular owner-spender) will result in unexpected behavior.
     */
    function safeDecreaseAllowance(IERC20 token, address spender, uint256 requestedDecrease) internal {
        unchecked {
            uint256 currentAllowance = token.allowance(address(this), spender);
            if (currentAllowance < requestedDecrease) {
                revert SafeERC20FailedDecreaseAllowance(spender, currentAllowance, requestedDecrease);
            }
            forceApprove(token, spender, currentAllowance - requestedDecrease);
        }
    }

    /**
     * @dev Set the calling contract's allowance toward `spender` to `value`. If `token` returns no value,
     * non-reverting calls are assumed to be successful. Meant to be used with tokens that require the approval
     * to be set to zero before setting it to a non-zero value, such as USDT.
     *
     * NOTE: If the token implements ERC-7674, this function will not modify any temporary allowance. This function
     * only sets the "standard" allowance. Any temporary allowance will remain active, in addition to the value being
     * set here.
     */
    function forceApprove(IERC20 token, address spender, uint256 value) internal {
        bytes memory approvalCall = abi.encodeCall(token.approve, (spender, value));

        if (!_callOptionalReturnBool(token, approvalCall)) {
            _callOptionalReturn(token, abi.encodeCall(token.approve, (spender, 0)));
            _callOptionalReturn(token, approvalCall);
        }
    }

    /**
     * @dev Performs an {ERC1363} transferAndCall, with a fallback to the simple {ERC20} transfer if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            safeTransfer(token, to, value);
        } else if (!token.transferAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} transferFromAndCall, with a fallback to the simple {ERC20} transferFrom if the target
     * has no code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * Reverts if the returned value is other than `true`.
     */
    function transferFromAndCallRelaxed(
        IERC1363 token,
        address from,
        address to,
        uint256 value,
        bytes memory data
    ) internal {
        if (to.code.length == 0) {
            safeTransferFrom(token, from, to, value);
        } else if (!token.transferFromAndCall(from, to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Performs an {ERC1363} approveAndCall, with a fallback to the simple {ERC20} approve if the target has no
     * code. This can be used to implement an {ERC721}-like safe transfer that rely on {ERC1363} checks when
     * targeting contracts.
     *
     * NOTE: When the recipient address (`to`) has no code (i.e. is an EOA), this function behaves as {forceApprove}.
     * Opposedly, when the recipient address (`to`) has code, this function only attempts to call {ERC1363-approveAndCall}
     * once without retrying, and relies on the returned value to be true.
     *
     * Reverts if the returned value is other than `true`.
     */
    function approveAndCallRelaxed(IERC1363 token, address to, uint256 value, bytes memory data) internal {
        if (to.code.length == 0) {
            forceApprove(token, to, value);
        } else if (!token.approveAndCall(to, value, data)) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturnBool} that reverts if call fails to meet the requirements.
     */
    function _callOptionalReturn(IERC20 token, bytes memory data) private {
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            let success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            // bubble errors
            if iszero(success) {
                let ptr := mload(0x40)
                returndatacopy(ptr, 0, returndatasize())
                revert(ptr, returndatasize())
            }
            returnSize := returndatasize()
            returnValue := mload(0)
        }

        if (returnSize == 0 ? address(token).code.length == 0 : returnValue != 1) {
            revert SafeERC20FailedOperation(address(token));
        }
    }

    /**
     * @dev Imitates a Solidity high-level call (i.e. a regular function call to a contract), relaxing the requirement
     * on the return value: the return value is optional (but if data is returned, it must not be false).
     * @param token The token targeted by the call.
     * @param data The call data (encoded using abi.encode or one of its variants).
     *
     * This is a variant of {_callOptionalReturn} that silently catches all reverts and returns a bool instead.
     */
    function _callOptionalReturnBool(IERC20 token, bytes memory data) private returns (bool) {
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly ("memory-safe") {
            success := call(gas(), token, 0, add(data, 0x20), mload(data), 0, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0)
        }
        return success && (returnSize == 0 ? address(token).code.length > 0 : returnValue == 1);
    }
}

// src/BountyManagerV2.sol

/**
 * @title BountyManager
 * @author Bug Bounty Platform Team
 * @notice Production-ready bounty management system for Farcaster on Base blockchain
 * @dev Supports ETH and ERC20 token rewards with platform fees. Security-hardened version.
 * @custom:security-contact security@bugbounty.com
 */
contract BountyManagerV2 is Ownable2Step, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ============ Structs ============

    /// @notice Bounty lifecycle states
    enum BountyStatus {
        Active,      // Open for submissions
        Completed,   // Winner selected and paid
        Cancelled    // Cancelled by creator, funds refunded
    }

    /// @notice Supported payment methods
    enum PaymentToken {
        ETH,         // Native ETH
        ERC20        // ERC20 token (USDC, DAI, etc.)
    }

    /**
     * @notice Main bounty structure
     * @dev Variables ordered for optimal storage packing
     */
    struct Bounty {
        uint256 id;
        uint256 reward;
        uint256 createdAt;
        uint256 deadline;
        address creator;
        address tokenAddress;      // Only used for ERC20
        address winner;
        PaymentToken paymentType;
        BountyStatus status;
        string title;
        string description;
        string farcasterCastHash;  // Link to Farcaster post
    }

    /**
     * @notice Submission structure for bounty reports
     */
    struct Submission {
        uint256 id;
        uint256 bountyId;
        uint256 submittedAt;
        address submitter;
        string description;
        string proofUrl;           // Link to report/proof
        string farcasterUsername;  // Optional: link to Farcaster profile
        bool accepted;
    }

    // ============ State Variables ============

    /// @notice Next bounty ID counter
    uint256 public nextBountyId = 1;
    
    /// @notice Next submission ID counter
    uint256 public nextSubmissionId = 1;
    
    /// @notice Platform fee in basis points (500 = 5%)
    /// @dev Maximum fee is capped at 10% (1000 bps)
    uint256 public platformFeePercent = 500;
    
    /// @notice Address receiving platform fees
    address public feeCollector;

    /// @notice Bounty ID => Bounty data
    mapping(uint256 => Bounty) public bounties;
    
    /// @notice Submission ID => Submission data
    mapping(uint256 => Submission) public submissions;
    
    /// @notice Bounty ID => array of submission IDs
    mapping(uint256 => uint256[]) public bountySubmissions;
    
    /// @notice Creator address => array of bounty IDs
    mapping(address => uint256[]) public userBounties;
    
    /// @notice Submitter address => array of submission IDs
    mapping(address => uint256[]) public userSubmissions;

    /// @notice Whitelisted ERC20 tokens (when enabled)
    mapping(address => bool) public supportedTokens;
    
    /// @notice Whether token whitelist is enabled
    bool public whitelistEnabled = false;

    // ============ Events ============

    /**
     * @notice Emitted when a new bounty is created
     * @param bountyId Unique bounty identifier
     * @param creator Address of bounty creator
     * @param title Bounty title
     * @param reward Amount of reward
     * @param paymentType ETH or ERC20
     * @param tokenAddress Token contract (if ERC20)
     * @param deadline Submission deadline timestamp
     * @param farcasterCastHash Link to announcement
     */
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        string title,
        uint256 reward,
        PaymentToken paymentType,
        address tokenAddress,
        uint256 deadline,
        string farcasterCastHash
    );

    event SubmissionCreated(
        uint256 indexed submissionId,
        uint256 indexed bountyId,
        address indexed submitter,
        string farcasterUsername
    );

    event BountyCompleted(
        uint256 indexed bountyId,
        uint256 indexed submissionId,
        address indexed winner,
        uint256 rewardAmount,
        uint256 platformFee
    );

    event BountyCancelled(
        uint256 indexed bountyId,
        address indexed creator,
        uint256 refundAmount
    );

    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeCollectorUpdated(address oldCollector, address newCollector);
    event TokenWhitelisted(address indexed token, bool status);
    event WhitelistStatusUpdated(bool enabled);
    event ContractPaused(address indexed by);
    event ContractUnpaused(address indexed by);

    // ============ Constructor ============

    /**
     * @notice Initialize the contract
     * @dev Sets initial fee collector with validation
     * @param _feeCollector Address to receive platform fees
     */
    constructor(address _feeCollector) Ownable(msg.sender) {
        require(_feeCollector != address(0), "Invalid fee collector");
        require(_feeCollector != address(this), "Cannot be contract address");
        feeCollector = _feeCollector;
    }

    // ============ Core Functions ============

    /**
     * @notice Create a new bounty with ETH reward
     * @dev Follows CEI pattern, validates all inputs
     * @param _title Bounty title
     * @param _description Detailed description
     * @param _deadline Submission deadline (unix timestamp)
     * @param _farcasterCastHash Link to Farcaster announcement post
     * @return bountyId Newly created bounty ID
     */
    function createBountyETH(
        string calldata _title,
        string calldata _description,
        uint256 _deadline,
        string calldata _farcasterCastHash
    ) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Reward must be > 0");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length < 201, "Title too long");

        uint256 bountyId = nextBountyId++;

        Bounty storage bounty = bounties[bountyId];
        bounty.id = bountyId;
        bounty.creator = msg.sender;
        bounty.title = _title;
        bounty.description = _description;
        bounty.reward = msg.value;
        bounty.paymentType = PaymentToken.ETH;
        bounty.tokenAddress = address(0);
        bounty.status = BountyStatus.Active;
        bounty.winner = address(0);
        bounty.createdAt = block.timestamp;
        bounty.deadline = _deadline;
        bounty.farcasterCastHash = _farcasterCastHash;

        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            _title,
            msg.value,
            PaymentToken.ETH,
            address(0),
            _deadline,
            _farcasterCastHash
        );

        return bountyId;
    }

    /**
     * @notice Create a new bounty with ERC20 token reward
     * @param _title Bounty title
     * @param _description Detailed description
     * @param _reward Amount of tokens
     * @param _tokenAddress ERC20 token contract address
     * @param _deadline Submission deadline
     * @param _farcasterCastHash Link to Farcaster post
     * @return bountyId Newly created bounty ID
     */
    function createBountyERC20(
        string calldata _title,
        string calldata _description,
        uint256 _reward,
        address _tokenAddress,
        uint256 _deadline,
        string calldata _farcasterCastHash
    ) external whenNotPaused returns (uint256) {
        require(_reward > 0, "Reward must be > 0");
        require(_tokenAddress != address(0), "Invalid token");
        require(_tokenAddress != address(this), "Cannot use self as token");
        require(_deadline > block.timestamp, "Deadline must be future");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_title).length < 201, "Title too long");

        if (whitelistEnabled) {
            require(supportedTokens[_tokenAddress], "Token not whitelisted");
        }

        // Transfer tokens to contract
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), _reward);

        uint256 bountyId = nextBountyId++;

        Bounty storage bounty = bounties[bountyId];
        bounty.id = bountyId;
        bounty.creator = msg.sender;
        bounty.title = _title;
        bounty.description = _description;
        bounty.reward = _reward;
        bounty.paymentType = PaymentToken.ERC20;
        bounty.tokenAddress = _tokenAddress;
        bounty.status = BountyStatus.Active;
        bounty.winner = address(0);
        bounty.createdAt = block.timestamp;
        bounty.deadline = _deadline;
        bounty.farcasterCastHash = _farcasterCastHash;

        userBounties[msg.sender].push(bountyId);

        emit BountyCreated(
            bountyId,
            msg.sender,
            _title,
            _reward,
            PaymentToken.ERC20,
            _tokenAddress,
            _deadline,
            _farcasterCastHash
        );

        return bountyId;
    }

    /**
     * @notice Submit a bug report/solution to a bounty
     * @param _bountyId Target bounty
     * @param _description Report description
     * @param _proofUrl Link to detailed report
     * @param _farcasterUsername Optional Farcaster username
     * @return submissionId Newly created submission ID
     */
    function submitReport(
        uint256 _bountyId,
        string calldata _description,
        string calldata _proofUrl,
        string calldata _farcasterUsername
    ) external whenNotPaused returns (uint256) {
        Bounty storage bounty = bounties[_bountyId];
        
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(block.timestamp < bounty.deadline, "Deadline passed");
        require(bounty.creator != msg.sender, "Cannot submit to own bounty");
        require(bytes(_description).length > 0, "Description required");

        uint256 submissionId = nextSubmissionId++;

        Submission storage submission = submissions[submissionId];
        submission.id = submissionId;
        submission.bountyId = _bountyId;
        submission.submitter = msg.sender;
        submission.description = _description;
        submission.proofUrl = _proofUrl;
        submission.submittedAt = block.timestamp;
        submission.accepted = false;
        submission.farcasterUsername = _farcasterUsername;

        bountySubmissions[_bountyId].push(submissionId);
        userSubmissions[msg.sender].push(submissionId);

        emit SubmissionCreated(submissionId, _bountyId, msg.sender, _farcasterUsername);

        return submissionId;
    }

    /**
     * @notice Accept a submission and pay out the winner
     * @dev CRITICAL SECURITY: Follows strict CEI pattern, emits events before transfers
     * @param _submissionId Winning submission
     * @custom:security Reentrancy protected, event-based reentrancy prevented
     */
    function acceptSubmission(uint256 _submissionId) external nonReentrant whenNotPaused {
        Submission storage submission = submissions[_submissionId];
        Bounty storage bounty = bounties[submission.bountyId];

        // Checks
        require(msg.sender == bounty.creator, "Only creator can accept");
        require(bounty.status == BountyStatus.Active, "Bounty not active");
        require(!submission.accepted, "Already accepted");
        require(block.timestamp <= bounty.deadline, "Deadline passed");
        require(submission.submitter != address(0), "Invalid submitter");

        // Effects (update state BEFORE external calls)
        submission.accepted = true;
        bounty.status = BountyStatus.Completed;
        bounty.winner = submission.submitter;

        // Calculate fees
        uint256 platformFee = (bounty.reward * platformFeePercent) / 10000;
        uint256 payoutAmount = bounty.reward - platformFee;

        require(payoutAmount > 0, "Invalid payout amount");

        // Emit event BEFORE external calls (prevents event-based reentrancy)
        emit BountyCompleted(submission.bountyId, _submissionId, submission.submitter, payoutAmount, platformFee);

        // Interactions (external calls LAST)
        if (bounty.paymentType == PaymentToken.ETH) {
            // Use .call with gas limit to prevent griefing
            (bool successWinner, ) = payable(submission.submitter).call{value: payoutAmount, gas: 10000}("");
            require(successWinner, "Winner payout failed");

            if (platformFee > 0) {
                (bool successFee, ) = payable(feeCollector).call{value: platformFee, gas: 10000}("");
                require(successFee, "Fee transfer failed");
            }
        } else {
            IERC20 token = IERC20(bounty.tokenAddress);
            token.safeTransfer(submission.submitter, payoutAmount);
            
            if (platformFee > 0) {
                token.safeTransfer(feeCollector, platformFee);
            }
        }
    }

    /**
     * @notice Cancel a bounty and refund the creator
     * @dev Only active bounties can be cancelled
     * @param _bountyId Bounty to cancel
     */
    function cancelBounty(uint256 _bountyId) external nonReentrant whenNotPaused {
        Bounty storage bounty = bounties[_bountyId];

        require(msg.sender == bounty.creator, "Only creator can cancel");
        require(bounty.status == BountyStatus.Active, "Bounty not active");

        // Effects
        bounty.status = BountyStatus.Cancelled;

        // Emit event before transfer
        emit BountyCancelled(_bountyId, bounty.creator, bounty.reward);

        // Interactions
        if (bounty.paymentType == PaymentToken.ETH) {
            (bool success, ) = payable(bounty.creator).call{value: bounty.reward, gas: 10000}("");
            require(success, "Refund failed");
        } else {
            IERC20(bounty.tokenAddress).safeTransfer(bounty.creator, bounty.reward);
        }
    }

    // ============ View Functions ============

    function getBountySubmissions(uint256 _bountyId) external view returns (uint256[] memory) {
        return bountySubmissions[_bountyId];
    }

    function getUserBounties(address _user) external view returns (uint256[] memory) {
        return userBounties[_user];
    }

    function getUserSubmissions(address _user) external view returns (uint256[] memory) {
        return userSubmissions[_user];
    }

    function getBounty(uint256 _bountyId) external view returns (
        address creator,
        string memory title,
        string memory description,
        uint256 reward,
        PaymentToken paymentType,
        address tokenAddress,
        BountyStatus status,
        address winner,
        uint256 deadline,
        string memory farcasterCastHash
    ) {
        Bounty memory bounty = bounties[_bountyId];
        return (
            bounty.creator,
            bounty.title,
            bounty.description,
            bounty.reward,
            bounty.paymentType,
            bounty.tokenAddress,
            bounty.status,
            bounty.winner,
            bounty.deadline,
            bounty.farcasterCastHash
        );
    }

    // ============ Admin Functions ============

    function setPlatformFee(uint256 _newFeePercent) external payable onlyOwner {
        require(_newFeePercent < 1001, "Fee cannot exceed 10%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(oldFee, _newFeePercent);
    }

    function setFeeCollector(address _newCollector) external payable onlyOwner {
        require(_newCollector != address(0), "Invalid address");
        require(_newCollector != address(this), "Cannot be contract");
        address oldCollector = feeCollector;
        feeCollector = _newCollector;
        emit FeeCollectorUpdated(oldCollector, _newCollector);
    }

    function setWhitelistEnabled(bool _enabled) external payable onlyOwner {
        whitelistEnabled = _enabled;
        emit WhitelistStatusUpdated(_enabled);
    }

    function setTokenWhitelisted(address _token, bool _status) external payable onlyOwner {
        require(_token != address(0), "Invalid token");
        supportedTokens[_token] = _status;
        emit TokenWhitelisted(_token, _status);
    }

    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }

    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        require(paused(), "Must be paused");
        if (_token == address(0)) {
            payable(owner()).transfer(_amount);
        } else {
            IERC20(_token).safeTransfer(owner(), _amount);
        }
    }

    /**
     * @notice Fallback to receive ETH
     * @dev Only accepts ETH, no data processing
     */
    receive() external payable {
        // Intentionally empty - accepts ETH for bounties
    }
}

