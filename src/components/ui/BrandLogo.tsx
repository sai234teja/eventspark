"use client";

import React from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useOrganizationSettings } from "@/lib/react-query/hooks/useOrganizations";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
}

export const BrandLogo = ({ className = "", showText = true }: BrandLogoProps) => {
  const { activeOrganization } = useTenant();
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
      <span className="text-2xl font-bold" style={{ display: "flex", alignItems: "center" }}>
        <span style={{ marginRight: "0.25rem" }}>⚡</span>
        {showText && (
          <>
            <span className="text-black">Event</span>
            <span className="text-[#6C47FF]">Spark</span>
          </>
        )}
      </span>
    </Link>
  );
};
