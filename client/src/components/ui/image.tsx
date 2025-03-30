import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function Image({ 
  src, 
  alt, 
  className, 
  fallback = "https://via.placeholder.com/150?text=Image", 
  ...props 
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setIsLoading(true);
    setError(false);
  }, [src]);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {isLoading && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
      <img
        src={error ? fallback : imgSrc}
        alt={alt}
        className={cn("w-full h-full object-cover", className)}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setError(true);
          setIsLoading(false);
        }}
        {...props}
      />
    </div>
  );
}
