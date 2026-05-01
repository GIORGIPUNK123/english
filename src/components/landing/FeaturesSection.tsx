import {
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Video,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const features = [
  {
    icon: Calendar,
    titleKey: 'landing.featureEasySchedulingTitle',
    descriptionKey: 'landing.featureEasySchedulingDescription',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    titleKey: 'landing.featureGroupClassesTitle',
    descriptionKey: 'landing.featureGroupClassesDescription',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    titleKey: 'landing.featureCefrTitle',
    descriptionKey: 'landing.featureCefrDescription',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    titleKey: 'landing.featureProgressTitle',
    descriptionKey: 'landing.featureProgressDescription',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Video,
    titleKey: 'landing.featureVideoTitle',
    descriptionKey: 'landing.featureVideoDescription',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Clock,
    titleKey: 'landing.featureFlexibleTitle',
    descriptionKey: 'landing.featureFlexibleDescription',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const FeatureCard = ({
  feature,
  t,
}: {
  feature: (typeof features)[0];
  t: (key: string) => string;
}) => {
  const Icon = feature.icon;

  return (
    <div className='relative p-8 transition-all duration-300 border group bg-card border-border rounded-2xl hover:shadow-xl hover:-translate-y-1'>
      {/* Gradient Background on Hover */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
      />

      <div className='relative'>
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl bg-linear-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className='text-white w-7 h-7' />
        </div>

        {/* Content */}
        <h3 className='mb-3 text-xl font-semibold text-foreground'>
          {t(feature.titleKey)}
        </h3>
        <p className='leading-relaxed text-muted-foreground'>
          {t(feature.descriptionKey)}
        </p>
      </div>
    </div>
  );
};

export const FeaturesSection = () => {
  const { t } = useLanguage();

  return (
    <section id='features' className='py-20 sm:py-32 bg-muted/30'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-16 text-center'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              {t('landing.featuresBadge')}
            </span>
          </div>
          <h2 className='mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            {t('landing.featuresTitlePre')}
            <span className='text-transparent bg-linear-to-r from-blue-500 to-purple-600 bg-clip-text'>
              {' '}
              {t('landing.featuresTitleEmphasis')}
            </span>
          </h2>
          <p className='text-lg text-muted-foreground'>
            {t('landing.featuresSubtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} t={t} />
          ))}
        </div>

        {/* CTA */}
        <div className='mt-16 text-center'>
          <p className='mb-6 text-muted-foreground'>
            {t('landing.featuresCta')}
          </p>
          <a href='#pricing'>
            <button className='px-8 py-4 text-white transition-all duration-300 rounded-lg bg-linear-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:scale-105'>
              {t('landing.featuresViewPricing')}
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};
