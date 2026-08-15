'use client';

import { motion } from 'motion/react';
import React, { ReactNode } from 'react';

interface StaggeredListProps {
  children: ReactNode;
}

export function StaggeredList({ children }: StaggeredListProps) {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          {child}
        </motion.div>
      ))}
    </>
  );
}
