import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t bg-card border-border'>
      <div className='px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-8 mb-8 md:grid-cols-2 lg:grid-cols-4'>
          {/* Company */}
          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Company</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Press
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Resources</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Teachers
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Legal</h3>
            <ul className='space-y-3'>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Cookie Policy
                </a>
              </li>
              <li>
                <a
                  href='#'
                  className='transition-colors text-muted-foreground hover:text-foreground'
                >
                  Licensing
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className='mb-4 font-semibold text-foreground'>Stay Updated</h3>
            <p className='mb-4 text-sm text-muted-foreground'>
              Subscribe to our newsletter for learning tips and updates.
            </p>
            <div className='flex space-x-2'>
              <input
                type='email'
                placeholder='Enter your email'
                className='flex-1 px-4 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button className='px-4 py-2 text-white transition-all duration-300 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:shadow-lg'>
                <Mail className='w-5 h-5' />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className='pt-8 border-t border-border'>
          <div className='flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0'>
            {/* Logo & Copyright */}
            <div className='flex items-center space-x-4'>
              <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600'>
                <span className='text-lg font-bold text-white'>BW</span>
              </div>
              <p className='text-sm text-muted-foreground'>
                © {currentYear} British World. All rights reserved.
              </p>
            </div>

            {/* Social Links */}
            <div className='flex items-center space-x-4'>
              <a
                href='#'
                className='flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-accent hover:bg-accent/80'
              >
                <Facebook className='w-5 h-5 text-foreground' />
              </a>
              <a
                href='#'
                className='flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-accent hover:bg-accent/80'
              >
                <Twitter className='w-5 h-5 text-foreground' />
              </a>
              <a
                href='#'
                className='flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-accent hover:bg-accent/80'
              >
                <Instagram className='w-5 h-5 text-foreground' />
              </a>
              <a
                href='#'
                className='flex items-center justify-center w-10 h-10 transition-colors rounded-lg bg-accent hover:bg-accent/80'
              >
                <Linkedin className='w-5 h-5 text-foreground' />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
