'use client';

interface ContinueButtonProps {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}

export default function ContinueButton({ onClick, disabled, label = 'Continue' }: ContinueButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-auto w-full py-4 rounded-full bg-zadoc-foreground text-white font-medium text-base disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
    >
      {label}
    </button>
  );
}
