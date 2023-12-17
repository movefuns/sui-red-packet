import { normalizeStructTag } from '@mysten/sui.js/utils';

export function isSameCoinType(type1: string, type2: string) {
  return normalizeStructTag(type1) === normalizeStructTag(type2);
}
