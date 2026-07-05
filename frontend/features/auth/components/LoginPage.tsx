'use client';

import { LoginHero } from './LoginHero';
import { LoginForm } from './LoginForm';

export function LoginPage() {
  return (
    <div className="flex w-full min-h-screen bg-background">
      <LoginHero />
      <LoginForm />
    </div>
  );
}
