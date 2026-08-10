'use client';

import { useEffect, useState } from 'react';

import BorderGlow from '@/components/ui/BorderGlow';

export function ClientGreeting({ userName }: { userName: string }) {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <BorderGlow animated={true} className="w-fit p-4 px-6 mb-2">
      <h1 className="text-3xl font-extrabold text-white">
        {greeting}, {userName}! 👋
      </h1>
    </BorderGlow>
  );
}
