import { LessonTypeT, UserDataT } from '../types';

export type TokenPurchaseType = 'group' | '1on1';

export interface TokenBundleT {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  popular?: boolean;
  isCustom?: boolean;
}

export interface TokenBalancesT {
  legacy: number;
  group: number;
  oneOnOne: number;
  total: number;
}

const toSafeTokenNumber = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return value > 0 ? value : 0;
};

export const getTokenBalances = (
  userData: Partial<UserDataT> | null | undefined,
): TokenBalancesT => {
  const legacy = toSafeTokenNumber(userData?.tokens);
  const group = toSafeTokenNumber(userData?.group_tokens);
  const oneOnOne = toSafeTokenNumber(userData?.one_on_one_tokens);

  return {
    legacy,
    group,
    oneOnOne,
    total: legacy + group + oneOnOne,
  };
};

export const getAvailableTokensForLessonType = (
  tokenBalances: TokenBalancesT,
  lessonType: LessonTypeT,
): number => {
  if (lessonType === 'group') {
    return tokenBalances.group + tokenBalances.legacy;
  }

  return tokenBalances.oneOnOne + tokenBalances.legacy;
};

export const getLessonTokenLabel = (lessonType: LessonTypeT): string => {
  return lessonType === 'group' ? 'Group Token' : '1-on-1 Token';
};

export const getPurchaseTokenTypeLabel = (
  tokenType: TokenPurchaseType,
): string => {
  return tokenType === 'group' ? 'Group Tokens' : '1-on-1 Tokens';
};

export const TOKEN_BUNDLES_BY_TYPE: Record<TokenPurchaseType, TokenBundleT[]> =
  {
    group: [
      {
        id: 'custom-1',
        tokens: 1,
        price: 11.49,
        isCustom: true,
      },
      {
        id: 'custom-2',
        tokens: 2,
        price: 22.98,
        isCustom: true,
      },
      {
        id: 'custom-3',
        tokens: 3,
        price: 34.47,
        isCustom: true,
      },
      {
        id: 'bundle-4',
        tokens: 4,
        price: 44.99,
        originalPrice: 44.99,
      },
      {
        id: 'bundle-8',
        tokens: 8,
        price: 59.99,
        originalPrice: 74.99,
        discount: '20% OFF',
      },
      {
        id: 'bundle-16',
        tokens: 16,
        price: 103.99,
        originalPrice: 129.99,
        discount: '20% OFF',
        popular: true,
      },
      {
        id: 'bundle-32',
        tokens: 32,
        price: 151.99,
        originalPrice: 189.99,
        discount: '20% OFF',
      },
    ],
    '1on1': [
      {
        id: 'custom-1',
        tokens: 1,
        price: 24.99,
        isCustom: true,
      },
      {
        id: 'custom-2',
        tokens: 2,
        price: 49.98,
        isCustom: true,
      },
      {
        id: 'custom-3',
        tokens: 3,
        price: 74.97,
        isCustom: true,
      },
      {
        id: 'bundle-4',
        tokens: 4,
        price: 94.99,
        originalPrice: 99.96,
        discount: '5% OFF',
      },
      {
        id: 'bundle-8',
        tokens: 8,
        price: 179.99,
        originalPrice: 199.92,
        discount: '10% OFF',
      },
      {
        id: 'bundle-16',
        tokens: 16,
        price: 335.99,
        originalPrice: 399.84,
        discount: '16% OFF',
        popular: true,
      },
      {
        id: 'bundle-32',
        tokens: 32,
        price: 623.99,
        originalPrice: 799.68,
        discount: '22% OFF',
      },
    ],
  };

export const getDefaultBundleId = (tokenType: TokenPurchaseType): string => {
  const bundles = TOKEN_BUNDLES_BY_TYPE[tokenType];
  const popularBundle = bundles.find((bundle) => bundle.popular);

  return popularBundle ? popularBundle.id : bundles[0].id;
};
