import { X, CreditCard, Wallet, Check, Smartphone } from 'lucide-react';
import { useState } from 'react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTokens: number;
}

interface TokenBundle {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  discount?: string;
  popular?: boolean;
  isCustom?: boolean;
}

const tokenBundles: TokenBundle[] = [
  // Custom amounts
  {
    id: 'custom-1',
    tokens: 1,
    price: 17,
    isCustom: true,
  },
  {
    id: 'custom-2',
    tokens: 2,
    price: 34,
    isCustom: true,
  },
  {
    id: 'custom-3',
    tokens: 3,
    price: 51,
    isCustom: true,
  },
  {
    id: 'custom-4',
    tokens: 4,
    price: 68,
    isCustom: true,
  },
  // Bundles with discounts
  {
    id: 'bundle-5',
    tokens: 5,
    price: 85,
    originalPrice: 85,
  },
  {
    id: 'bundle-10',
    tokens: 10,
    price: 153,
    originalPrice: 170,
    discount: '10% OFF',
    popular: true,
  },
  {
    id: 'bundle-15',
    tokens: 15,
    price: 216.75,
    originalPrice: 255,
    discount: '15% OFF',
  },
];

const paymentMethods = [
  { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
  { id: 'applepay', name: 'Apple Pay', icon: Smartphone },
  { id: 'paypal', name: 'PayPal', icon: Wallet },
];

export function TopUpModal({
  isOpen,
  onClose,
  currentTokens,
}: TopUpModalProps) {
  const [selectedBundle, setSelectedBundle] = useState<string>('bundle-10');
  const [selectedPayment, setSelectedPayment] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      // Here you would integrate with actual payment gateway
      console.log('Purchase:', { selectedBundle, selectedPayment });
      onClose();
    }, 2000);
  };

  const selectedBundleData = tokenBundles.find((b) => b.id === selectedBundle);

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/70 backdrop-blur-sm'
      onClick={onClose}
    >
      <div
        className='w-full max-w-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-2xl max-h-[95vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className='sticky top-0 z-10 p-4 rounded-t-lg bg-gradient-to-r from-blue-600 to-purple-600 sm:p-6 sm:rounded-t-xl'>
          <button
            onClick={onClose}
            className='absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all'
          >
            <X className='w-4 h-4 text-white sm:w-5 sm:h-5' />
          </button>
          <h2 className='mb-1 text-xl font-bold text-white sm:text-2xl sm:mb-2'>
            Buy Tokens
          </h2>
          <p className='text-xs text-white/90 sm:text-sm'>
            Current Balance:{' '}
            <span className='font-semibold'>{currentTokens} tokens</span>
          </p>
        </div>

        <div className='p-4 space-y-4 sm:p-6 sm:space-y-6'>
          {/* Custom Token Amounts */}
          <div>
            <h3 className='mb-3 text-base font-semibold text-gray-900 sm:text-lg dark:text-white sm:mb-4'>
              Buy Custom Amount
            </h3>
            <div className='grid grid-cols-4 gap-2 sm:gap-3'>
              {tokenBundles
                .filter((b) => b.isCustom)
                .map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle.id)}
                    className={`relative p-2.5 sm:p-4 rounded-lg border-2 transition-all text-center ${
                      selectedBundle === bundle.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/20 shadow-lg'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-blue-400 dark:hover:border-blue-500'
                    }`}
                  >
                    {selectedBundle === bundle.id && (
                      <div className='absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2'>
                        <div className='flex items-center justify-center w-4 h-4 bg-blue-600 rounded-full sm:w-5 sm:h-5'>
                          <Check className='w-2.5 h-2.5 sm:w-3 sm:h-3 text-white' />
                        </div>
                      </div>
                    )}
                    <div className='text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-0.5 sm:mb-1'>
                      {bundle.tokens}
                    </div>
                    <div className='text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2'>
                      {bundle.tokens === 1 ? 'Token' : 'Tokens'}
                    </div>
                    <div className='text-xs font-semibold text-gray-900 sm:text-sm dark:text-white'>
                      ${bundle.price}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Discounted Bundles */}
          <div>
            <h3 className='mb-3 text-base font-semibold text-gray-900 sm:text-lg dark:text-white sm:mb-4'>
              Save with Bundles
            </h3>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'>
              {tokenBundles
                .filter((b) => !b.isCustom)
                .map((bundle) => (
                  <button
                    key={bundle.id}
                    onClick={() => setSelectedBundle(bundle.id)}
                    className={`relative p-4 sm:p-6 rounded-xl border-2 transition-all text-left ${
                      selectedBundle === bundle.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                    } ${bundle.popular ? 'pt-7 sm:pt-8' : ''}`}
                  >
                    {/* Popular Badge */}
                    {bundle.popular && (
                      <div className='absolute left-0 right-0 flex justify-center -top-0'>
                        <span className='px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-t-lg'>
                          MOST POPULAR
                        </span>
                      </div>
                    )}

                    {/* Discount Badge */}
                    {bundle.discount && (
                      <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
                        <span className='px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-white bg-green-600 rounded-full shadow-lg'>
                          {bundle.discount}
                        </span>
                      </div>
                    )}

                    {/* Check Mark */}
                    {selectedBundle === bundle.id && !bundle.discount && (
                      <div className='absolute top-3 right-3 sm:top-4 sm:right-4'>
                        <div className='flex items-center justify-center w-5 h-5 bg-blue-600 rounded-full sm:w-6 sm:h-6'>
                          <Check className='w-3 h-3 text-white sm:w-4 sm:h-4' />
                        </div>
                      </div>
                    )}

                    {/* Token Count */}
                    <div className='mb-2 sm:mb-3'>
                      <div className='text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white'>
                        {bundle.tokens}
                      </div>
                      <div className='text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                        Tokens
                      </div>
                    </div>

                    {/* Price */}
                    <div className='mb-1.5 sm:mb-2'>
                      <div className='flex items-baseline gap-1.5 sm:gap-2'>
                        <span className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
                          ${bundle.price}
                        </span>
                        {bundle.originalPrice &&
                          bundle.originalPrice !== bundle.price && (
                            <span className='text-xs text-gray-500 line-through sm:text-sm dark:text-gray-400'>
                              ${bundle.originalPrice}
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Per Token Price */}
                    <div className='text-[10px] sm:text-xs text-gray-600 dark:text-gray-400'>
                      ${(bundle.price / bundle.tokens).toFixed(2)} per token
                    </div>

                    {/* Savings Info */}
                    {bundle.discount && bundle.originalPrice && (
                      <div className='mt-1.5 sm:mt-2 text-[10px] sm:text-xs font-medium text-green-600 dark:text-green-400'>
                        Save ${(bundle.originalPrice - bundle.price).toFixed(2)}
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className='mb-3 text-base font-semibold text-gray-900 sm:text-lg dark:text-white sm:mb-4'>
              Payment Method
            </h3>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4'>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border-2 transition-all ${
                      selectedPayment === method.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/60 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div
                      className={`p-2 sm:p-3 rounded-lg ${
                        selectedPayment === method.id
                          ? 'bg-blue-600'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          selectedPayment === method.id
                            ? 'text-white'
                            : 'text-gray-600 dark:text-gray-400'
                        }`}
                      />
                    </div>
                    <div className='flex-1 text-left'>
                      <div className='text-sm font-medium text-gray-900 sm:text-base dark:text-white'>
                        {method.name}
                      </div>
                    </div>
                    {selectedPayment === method.id && (
                      <Check className='w-4 h-4 text-blue-600 sm:w-5 sm:h-5' />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Details (Card Form) */}
          {selectedPayment === 'card' && (
            <div className='p-3 border border-gray-200 rounded-lg sm:p-4 bg-gray-50 dark:bg-gray-800/60 dark:border-gray-700'>
              <h4 className='mb-3 text-xs font-semibold text-gray-900 sm:text-sm dark:text-white sm:mb-4'>
                Card Details
              </h4>
              <div className='space-y-2.5 sm:space-y-3'>
                <div>
                  <label className='block mb-1 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300'>
                    Card Number
                  </label>
                  <input
                    type='text'
                    placeholder='1234 5678 9012 3456'
                    className='w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:px-4 sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600'
                  />
                </div>
                <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
                  <div>
                    <label className='block mb-1 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300'>
                      Expiry Date
                    </label>
                    <input
                      type='text'
                      placeholder='MM/YY'
                      className='w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:px-4 sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600'
                    />
                  </div>
                  <div>
                    <label className='block mb-1 text-xs font-medium text-gray-700 sm:text-sm dark:text-gray-300'>
                      CVV
                    </label>
                    <input
                      type='text'
                      placeholder='123'
                      maxLength={3}
                      className='w-full px-3 py-2 text-sm text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg sm:px-4 sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600'
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className='p-3 border border-blue-200 rounded-lg sm:p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800'>
            <div className='space-y-1.5 sm:space-y-2'>
              <div className='flex justify-between text-xs sm:text-sm'>
                <span className='text-gray-700 dark:text-gray-300'>
                  Selected Bundle:
                </span>
                <span className='font-medium text-gray-900 dark:text-white'>
                  {selectedBundleData?.tokens} Tokens
                </span>
              </div>
              {selectedBundleData?.discount && (
                <div className='flex justify-between text-xs sm:text-sm'>
                  <span className='text-gray-700 dark:text-gray-300'>
                    Discount:
                  </span>
                  <span className='font-medium text-green-600 dark:text-green-400'>
                    {selectedBundleData.discount}
                  </span>
                </div>
              )}
              <div className='border-t border-blue-200 dark:border-blue-800 pt-1.5 sm:pt-2 mt-1.5 sm:mt-2'>
                <div className='flex justify-between'>
                  <span className='text-sm font-semibold text-gray-900 sm:text-base dark:text-white'>
                    Total:
                  </span>
                  <span className='text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
                    ${selectedBundleData?.price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2.5 sm:gap-3 pt-2 border-t border-gray-200 dark:border-gray-700'>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Cancel
            </button>
            <button
              onClick={handlePurchase}
              disabled={isProcessing}
              className='flex-1 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg'
            >
              {isProcessing
                ? 'Processing...'
                : `Pay $${selectedBundleData?.price}`}
            </button>
          </div>

          {/* Security Note */}
          <p className='text-[10px] sm:text-xs text-center text-gray-500 dark:text-gray-400'>
            🔒 Your payment information is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
