/**
 * Reusable Checkbox component
 */

import { useId, type InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export function Checkbox({
  label,
  description,
  className = '',
  id,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;
  
  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-6">
        <input
          type="checkbox"
          id={checkboxId}
          className="
            w-5 h-5
            rounded
            border-gray-600
            bg-gray-700
            text-green-500
            focus:ring-2 focus:ring-green-500 focus:ring-offset-0
            cursor-pointer
            transition-colors duration-150
          "
          {...props}
        />
      </div>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              htmlFor={checkboxId}
              className={`
                text-sm font-medium cursor-pointer
                ${props.checked ? 'text-gray-500 line-through' : 'text-gray-200'}
                transition-colors duration-150
              `}
            >
              {label}
            </label>
          )}
          {description && (
            <span className="text-xs text-gray-500 mt-0.5">
              {description}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
