# int-hex-string-tools

Converts unsigned integers to and from hexadecimal strings, with helpers for two's complement signed interpretation.

```js
import { toHex, fromHex, hexToSigned, signedToHex } from './src/index.js';

toHex(255n);              // 'ff'
fromHex('0xFF');          // 255n
hexToSigned(fromHex('ffffffffffffffff')); // -1n
signedToHex(-1n);         // 'ffffffffffffffff'
```

## Why this exists

JavaScript has no built-in way to convert between hexadecimal strings and 64-bit integers without losing precision. `Number` is exact only up to 2^53, so a value such as `0xffffffffffffffff` cannot be represented as a Number. This library uses `BigInt` throughout and enforces a fixed 64-bit width so that conversions are predictable and errors are caught at the boundary rather than silently wrapping.

The trade-off is that all inputs and outputs are `BigInt` rather than `Number`. That is deliberate: it keeps the contract unambiguous and prevents the precision loss that motivated the library in the first place.

## Awkward edge

The two functions that deal with signed values are not inverses of `toHex` and `fromHex`. `hexToSigned` reinterprets an unsigned bit pattern as signed two's complement, while `signedToHex` encodes a signed integer into that same bit pattern. If you call `hexToSigned(fromHex('ff'))` you get `255n`, not `-1n`, because `ff` does not set the sign bit of a 64-bit value. To see the signed interpretation of a full-width value you must supply all 16 hex digits, for example `hexToSigned(fromHex('ffffffffffffffff'))`, which returns `-1n`.
