"use client";

import type { VariantProps } from "class-variance-authority";
import { Eye, EyeOff } from "lucide-react";
import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  Input,
  InputAddon,
  InputGroup,
  InputWrapper,
  type inputVariants,
} from "../app-ui/customInput";
import { Label } from "../ui/label";

export const InputField = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconClick,
  onLeftIconClick,
  fieldDescription,
  error,
  type = "text",
  labelClassName,
  containerClassName,
  errorClassName,
  fieldDescriptionClassName,
  inputWrapperClassName,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    label?: string | ReactNode;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fieldDescription?: string | ReactNode;
    error?: string;
    onRightIconClick?: () => void;
    onLeftIconClick?: () => void;
    containerClassName?: string;
    labelClassName?: string;
    fieldDescriptionClassName?: string;
    errorClassName?: string;
    inputWrapperClassName?: string;
  }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {typeof label === "string" ? (
        <Label className={cn("text-sm font-medium", labelClassName)}>
          {label}
        </Label>
      ) : (
        label || null
      )}
      <InputWrapper className={inputWrapperClassName}>
        {leftIcon && <div onClick={onLeftIconClick}>{leftIcon}</div>}
        <Input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          {...props}
        />
        {type === "password" ? (
          <div onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff /> : <Eye />}
          </div>
        ) : (
          rightIcon && <div onClick={onRightIconClick}>{rightIcon}</div>
        )}
      </InputWrapper>
      {error && (
        <p className={cn("text-xs text-red-500", errorClassName)}>{error}</p>
      )}
      {fieldDescription && (
        <p
          className={cn(
            "text-muted-foreground text-xs italic",
            fieldDescriptionClassName,
          )}
        >
          {fieldDescription}
        </p>
      )}
    </div>
  );
};

export const AddOnInput = ({
  label,
  leftIcon,
  rightIcon,
  onRightIconClick,
  onLeftIconClick,
  fieldDescription,
  error,
  type = "text",
  labelClassName,
  containerClassName,
  errorClassName,
  fieldDescriptionClassName,
  inputWrapperClassName,
  ...props
}: React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants> & {
    label?: string | ReactNode;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fieldDescription?: string | ReactNode;
    error?: string;
    onRightIconClick?: () => void;
    onLeftIconClick?: () => void;
    containerClassName?: string;
    labelClassName?: string;
    fieldDescriptionClassName?: string;
    errorClassName?: string;
    inputWrapperClassName?: string;
  }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("flex flex-col gap-2", containerClassName)}>
      {typeof label === "string" ? (
        <Label className={cn("text-sm font-medium", labelClassName)}>
          {label}
        </Label>
      ) : (
        label || null
      )}
      <InputGroup className={inputWrapperClassName}>
        {leftIcon && (
          <InputAddon
            mode={typeof leftIcon === "string" ? "default" : "icon"}
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </InputAddon>
        )}
        <Input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          {...props}
        />
        {type === "password" ? (
          <InputAddon
            mode={"icon"}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </InputAddon>
        ) : (
          rightIcon && (
            <InputAddon
              mode={typeof rightIcon === "string" ? "default" : "icon"}
              onClick={onRightIconClick}
            >
              {rightIcon}
            </InputAddon>
          )
        )}
      </InputGroup>
      {error && (
        <p className={cn("text-xs text-red-500", errorClassName)}>{error}</p>
      )}
      {fieldDescription && (
        <p
          className={cn(
            "text-muted-foreground text-xs italic",
            fieldDescriptionClassName,
          )}
        >
          {fieldDescription}
        </p>
      )}
    </div>
  );
};
