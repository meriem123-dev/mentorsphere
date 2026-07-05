import { InputHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'password';
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ label, error, icon, variant = 'default', className, ...props }, ref) => {
    return (
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={variant}
            className={`w-full px-4 py-3 rounded-2xl border border-input bg-card text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${className}`}
            {...props}
          />
          {icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            className="mt-1 text-sm text-destructive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

TextInput.displayName = 'TextInput';
