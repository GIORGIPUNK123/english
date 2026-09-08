import { Award, Globe, Heart, Shield } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const values = [
  {
    icon: Award,
    titleKey: 'landing.valueExcellenceTitle',
    descriptionKey: 'landing.valueExcellenceDescription',
  },
  {
    icon: Globe,
    titleKey: 'landing.valueCommunityTitle',
    descriptionKey: 'landing.valueCommunityDescription',
  },
  {
    icon: Heart,
    titleKey: 'landing.valueStudentCenteredTitle',
    descriptionKey: 'landing.valueStudentCenteredDescription',
  },
  {
    icon: Shield,
    titleKey: 'landing.valueTrustTitle',
    descriptionKey: 'landing.valueTrustDescription',
  },
];

export const AboutSection = () => {
  const { t } = useLanguage();

  return (
    <section id='about' className='py-16 sm:py-24 lg:py-32 bg-muted/30'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-12 text-center sm:mb-16'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              {t('landing.aboutBadge')}
            </span>
          </div>
          <h2 className='mb-4 text-2xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            {t('landing.aboutTitlePre')}
            <span className='text-transparent bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text'>
              {' '}
              {t('landing.aboutTitleEmphasis')}
            </span>
          </h2>
        </div>

        {/* Main Content */}
        <div className='grid items-center gap-12 mb-20 lg:grid-cols-2 lg:gap-20'>
          {/* Image */}
          <div className='relative order-2 lg:order-1'>
            <div className='relative overflow-hidden shadow-2xl rounded-2xl'>
              <img
                src='https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop'
                alt='Students studying together'
                className='w-full h-auto'
              />
              <div className='absolute inset-0 bg-linear-to-t from-black/50 to-transparent' />
            </div>

            {/* Floating Stats */}
            <div className='absolute p-6 border shadow-xl -bottom-6 -right-6 bg-card border-border rounded-xl backdrop-blur-sm'>
              <div className='text-center'>
                <div className='mb-1 text-4xl font-bold text-foreground'>
                  10+
                </div>
                <div className='text-sm text-muted-foreground'>
                    {t('landing.aboutYearsExperience')}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='order-1 space-y-6 lg:order-2'>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {t('landing.aboutParagraph1')}
            </p>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {t('landing.aboutParagraph2')}
            </p>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              {t('landing.aboutParagraph3')}
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className='text-center'>
                <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl brand-mark'>
                  <Icon className='w-8 h-8 text-white' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-foreground'>
                  {t(value.titleKey)}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {t(value.descriptionKey)}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
