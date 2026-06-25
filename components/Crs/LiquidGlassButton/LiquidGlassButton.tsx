import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import clsx from "clsx";

import "./LiquidGlassButton.css";

type LiquidGlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  loading?: boolean;
};

export default function LiquidGlassButton({
  icon,
  loading = false,
  disabled,
  children,
  className = "",
  type = "button",
  ...rest
}: LiquidGlassButtonProps) {
  return (
    <button
      type={type}
      className={clsx("liquid-glass-btn", className)}
      disabled={disabled || loading}
      data-loading={loading || undefined}
      {...rest}
    >
      <span className="liquid-glass-btn__content">
        {loading ? (
          <LoadingOutlined className="liquid-glass-btn__icon" spin />
        ) : icon ? (
          <span className="liquid-glass-btn__icon">{icon}</span>
        ) : null}
        <span>{children}</span>
      </span>
    </button>
  );
}
