"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users } from "lucide-react";

interface BrandPreviewProps {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  themePreference?: string;
  logoUrl?: string;
}

export const BrandPreview = ({
  primaryColor,
  secondaryColor,
  accentColor,
  fontFamily,
  borderRadius,
  themePreference,
  logoUrl
}: BrandPreviewProps) => {
  const [styleContent, setStyleContent] = useState("");

  useEffect(() => {
    const hexToHSL = (hex: string) => {
      if (!hex) return "";
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
      const cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin;
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

    let css = `.brand-preview-container {`;
    if (primaryColor) css += `\n  --brand-primary: ${hexToHSL(primaryColor)};\n  --primary: ${hexToHSL(primaryColor)};`;
    if (secondaryColor) css += `\n  --brand-secondary: ${hexToHSL(secondaryColor)};\n  --secondary: ${hexToHSL(secondaryColor)};`;
    if (accentColor) css += `\n  --brand-accent: ${hexToHSL(accentColor)};\n  --accent: ${hexToHSL(accentColor)};`;
    if (fontFamily) css += `\n  --brand-font: "${fontFamily}", sans-serif;\n  font-family: var(--brand-font);`;
    if (borderRadius) css += `\n  --brand-radius: ${borderRadius};\n  --radius: ${borderRadius};`;
    css += `\n}`;
    setStyleContent(css);
  }, [primaryColor, secondaryColor, accentColor, fontFamily, borderRadius]);

  const isDark = themePreference === "dark" || (themePreference === "system" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <div className={`brand-preview-container rounded-lg border overflow-hidden transition-colors ${isDark ? 'bg-slate-950 border-slate-800 text-slate-50' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
      <style dangerouslySetInnerHTML={{ __html: styleContent }} />
      
      {/* Mock Header */}
      <div className={`h-14 border-b flex items-center px-4 justify-between ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="flex items-center space-x-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
          ) : (
            <div className="h-8 w-8 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">
              ES
            </div>
          )}
          <span className="font-semibold">Event Dashboard</span>
        </div>
        <div className="flex space-x-2">
          <div className="h-8 w-24 rounded bg-secondary/50"></div>
          <div className="h-8 w-8 rounded-full bg-secondary/50"></div>
        </div>
      </div>

      {/* Mock Content */}
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-1">Upcoming Events</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Manage and track your organization's events.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tech Conference 2026</CardTitle>
              <CardDescription>Annual developer summit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Oct 15 - Oct 17, 2026
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                1,204 Registered
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Manage Event
              </Button>
            </CardFooter>
          </Card>

          <Card className={`${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Product Launch</CardTitle>
              <CardDescription>Q4 New Feature Announcement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Nov 1, 2026
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" />
                Virtual Event
              </div>
              <div className="flex items-center text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                542 Registered
              </div>
            </CardContent>
            <CardFooter className="space-x-2">
              <Button variant="outline" className="w-full">
                Edit Details
              </Button>
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Manage
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};
