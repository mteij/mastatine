"use client";

import type { ButtonHTMLAttributes } from "react";

interface ConfirmButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  message: string;
}

/** Submit button that asks for confirmation before the surrounding form is sent. */
export default function ConfirmButton({ message, onClick, children, ...rest }: ConfirmButtonProps) {
  return (
    <button
      type="submit"
      {...rest}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}
