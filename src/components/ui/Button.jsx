import React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import Icon from '../AppIcon';

const buttonVariants = cva(
    "inline-flex items-center justify-center whitespace-nowrap rounded-none text-sm font-bold border-2 border-black transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-[#FFD60A] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                destructive: "bg-[#FF6B6B] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                outline: "bg-white text-black border-2 border-black shadow-[4px_4px_0px_#000] hover:bg-[#FFD60A] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                secondary: "bg-[#F5F5F0] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                ghost: "border-transparent shadow-none hover:bg-[#FFD60A] hover:border-black hover:shadow-[2px_2px_0px_#000]",
                link: "border-transparent shadow-none text-black underline-offset-4 hover:underline",
                success: "bg-[#00C9B1] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                warning: "bg-[#FFD60A] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
                danger: "bg-[#FF6B6B] text-black shadow-[4px_4px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_#000]",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 px-3",
                lg: "h-11 px-8",
                icon: "h-10 w-10",
                xs: "h-8 px-2 text-xs",
                xl: "h-12 px-10 text-base",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

const Button = React.forwardRef(({
    className,
    variant,
    size,
    asChild = false,
    children,
    loading = false,
    iconName = null,
    iconPosition = 'left',
    iconSize = null,
    fullWidth = false,
    disabled = false,
    ...props
}, ref) => {
    const Comp = asChild ? Slot : "button";

    // Icon size mapping based on button size
    const iconSizeMap = {
        xs: 12,
        sm: 14,
        default: 16,
        lg: 18,
        xl: 20,
        icon: 16,
    };

    const calculatedIconSize = iconSize || iconSizeMap?.[size] || 16;

    // Loading spinner
    const LoadingSpinner = () => (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
    );

    const renderIcon = () => {
        if (!iconName) return null;
        try {
            return (
                <Icon
                    name={iconName}
                    size={calculatedIconSize}
                    className={cn(
                        children && iconPosition === 'left' && "mr-2",
                        children && iconPosition === 'right' && "ml-2"
                    )}
                />
            );
        } catch {
            return null;
        }
    };

    const renderFallbackButton = () => (
        <button
            className={cn(
                buttonVariants({ variant, size, className }),
                fullWidth && "w-full"
            )}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {iconName && iconPosition === 'left' && renderIcon()}
            {children}
            {iconName && iconPosition === 'right' && renderIcon()}
        </button>
    );

    // When asChild is true, merge icons into the child element
    if (asChild) {
        try {
            if (!children || React.Children?.count(children) !== 1) {
                return renderFallbackButton();
            }

            const child = React.Children?.only(children);

            if (!React.isValidElement(child)) {
                return renderFallbackButton();
            }
            const content = (
                <>
                    {loading && <LoadingSpinner />}
                    {iconName && iconPosition === 'left' && renderIcon()}
                    {child?.props?.children}
                    {iconName && iconPosition === 'right' && renderIcon()}
                </>
            );

            const clonedChild = React.cloneElement(child, {
                className: cn(
                    buttonVariants({ variant, size, className }),
                    fullWidth && "w-full",
                    child?.props?.className
                ),
                disabled: disabled || loading || child?.props?.disabled,
                children: content,
            });

            return <Comp ref={ref} {...props}>{clonedChild}</Comp>;
        } catch {
            return renderFallbackButton();
        }
    }

    return (
        <Comp
            className={cn(
                buttonVariants({ variant, size, className }),
                fullWidth && "w-full"
            )}
            ref={ref}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <LoadingSpinner />}
            {iconName && iconPosition === 'left' && renderIcon()}
            {children}
            {iconName && iconPosition === 'right' && renderIcon()}
        </Comp>
    );
});

Button.displayName = "Button";
export default Button;