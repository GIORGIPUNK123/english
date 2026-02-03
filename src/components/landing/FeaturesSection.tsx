import {
  Calendar,
  Users,
  BookOpen,
  TrendingUp,
  Video,
  Clock,
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Easy Scheduling',
    description:
      'Book 1-on-1 lessons or group classes with just a few clicks. Our smart calendar system makes scheduling effortless.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Group Classes',
    description:
      'Join small group classes (4 students max) for collaborative learning experiences and peer interaction.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: BookOpen,
    title: 'CEFR-Aligned Courses',
    description:
      'Structured courses from A1 to C2 levels, perfectly aligned with international language standards.',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description:
      'Monitor your improvement with detailed feedback, lesson history, and skill assessments.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: Video,
    title: 'Live Video Lessons',
    description:
      'High-quality video conferencing built-in. Learn face-to-face with teachers from anywhere.',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Clock,
    title: 'Flexible Schedule',
    description:
      'Learn at your own pace with 24/7 availability. Choose times that work best for your lifestyle.',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

const FeatureCard = ({ feature }: { feature: (typeof features)[0] }) => {
  const Icon = feature.icon;

  return (
    <div className='relative p-8 transition-all duration-300 border group bg-card border-border rounded-2xl hover:shadow-xl hover:-translate-y-1'>
      {/* Gradient Background on Hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
      />

      <div className='relative'>
        {/* Icon */}
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className='text-white w-7 h-7' />
        </div>

        {/* Content */}
        <h3 className='mb-3 text-xl font-semibold text-foreground'>
          {feature.title}
        </h3>
        <p className='leading-relaxed text-muted-foreground'>
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export const FeaturesSection = () => {
  return (
    <section id='features' className='py-20 sm:py-32 bg-muted/30'>
      <div className='px-4 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        {/* Section Header */}
        <div className='max-w-3xl mx-auto mb-16 text-center'>
          <div className='inline-flex items-center px-4 py-2 mb-6 space-x-2 rounded-full bg-accent'>
            <span className='text-sm font-medium text-muted-foreground'>
              Features
            </span>
          </div>
          <h2 className='mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl text-foreground'>
            Everything you need to
            <span className='text-transparent bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text'>
              {' '}
              master English
            </span>
          </h2>
          <p className='text-lg text-muted-foreground'>
            Our platform combines cutting-edge technology with proven teaching
            methods to deliver an unmatched learning experience.
          </p>
        </div>

        {/* Features Grid */}
        <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* CTA */}
        <div className='mt-16 text-center'>
          <p className='mb-6 text-muted-foreground'>
            Ready to start your learning journey?
          </p>
          <a href='#pricing'>
            <button className='px-8 py-4 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-xl hover:scale-105'>
              View Pricing Plans
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};
