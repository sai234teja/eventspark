"use client";

import React, { useEffect, useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useOrganizationSettings } from "@/lib/react-query/hooks/useOrganizations";

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { activeOrganization } = useTenant();
  const { data: settings } = useOrganizationSettings(activeOrganization?.id);

  useEffect(() => {
    const root = document.documentElement;

    if (settings) {
      // Helper to convert hex to HSL variables if needed, or we can just inject hex directly
      // if tailwind isn't strict, but since our tailwind config expects `hsl(var(--primary))`,
      // we need to convert hex to HSL, or just redefine the variable.
      
      const hexToHSL = (hex: string) => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
          r = parseInt(hex[1] + hex[1], 16);
          g = parseInt(hex[2] + hex[2], 16);
          b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
          r = parseInt(hex.substring(1, 3), 16);
          g = parseInt(hex.substring(3, 5), 16);
          b = parseInt(hex.substring(5, 7), 16);
        }
        
        r /= 255;
        g /= 255;
        b /= 255;
        
        const cmin = Math.min(r,g,b),
              cmax = Math.max(r,g,b),
              delta = cmax - cmin;
        
        let h = 0, s = 0, l = 0;
        
        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
        
        h = Math.round(h * 60);
        if (h < 0) h += 360;
        
        l = (cmax + cmin) / 2;
        s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
        
        s = +(s * 100).toFixed(1);
        l = +(l * 100).toFixed(1);
        
        return `${h} ${s}% ${l}%`;
      };

      // Set colors
      if (settings.primary_color) {
        root.style.setProperty('--brand-primary', hexToHSL(settings.primary_color));
      } else {
        root.style.removeProperty('--brand-primary');
      }

      if (settings.secondary_color) {
        root.style.setProperty('--brand-secondary', hexToHSL(settings.secondary_color));
      } else {
        root.style.removeProperty('--brand-secondary');
      }

      if (settings.accent_color) {
        root.style.setProperty('--brand-accent', hexToHSL(settings.accent_color));
      } else {
        root.style.removeProperty('--brand-accent');
      }

      // Set font and radius
      if (settings.font_family) {
        root.style.setProperty('--brand-font', `"${settings.font_family}", sans-serif`);
      } else {
        root.style.removeProperty('--brand-font');
      }

      if (settings.border_radius) {
        root.style.setProperty('--brand-radius', settings.border_radius);
      } else {
        root.style.removeProperty('--brand-radius');
      }

      // Theme Preference (Light/Dark/System)
      if (settings.theme_preference === 'dark') {
        root.classList.add('dark');
      } else if (settings.theme_preference === 'light') {
        root.classList.remove('dark');
      } else {
        // System
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }

      // Update favicon
      if (settings.favicon_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.favicon_url;
      }
    } else {
      // Default to nothing / remove customized properties
      root.style.removeProperty('--brand-primary');
      root.style.removeProperty('--brand-secondary');
      root.style.removeProperty('--brand-accent');
      root.style.removeProperty('--brand-font');
      root.style.removeProperty('--brand-radius');
    }
  }, [settings]);

  return <>{children}</>;
};
