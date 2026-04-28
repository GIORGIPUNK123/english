import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FieldValue } from 'firebase-admin/firestore';
import { db } from './firebaseAdmin';

type TokenType = 'group' | '1on1';

type BundleDefinition = {
  tokens: number;
  price: number;
  originalPrice: number;
};

type UserTokenDoc = {
  group_tokens?: number;
  one_on_one_tokens?: number;
};

type PurchaseTokensData = {
  tokenType: TokenType;
  bundleId: string;
};

const TOKEN_BUNDLES_BY_TYPE: Record<TokenType, Record<string, BundleDefinition>> = {
  group: {
    'custom-1': { tokens: 1, price: 11.49, originalPrice: 11.49 },
    'custom-2': { tokens: 2, price: 22.98, originalPrice: 22.98 },
    'custom-3': { tokens: 3, price: 34.47, originalPrice: 34.47 },
    'bundle-4': { tokens: 4, price: 44.99, originalPrice: 44.99 },
    'bundle-8': { tokens: 8, price: 59.99, originalPrice: 74.99 },
    'bundle-16': { tokens: 16, price: 103.99, originalPrice: 129.99 },
    'bundle-32': { tokens: 32, price: 151.99, originalPrice: 189.99 },
  },
  '1on1': {
    'custom-1': { tokens: 1, price: 24.99, originalPrice: 24.99 },
    'custom-2': { tokens: 2, price: 49.98, originalPrice: 49.98 },
    'custom-3': { tokens: 3, price: 74.97, originalPrice: 74.97 },
    'bundle-4': { tokens: 4, price: 94.99, originalPrice: 99.96 },
    'bundle-8': { tokens: 8, price: 179.99, originalPrice: 199.92 },
    'bundle-16': { tokens: 16, price: 335.99, originalPrice: 399.84 },
    'bundle-32': { tokens: 32, price: 623.99, originalPrice: 799.68 },
  },
};

const TOKEN_FIELD_BY_TYPE: Record<TokenType, 'group_tokens' | 'one_on_one_tokens'> = {
  group: 'group_tokens',
  '1on1': 'one_on_one_tokens',
};

const toSafeNumber = (value: unknown): number => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
};

export const purchaseTokens = onCall<PurchaseTokensData>(async ({ auth, data }) => {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'Login required');
  }

  const tokenType = data?.tokenType;
  const bundleId = data?.bundleId;

  if (!tokenType || (tokenType !== 'group' && tokenType !== '1on1')) {
    throw new HttpsError('invalid-argument', 'Invalid token type');
  }

  if (!bundleId) {
    throw new HttpsError('invalid-argument', 'Missing bundleId');
  }

  const bundle = TOKEN_BUNDLES_BY_TYPE[tokenType][bundleId];
  if (!bundle) {
    throw new HttpsError('invalid-argument', 'Invalid token bundle');
  }

  const userRef = db.collection('users').doc(auth.uid);
  const tokenField = TOKEN_FIELD_BY_TYPE[tokenType];

  let newBalance = 0;

  await db.runTransaction(async (tx) => {
    const userSnap = await tx.get(userRef);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'User profile not found');
    }

    const userData = (userSnap.data() || {}) as UserTokenDoc;
    const currentBalance = toSafeNumber(userData[tokenField]);
    newBalance = currentBalance + bundle.tokens;

    tx.update(userRef, {
      [tokenField]: FieldValue.increment(bundle.tokens),
      last_token_purchase_at: Math.floor(Date.now() / 1000),
    });
  });

  return {
    success: true,
    tokenType,
    bundleId,
    tokensAdded: bundle.tokens,
    newBalance,
    price: bundle.price,
    originalPrice: bundle.originalPrice,
  };
});
