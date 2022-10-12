import { sign, format  } from "js-conflux-sdk/dist/js-conflux-sdk.umd.min.js";

export const randomSecret = () => {
  const bytes = Buffer.allocUnsafe(32);
  return `0x${crypto.getRandomValues(bytes).toString("hex")}`;
};

export function decodeLabelhash(hash) {
  if (!(hash.startsWith('[') && hash.endsWith(']'))) {
    throw Error(
      'Expected encoded labelhash to start and end with square brackets',
    )
  }

  if (hash.length !== 66) {
    throw Error('Expected encoded labelhash to have a length of 66')
  }

  return `0x${hash.slice(1, -1)}`
}

export function labelhash (label) {
  const hashBuf = sign.keccak256(Buffer.from(label))
  return format.hex(hashBuf)
}

export function namehash (inputName) {
  // Reject empty names:
  const name = inputName.normalize()
  let node = Buffer.alloc(32)

  if (name) {
    const labels = name.split('.')

    for(let i = labels.length - 1; i >= 0; i--) {
      let labelSha = sign.keccak256(Buffer.from(labels[i]))
      node = sign.keccak256(Buffer.concat([node, labelSha], 64))
    }
  }

  return format.hex(node)
}