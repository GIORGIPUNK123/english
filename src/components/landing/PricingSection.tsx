import { Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TOKEN_BUNDLES_BY_TYPE } from '../../utils/tokenUtils';
import { useLanguage } from '../../context/LanguageContext';

type PricingPlan = {
  name: string;
  price: number;
  originalPrice: number;
  tokens: number;
  savings: number | null;
  popular: boolean;
  featureKeys: string[];
};

const featureByTokens: Record<number, string[]> = {
  4: [
    'pricing.features.fourLessons',
    'pricing.features.flexibleScheduling',
    'pricing.features.progressTracking',
    'pricing.features.balancedWeeklyPace',
    'pricing.features.lessonReminders',
  ],
  8: [
    'pricing.features.eightLessons',
    'pricing.features.discountedTier',
    'pricing.features.flexibleScheduling',
    'pricing.features.detailedProgressReports',
    'pricing.features.lessonReminders',
  ],
  16: [
    'pricing.features.sixteenLessons',
    'pricing.features.mostPopularTier',
    'pricing.features.discountedTier',
    'pricing.features.flexibleScheduling',
    'pricing.features.comprehensiveFeedback',
    'pricing.features.prioritySupport',
  ],
  32: [
    'pricing.features.thirtyTwoLessons',
    'pricing.features.discountedTier',
    'pricing.features.intensiveSchedule',
    'pricing.features.comprehensiveFeedback',
    'pricing.features.prioritySupport',
  ],
};

const pricingPlans: PricingPlan[] = TOKEN_BUNDLES_BY_TYPE.group
  .filter((bundle) => !bundle.isCustom)
  .map((bundle) => {
    const originalPrice = bundle.originalPrice ?? bundle.price;
    const savings =
      originalPrice > bundle.price
        ? Math.round((originalPrice - bundle.price) * 100) / 100
        : null;

    return {
      name: `${bundle.tokens} Tokens`,
      price: bundle.price,
      originalPrice,
      tokens: bundle.tokens,
      savings,
      popular: Boolean(bundle.popular),
      featureKeys:
        featureByTokens[bundle.tokens] ??
        [`pricing.features.${bundle.tokens}Lessons`, 'pricing.features.flexibleScheduling'],
    };
  });

const formatEur = (amount: number) => `EUR ${amount.toFixed(2)}`;

const PricingCard = ({ plan }: { plan: PricingPlan }) => {
  const { t } = useLanguage();

  return (
    <div
      className={`relative bg-card border ${plan.popular ? 'border-brand shadow-xl scale-105' : 'border-border'} rounded-2xl p-8 hover:shadow-xl transition-all duration-300`}
    >
      {/* Popular Badge */}
      {plan.popular && (
        <div className='absolute -translate-x-1/2 -top-4 left-1/2'>
          <div className='px-4 py-1.5 bg-brand text-brand-foreground text-sm font-semibold rounded-full flex items-center space-x-1'>
            <Sparkles className='w-4 h-4' />
            <span>{t('pricing.mostPopular')}</span>
          </div>
        </div>
      )}

      <div className='mb-8 text-center'>
        <h3 className='mb-2 text-2xl font-bold text-foreground'>{plan.name}</h3>
        <div className='flex items-end justify-center space-x-2'>
          <span className='text-5xl font-bold text-foreground'>
            {formatEur(plan.price)}
          </span>
        </div>
        {plan.savings && (
          <div className='mt-2 text-sm font-medium text-green-500'>
            {t('pricing.save')} {formatEur(plan.savings)}
          </div>
        )}
        {plan.originalPrice !== plan.price && (
          <div className='text-sm line-through text-muted-foreground'>
            {formatEur(plan.originalPrice)}
          </div>
        )}
        <div className='mt-2 text-sm text-muted-foreground'>
          {formatEur(plan.price / plan.tokens)} {t('pricing.perLesson')}
        </div>
      </div>

      <ul className='mb-8 space-y-4'>
        {plan.featureKeys.map((feature, index) => (
          <li key={index} className='flex items-start space-x-3'>
            <div className='shrink-0 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5'>
              <Check className='w-3 h-3 text-green-500' />
            </div>
            <span className='text-muted-foreground'>{t(feature)}</span>
          </li>
        ))}
      </ul>

      <Link to='/register'>
        <button
          className={`w-full py-3.5 rounded-lg font-semibold transition-all duration-300 ${
            plan.popular
              ? 'btn-primary'
              : 'bg-accent text-foreground hover:bg-accent/80'
          }`}
        >
          {t('pricing.getStarted')}
        </button>
      </Link>
    </div>
  );
};

export const PricingSection = () => {
  const { t } = useLanguage();

  return (
    <section id='pricing' className='py-16 sm:py-24 lg:py-32'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-12 text-center sm:mb-16'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              {t('landing.pricingBadge')}
            </span>
          </div>
          <h2 className='mb-4 text-2xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            {t('landing.pricingTitlePre')}
            <span className='text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text'>
              {' '}
              {t('landing.pricingTitleEmphasis')}
            </span>
          </h2>
          <p className='text-base sm:text-lg text-muted-foreground'>
            {t('landing.pricingSubtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className='grid max-w-6xl gap-8 mx-auto md:grid-cols-2 xl:grid-cols-4'>
          {pricingPlans.map((plan, index) => (
            <PricingCard key={index} plan={plan} />
          ))}
        </div>

        {/* Additional Info */}
        <div className='mt-16 text-center'>
          <p className='mb-4 text-sm text-muted-foreground'>
            {t('pricing.alignedNote')}
          </p>
          <p className='text-sm text-muted-foreground'>
            {t('pricing.needCustomPlan')} {' '}
            <a href='#' className='text-blue-500 hover:underline'>
              {t('pricing.contactUs')}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
