import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const pricingPlans = [
  {
    name: '5 Tokens',
    price: '$85',
    originalPrice: '$85',
    tokens: 5,
    savings: null,
    popular: false,
    features: [
      '5 individual lessons',
      'Flexible scheduling',
      'Progress tracking',
      'Valid for 3 months',
      'Lesson reminders',
    ],
  },
  {
    name: '10 Tokens',
    price: '$160',
    originalPrice: '$170',
    tokens: 10,
    savings: '$10',
    popular: true,
    features: [
      '10 individual lessons',
      'Flexible scheduling',
      'Detailed progress reports',
      'Valid for 6 months',
      'Lesson reminders',
    ],
  },
  {
    name: '15 Tokens',
    price: '$230',
    originalPrice: '$255',
    tokens: 15,
    savings: '$25',
    popular: false,
    features: [
      '15 individual lessons',
      'Premium teacher access',
      'Flexible scheduling',
      'Comprehensive feedback',
      'Valid for 9 months',
      'Lesson reminders',
      'Priority support',
    ],
  },
];

const PricingCard = ({ plan }: { plan: (typeof pricingPlans)[0] }) => {
  return (
    <div
      className={`relative bg-card border ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-border'} rounded-2xl p-8 hover:shadow-xl transition-all duration-300`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className='absolute -translate-x-1/2 -top-4 left-1/2'>
          <div className='px-4 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full flex items-center space-x-1'>
            <Sparkles className='w-4 h-4' />
            <span>Most Popular</span>
          </div>
        </div>
      )}

      <div className='mb-8 text-center'>
        <h3 className='mb-2 text-2xl font-bold text-foreground'>{plan.name}</h3>
        <div className='flex items-end justify-center space-x-2'>
          <span className='text-5xl font-bold text-foreground'>
            {plan.price}
          </span>
        </div>
        {plan.savings && (
          <div className='mt-2 text-sm font-medium text-green-500'>
            Save {plan.savings}
          </div>
        )}
        {plan.originalPrice !== plan.price && (
          <div className='text-sm line-through text-muted-foreground'>
            {plan.originalPrice}
          </div>
        )}
        <div className='mt-2 text-sm text-muted-foreground'>
          ${(parseInt(plan.price.replace('$', '')) / plan.tokens).toFixed(2)}{' '}
          per lesson
        </div>
      </div>

      <ul className='mb-8 space-y-4'>
        {plan.features.map((feature, index) => (
          <li key={index} className='flex items-start space-x-3'>
            <div className='flex-shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5'>
              <Check className='w-3 h-3 text-green-500' />
            </div>
            <span className='text-muted-foreground'>{feature}</span>
          </li>
        ))}
      </ul>

      <Link to='/register'>
        <button
          className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
            plan.popular
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:scale-105'
              : 'bg-accent text-foreground hover:bg-accent/80'
          }`}
        >
          Get Started
        </button>
      </Link>
    </div>
  );
};

export const PricingSection = () => {
  return (
    <section id='pricing' className='py-20 sm:py-32'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-16 text-center'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              Pricing
            </span>
          </div>
          <h2 className='mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            Simple, transparent
            <span className='text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text'>
              {' '}
              pricing
            </span>
          </h2>
          <p className='text-lg text-muted-foreground'>
            Choose the plan that fits your learning goals. All plans include
            access to certified teachers and our full platform features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid max-w-6xl gap-8 mx-auto md:grid-cols-2 lg:grid-cols-3'>
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        {/* Additional Info */}
        <div className='mt-16 text-center'>
          <p className='mb-4 text-sm text-muted-foreground'>
            All prices in USD. Tokens never expire during their validity period.
          </p>
          <p className='text-sm text-muted-foreground'>
            Need a custom plan?{' '}
            <a href='#' className='text-blue-500 hover:underline'>
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
