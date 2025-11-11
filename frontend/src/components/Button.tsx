import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export default function Button({ label, ...rest }: ButtonProps) {
  return (
    <button data-testid="btn" {...rest}>
      {label}
    </button>
  );
}
