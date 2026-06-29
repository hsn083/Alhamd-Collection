'use client';

import * as React from 'react';
import * as FormPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

const FormField = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('space-y-2', className)} {...props} />
);
FormField.displayName = 'FormField';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof FormPrimitive.Root>
>(({ className, ...props }, ref) => (
  <FormPrimitive.Root
    ref={ref}
    className={cn(
      'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-emerald-400',
      className
    )}
    {...props}
  />
));
FormLabel.displayName = 'FormLabel';

const FormMessage = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm font-medium text-red-400 mt-1', className)}
    {...props}
  >
    {children}
  </p>
);
FormMessage.displayName = 'FormMessage';

const FormDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
);
FormDescription.displayName = 'FormDescription';

const FormHint = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn('text-xs text-emerald-400/70 mt-1', className)}
    {...props}
  >
    {children}
  </p>
);
FormHint.displayName = 'FormHint';

export {
  FormField,
  FormLabel,
  FormMessage,
  FormDescription,
  FormHint,
};
