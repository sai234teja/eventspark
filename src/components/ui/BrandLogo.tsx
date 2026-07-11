"use client";

import React from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useOrganizationSettings } from "@/lib/react-query/hooks/useOrganizations";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export const BrandLogo = ({ className = "", showText = true }: BrandLogoProps) => {
  const { activeOrganization } = useTenant();
  // Safe to call even if activeOrganization is null
  const { data: settings } = useOrganizationSettings(activeOrganization?.id);

  if (settings?.logo_url) {
    return (
      <Link href="/dashboard" className={`flex items-center space-x-2 ${className}`}>
        <img 
          src={settings.logo_url} 
          alt={activeOrganization?.name || "Organization Logo"} 
          className="h-8 object-contain" 
        />
      </Link>
    );
  }

  return (
    <Link href="/" className={`flex items-center space-x-2 ${className}`}>
      <Sparkles className="h-8 w-8 text-purple-300 shrink-0" />
      {showText && <span className="text-2xl font-bold text-white">EventSpark</span>}
    </Link>
  );
};
