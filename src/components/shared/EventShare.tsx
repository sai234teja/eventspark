'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Check, Twitter, Facebook, Linkedin, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface EventShareProps {
  url: string;
  title: string;
  description: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  className?: string;
  triggerText?: string;
}

export function EventShare({ url, title, description, variant = "outline", className, triggerText = "Share" }: EventShareProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url.startsWith('/') ? url : '/' + url}` : url;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({ title: 'Link copied to clipboard!' });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({ title: 'Failed to copy link', variant: 'destructive' });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: fullUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} className={className} onClick={() => {
          // If on mobile and native share is supported, prefer it
          if (typeof window !== 'undefined' && navigator.share && window.innerWidth < 768) {
             handleNativeShare();
          }
        }}>
          <Share2 className="h-4 w-4 mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Share Event</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6 py-4">
          <div className="grid grid-cols-4 gap-4">
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 gap-2 border-slate-700 hover:bg-[#1DA1F2] hover:text-white" onClick={() => window.open(shareLinks.twitter, '_blank')}>
              <Twitter className="h-5 w-5" />
              <span className="text-xs">X / Twitter</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 gap-2 border-slate-700 hover:bg-[#4267B2] hover:text-white" onClick={() => window.open(shareLinks.facebook, '_blank')}>
              <Facebook className="h-5 w-5" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 gap-2 border-slate-700 hover:bg-[#0077B5] hover:text-white" onClick={() => window.open(shareLinks.linkedin, '_blank')}>
              <Linkedin className="h-5 w-5" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center justify-center h-20 gap-2 border-slate-700 hover:bg-[#25D366] hover:text-white" onClick={() => window.open(shareLinks.whatsapp, '_blank')}>
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <label htmlFor="link" className="sr-only">
                Link
              </label>
              <input
                id="link"
                readOnly
                className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                value={fullUrl}
              />
            </div>
            <Button type="button" size="sm" className="px-3 bg-indigo-600 hover:bg-indigo-700" onClick={handleCopy}>
              <span className="sr-only">Copy</span>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
