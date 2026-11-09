import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toHex, fromHex, hexToSigned, signedToHex } from '../src/index.js';

test('toHex converts zero and small values', () => {
  assert.equal(toHex(0n), '0');
  assert.equal(toHex(255n), 'ff');
  assert.equal(toHex(4096n), '1000');
});

test('toHex handles the maximum unsigned 64-bit value', () => {
  assert.equal(toHex((1n << 64n) - 1n), 'ffffffffffffffff');
});

test('toHex rejects negative values and overflow', () => {
  assert.throws(() => toHex(-1n), RangeError);
  assert.throws(() => toHex(1n << 64n), RangeError);
});

test('toHex rejects non-BigInt input', () => {
  assert.throws(() => toHex(42), TypeError);
  assert.throws(() => toHex('ff'), TypeError);
});

test('fromHex parses plain and prefixed strings', () => {
  assert.equal(fromHex('0'), 0n);
  assert.equal(fromHex('ff'), 255n);
  assert.equal(fromHex('0xFF'), 255n);
  assert.equal(fromHex('0Xff'), 255n);
  assert.equal(fromHex('0000000000000000'), 0n);
});

test('fromHex parses the maximum unsigned 64-bit value', () => {
  assert.equal(fromHex('ffffffffffffffff'), (1n << 64n) - 1n);
});

test('fromHex rejects malformed input', () => {
  assert.throws(() => fromHex(''), SyntaxError);
  assert.throws(() => fromHex('0x'), SyntaxError);
  assert.throws(() => fromHex('gg'), SyntaxError);
  assert.throws(() => fromHex('12 34'), SyntaxError);
  assert.throws(() => fromHex('0x1g'), SyntaxError);
  assert.throws(() => fromHex(255), TypeError);
});

test('fromHex rejects values that do not fit in 64 bits', () => {
  assert.throws(() => fromHex('10000000000000000'), RangeError);
});

test('hexToSigned reinterprets the high bit as negative', () => {
  assert.equal(hexToSigned(0n), 0n);
  assert.equal(hexToSigned(1n), 1n);
  assert.equal(hexToSigned((1n << 63n) - 1n), (1n << 63n) - 1n);
  assert.equal(hexToSigned(1n << 63n), -(1n << 63n));
  assert.equal(hexToSigned((1n << 64n) - 1n), -1n);
});

test('signedToHex encodes negative values with two\'s complement', () => {
  assert.equal(signedToHex(0n), '0');
  assert.equal(signedToHex(1n), '1');
  assert.equal(signedToHex((1n << 63n) - 1n), '7fffffffffffffff');
  assert.equal(signedToHex(-(1n << 63n)), '8000000000000000');
  assert.equal(signedToHex(-1n), 'ffffffffffffffff');
});

test('signedToHex rejects out-of-range and non-BigInt input', () => {
  assert.throws(() => signedToHex(1n << 63n), RangeError);
  assert.throws(() => signedToHex(-(1n << 63n) - 1n), RangeError);
  assert.throws(() => signedToHex(1), TypeError);
});

test('round-trip: signedToHex then hexToSigned', () => {
  const samples = [0n, 1n, -1n, 12345n, -12345n, (1n << 63n) - 1n, -(1n << 63n)];
  for (const sample of samples) {
    assert.equal(hexToSigned(fromHex(signedToHex(sample))), sample);
  }
});
