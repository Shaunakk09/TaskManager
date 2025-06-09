import { forwardRef } from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div>
        <label htmlFor={props.id} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="mt-1">
          <input
            ref={ref}
            {...props}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              error ? 'border-red-500' : ''
            } ${className}`}
          />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput; 