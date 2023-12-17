export function shortAddress(address: string | null | undefined, start = 6, end = 4): string {
  try {
    if (!address) {
      return '';
    }
    if (address.startsWith('maven:')) {
      start = 10;
    }
    if (address.length <= start + end) {
      return address;
    }
    return `${address.substring(0, start)}...${address.substring(address.length - end, address.length)}`;
  } catch (error) {
    return '';
  }
}
