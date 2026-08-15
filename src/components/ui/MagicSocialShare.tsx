'use client';

import React, { useState } from 'react';
import { Share2, Facebook, Twitter, Linkedin, Mail, Copy, Check } from 'lucide-react';
import './MagicSocialShare.css';
import { useToast } from '@/hooks/use-toast';

interface MagicSocialShareProps {
  url: string;
  title: string;
  description: string;
}

export function MagicSocialShare({ url, title, description }: MagicSocialShareProps) {
  const [active, setActive] = useState(false);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url.startsWith('/') ? url : '/' + url}` : url;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${fullUrl}`)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + fullUrl)}`,
  };

  return (
    <div className="flex items-center justify-center w-full py-8">
      <div className={`magic-menu ${active ? 'active' : ''}`}>
        <div className="magic-toggle" onClick={() => setActive(!active)}>
          <Share2 className="w-6 h-6" />
        </div>
        
        {/* We map the icons around the circle. Total 8 spots. */}
        <li style={{ '--i': 0, '--clr': '#1877f2' } as React.CSSProperties}>
          <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer"><Facebook /></a>
        </li>
        <li style={{ '--i': 1, '--clr': '#25d366' } as React.CSSProperties}>
          <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          </a>
        </li>
        <li style={{ '--i': 2, '--clr': '#1b1e21' } as React.CSSProperties}>
          <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer"><Twitter /></a>
        </li>
        <li style={{ '--i': 3, '--clr': '#0088cc' } as React.CSSProperties}>
          <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer">
             <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm5.894-16.431-1.92 9.066c-.144.646-.525.805-1.06.505l-2.929-2.158-1.413 1.36c-.156.156-.288.288-.59.288l.211-2.981 5.426-4.901c.236-.211-.052-.328-.367-.118l-6.705 4.22-2.894-.904c-.628-.198-.642-.628.132-.934l11.31-4.364c.523-.198 1.018.118.799.921z"/></svg>
          </a>
        </li>
        <li style={{ '--i': 4, '--clr': '#0a66c2' } as React.CSSProperties}>
          <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin /></a>
        </li>
        <li style={{ '--i': 5, '--clr': '#ea4335' } as React.CSSProperties}>
          <a href={shareLinks.email} target="_blank" rel="noopener noreferrer"><Mail /></a>
        </li>
        <li style={{ '--i': 6, '--clr': '#6C47FF' } as React.CSSProperties}>
          <a href="#" onClick={handleCopy}>
            {copied ? <Check /> : <Copy />}
          </a>
        </li>
        <li style={{ '--i': 7, '--clr': '#ff0000' } as React.CSSProperties}>
          {/* Optional: Add an extra share medium or keep it hidden if not needed. Setting opacity 0 for now. */}
          <a href="#" style={{ opacity: 0, pointerEvents: 'none' }}><span /></a>
        </li>
      </div>
    </div>
  );
}
