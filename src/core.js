const MAX_UINT64 = (1n << 64n) - 1n;
const MIN_INT64 = -(1n << 63n);
const MAX_INT64 = (1n << 63n) - 1n;

/**
 * Validates that a value is a non-negative BigInt and fits within 64 bits.
 * We use BigInt rather than Number because JavaScript numbers lose integer
 * precision above 2^53, and hexadecimal strings are commonly used for 64-bit
 * values.
 *
 * @param {bigint} value
 * @param {string} name
 * @throws {RangeError} when the value is out of range or not an integer
 */
function assertUnsigned64(value, name) {
  if (typeof value !== 'bigint') {
    throw new TypeError(`${name} must be a BigInt`);
  }
  if (value < 0n || value > MAX_UINT64) {
    throw new RangeError(`${name} must be an unsigned 64-bit integer`);
  }
}

/**
 * Validates that a value is a signed BigInt and fits within signed 64 bits.
 *
 * @param {bigint} value
 * @param {string} name
 * @throws {RangeError} when the value is out of range or not an integer
 */
function assertSigned64(value, name) {
  if (typeof value !== 'bigint') {
    throw new TypeError(`${name} must be a BigInt`);
  }
  if (value < MIN_INT64 || value > MAX_INT64) {
    throw new RangeError(`${name} must be a signed 64-bit integer`);
  }
}

/**
 * Converts an unsigned 64-bit integer to a lowercase hexadecimal string.
 *
 * @param {bigint} value unsigned integer in the range [0, 2^64 - 1]
 * @returns {string} hex string without a "0x" prefix, using lowercase a-f
 */
export function toHex(value) {
  assertUnsigned64(value, 'value');
  return value.toString(16);
}

/**
 * Parses a hexadecimal string as an unsigned 64-bit integer.
 *
 * The input may optionally start with "0x" or "0X". Leading zeros are
 * accepted. An empty string is rejected because it has no numeric meaning.
 *
 * @param {string} hex
 * @returns {bigint} unsigned integer in the range [0, 2^64 - 1]
 * @throws {TypeError} when hex is not a string
 * @throws {SyntaxError} when hex is not valid hexadecimal
 * @throws {RangeError} when the value does not fit in 64 bits
 */
export function fromHex(hex) {
  if (typeof hex !== 'string') {
    throw new TypeError('hex must be a string');
  }
  const trimmed = hex.trim();
  if (trimmed.length === 0) {
    throw new SyntaxError('hex string must not be empty');
  }
  let digits = trimmed;
  if (digits.startsWith('0x') || digits.startsWith('0X')) {
    digits = digits.slice(2);
  }
  if (digits.length === 0) {
    throw new SyntaxError('hex string must contain at least one digit');
  }
  if (!/^[0-9a-fA-F]+$/.test(digits)) {
    throw new SyntaxError('hex string contains invalid characters');
  }
  const value = BigInt('0x' + digits);
  if (value > MAX_UINT64) {
    throw new RangeError('hex string exceeds unsigned 64-bit range');
  }
  return value;
}

/**
 * Reinterprets an unsigned 64-bit integer as a signed two's complement
 * integer. Values with the high bit set become negative.
 *
 * @param {bigint} value unsigned integer in the range [0, 2^64 - 1]
 * @returns {bigint} signed integer in the range [-2^63, 2^63 - 1]
 */
export function hexToSigned(value) {
  assertUnsigned64(value, 'value');
  const SIGN_BIT = 1n << 63n;
  if (value >= SIGN_BIT) {
    return value - (1n << 64n);
  }
  return value;
}

/**
 * Encodes a signed 64-bit integer using two's complement and returns the
 * lowercase hexadecimal representation.
 *
 * @param {bigint} value signed integer in the range [-2^63, 2^63 - 1]
 * @returns {string} hex string without a "0x" prefix, using lowercase a-f
 */
export function signedToHex(value) {
  assertSigned64(value, 'value');
  if (value < 0n) {
    return (value + (1n << 64n)).toString(16);
  }
  return value.toString(16);
}
