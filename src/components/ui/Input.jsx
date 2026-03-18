import React from "react";
import { cn } from "../../utils/cn";

const Input = React.forwardRef(({
    className,
    type = "text",
    label,
    description,
    error,
    required = false,
    id,
    ...props
}, ref) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${Math.random()?.toString(36)?.substr(2, 9)}`;

    // Base input classes
    const baseInputClasses = "flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:shadow-[3px_3px_0px_#FFD60A] disabled:cursor-not-allowed disabled:opacity-50";

    // Checkbox-specific styles
    if (type === "checkbox") {
        return (
            <input
                type="checkbox"
                className={cn(
                    "h-4 w-4 rounded-none border-2 border-black bg-white accent-[#FFD60A] disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    // Radio button-specific styles
    if (type === "radio") {
        return (
            <input
                type="radio"
                className={cn(
                    "h-4 w-4 rounded-full border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />
        );
    }

    // For regular inputs with wrapper structure
    return (
        <div className="space-y-2">
            {label && (
                <label
                    htmlFor={inputId}
                    className={cn(
                        "text-sm font-bold leading-none",
                        error ? "text-[#FF6B6B]" : "text-black"
                    )}
                >
                    {label}
                    {required && <span className="text-destructive ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                className={cn(
                    baseInputClasses,
                    error && "border-[#FF6B6B]",
                    className
                )}
                ref={ref}
                id={inputId}
                {...props}
            />

            {description && !error && (
                <p className="text-sm text-gray-500">
                    {description}
                </p>
            )}

            {error && (
                <p className="text-sm text-[#FF6B6B] font-medium">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = "Input";

export default Input;