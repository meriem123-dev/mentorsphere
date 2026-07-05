'use client';

import { RegistrationForm } from "./RegistrationForm";
import {LoginHero} from "./LoginHero";

export function RegisterPage() {
  return (
    <div className="flex w-full min-h-screen bg-background">
        <LoginHero />
       <RegistrationForm />
    </div>
  );
}
