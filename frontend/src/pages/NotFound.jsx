import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card variant="surface" className="max-w-md w-full p-8 sm:p-10 text-center space-y-5 border border-border-warm shadow-lg">
        <span className="font-heading font-black text-6xl sm:text-7xl text-accent tracking-tighter">
          404
        </span>
        <h2 className="font-heading font-extrabold text-2xl text-text-main">
          Page Not Found
        </h2>
        <p className="text-text-muted text-sm leading-relaxed">
          The page or module you are looking for does not exist or has been relocated within the learning portal.
        </p>
        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" icon={<Home className="w-4 h-4" />}>
              Return to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
