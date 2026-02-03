import { Award, Globe, Heart, Shield } from 'lucide-react';

const values = [
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We maintain the highest standards in teaching and student support.',
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Connect with students and teachers from around the world.',
  },
  {
    icon: Heart,
    title: 'Student-Centered',
    description:
      'Your learning goals and success are at the heart of everything we do.',
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description:
      'Verified teachers, secure payments, and a safe learning environment.',
  },
];

export const AboutSection = () => {
  return (
    <section id='about' className='py-20 sm:py-32 bg-muted/30'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-16 text-center'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              About Us
            </span>
          </div>
          <h2 className='mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            Your trusted partner in
            <span className='text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text'>
              {' '}
              language learning
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
              <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent' />
            </div>

            {/* Floating Stats */}
            <div className='absolute p-6 border shadow-xl -bottom-6 -right-6 bg-card border-border rounded-xl backdrop-blur-sm'>
              <div className='text-center'>
                <div className='mb-1 text-4xl font-bold text-foreground'>
                  10+
                </div>
                <div className='text-sm text-muted-foreground'>
                  Years Experience
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='order-1 space-y-6 lg:order-2'>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              British World has been revolutionizing online language education
              since 2014. We've helped thousands of students achieve their
              English language goals through personalized instruction and
              innovative technology.
            </p>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              Our platform combines the expertise of certified teachers with
              cutting-edge learning tools to create an engaging, effective, and
              flexible learning experience. Whether you're preparing for exams,
              advancing your career, or simply love learning, we're here to
              support your journey.
            </p>
            <p className='text-lg leading-relaxed text-muted-foreground'>
              With a community of over 10,000 active students and 500+ qualified
              teachers, British World is more than just a learning platform—it's
              a global community dedicated to language excellence.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className='grid gap-8 sm:grid-cols-2 lg:grid-cols-4'>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div key={index} className='text-center'>
                <div className='flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600'>
                  <Icon className='w-8 h-8 text-white' />
                </div>
                <h3 className='mb-2 text-lg font-semibold text-foreground'>
                  {value.title}
                </h3>
                <p className='text-sm text-muted-foreground'>
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
