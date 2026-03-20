import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Define input size variants
const inputVariants = cva(
  `file:inline-flex flex bg-input/30 [&[readonly]]:bg-muted/80 selection:bg-primary dark:bg-input/30 file:bg-transparent disabled:opacity-60 shadow-black/5 shadow-xs file:p-0 px-3 py-1 [&[type=file]]:py-0 border border-input aria-invalid:border-destructive/60 dark:aria-invalid:border-destructive file:border-0 file:border-e file:border-input focus-visible:border-ring file:border-solid rounded-md outline-none focus-visible:outline-none aria-invalid:ring-destructive/20 focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:aria-invalid:ring-destructive/40 w-full min-w-0 h-9 file:h-full file:font-medium text-foreground selection:text-primary-foreground placeholder:text-muted-foreground/80 "file:text-foreground file:text-foreground md:text-sm file:text-sm text-base file:not-italic transition-[color,box-shadow] [&[readonly]]:cursor-not-allowed disabled:cursor-not-allowed disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        lg: "h-10 px-4 text-sm rounded-md file:pe-4 file:me-4",
        md: "h-9 px-3 text-[0.8125rem] leading-(--text-sm--line-height) rounded-md file:pe-3 file:me-3",
        sm: "h-7 px-2.5 text-xs rounded-md file:pe-2.5 file:me-2.5",
      },
    },
    defaultVariants: {
      variant: "md",
    },
  },
);

const inputAddonVariants = cva(
  "flex justify-center items-center bg-input dark:bg-secondary shadow-[rgba(0,0,0,0.05)] shadow-xs border border-input text-secondary-foreground [&_svg]:text-secondary-foreground/60 shrink-0",
  {
    variants: {
      variant: {
        sm: "rounded-md h-7 min-w-7 text-xs px-2.5 [&_svg:not([class*=size-])]:size-3.5",
        md: "rounded-md h-9 min-w-9 px-3 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4.5",
        lg: "rounded-md h-10 min-w-10 px-4 text-sm [&_svg:not([class*=size-])]:size-4.5",
      },
      mode: {
        default: "",
        icon: "px-0 justify-center",
      },
    },
    defaultVariants: {
      variant: "md",
      mode: "default",
    },
  },
);

const inputGroupVariants = cva(
  `
    flex items-stretch
    [&_[data-slot=input]]:grow
    [&_[data-slot=input-addon]:has(+[data-slot=input])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=input])]:border-e-0
    [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:rounded-e-none [&_[data-slot=input-addon]:has(+[data-slot=datefield])]:border-e-0 
    [&_[data-slot=input]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=input]+[data-slot=input-addon]]:border-s-0
    [&_[data-slot=input-addon]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]+[data-slot=button]]:rounded-s-none
    [&_[data-slot=button]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=input]]:rounded-s-none
    [&_[data-slot=input-addon]+[data-slot=datefield]]:[&_[data-slot=input]]:rounded-s-none
    [&_[data-slot=datefield]:has(+[data-slot=input-addon])]:[&_[data-slot=input]]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=button])]:rounded-e-none
    [&_[data-slot=input]:has(+[data-slot=input-addon])]:rounded-e-none
    [&_[data-slot=datefield]]:grow
    [&_[data-slot=datefield]+[data-slot=input-addon]]:rounded-s-none [&_[data-slot=datefield]+[data-slot=input-addon]]:border-s-0
  `,
  {
    variants: {},
    defaultVariants: {},
  },
);

const inputWrapperVariants = cva(
  `flex [&_[data-slot=input]]:flex items-center gap-1.5 [&_[data-slot=input]]:bg-transparent [&_[data-slot=input]]:disabled:opacity-50 [&_[data-slot=input]]:shadow-none [&_[data-slot=input]]:p-0 [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:data-focus-within:border-0 has-[[aria-invalid=true]]:border-destructive/60 dark:has-[[aria-invalid=true]]:border-destructive has-[:focus-visible]:border-ring [&_[data-slot=input]]:outline-none has-[:focus-visible]:outline-none [&_[data-slot=input]]:data-focus-within:ring-0 [&_[data-slot=input]]:data-focus-within:ring-transparent [&_[data-slot=input]]:focus-visible:ring-0 has-[[aria-invalid=true]]:ring-destructive/10 has-[:focus-visible]:ring-[3px] has-[:focus-visible]:ring-ring/30 dark:has-[[aria-invalid=true]]:ring-destructive/20 [&_[data-slot=input]]:w-full [&_[data-slot=input]]:h-auto [&_[data-slot=input]]:placeholder:text-muted-foreground [&_[data-slot=input]]:text-foreground [&_svg]:text-muted-foreground [&_[data-slot=input]]:transition-colors [&_[data-slot=input]]:disabled:cursor-not-allowed [&_[data-slot=datefield]]:grow [&_svg]:shrink-0`,
  {
    variants: {
      variant: {
        sm: "gap-1.25 [&_svg:not([class*=size-])]:size-3.5",
        md: "gap-1.5 [&_svg:not([class*=size-])]:size-4",
        lg: "gap-1.5 [&_svg:not([class*=size-])]:size-4",
      },
    },
    defaultVariants: {
      variant: "md",
    },
  },
);

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      data-slot="input"
      type={type}
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}

function InputAddon({
  className,
  variant,
  mode,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputAddonVariants>) {
  return (
    <div
      data-slot="input-addon"
      className={cn(inputAddonVariants({ variant, mode }), className)}
      {...props}
    />
  );
}

function InputGroup({
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot="input-group"
      className={cn(inputGroupVariants(), className)}
      {...props}
    />
  );
}

function InputWrapper({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputWrapperVariants>) {
  return (
    <div
      data-slot="input-wrapper"
      className={cn(
        inputVariants({ variant }),
        inputWrapperVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
}

export {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
  inputAddonVariants,
  inputVariants,
};
