declare module 'framer-motion' {
  import * as React from 'react';

  type MotionProps = React.HTMLAttributes<HTMLElement> & { [key: string]: unknown };

  export const AnimatePresence: React.FC<{ children?: React.ReactNode; initial?: boolean }>;

  export const motion: {
    div: React.FC<MotionProps>;
    span: React.FC<MotionProps>;
    [key: string]: React.FC<MotionProps>;
  };
}


