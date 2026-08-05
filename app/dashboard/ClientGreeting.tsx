'use client';

import { useEffect, useState } from 'react';

export function ClientGreeting({ userName }: { userName: string }) {
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  return (
    <h1 className="text-3xl font-extrabold text-white mb-2">
      {greeting}, {userName}! 👋
    </h1>
  );
}
