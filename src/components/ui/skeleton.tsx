import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: string;
}

export default function Skeleton({
  className = "",
  rounded = "rounded-md",
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={`
        skeleton-shimmer
        relative overflow-hidden
        bg-[#E7EAF0]
        dark:bg-[#1A1A1A]
        ${rounded}
        ${className}
      `}
      {...props}
    />
  );
}