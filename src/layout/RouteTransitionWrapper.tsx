import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import { motionTokenCalm } from '../utils/motionTokens';

type RouteTransitionWrapperProps = {
  children: React.ReactNode;
};

const RouteTransitionWrapper: React.FC<RouteTransitionWrapperProps> = ({ children }) => {
  const location = useLocation();

  // Keep key stable for each navigated location.
  const key = useMemo(
    () => location.pathname + location.search,
    [location.pathname, location.search]
  );

  return (
    <AnimatePresence>
      <motion.div
        key={key}
        className="w-full"
        initial={{ opacity: 0, y: 2 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -1 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Children stay mounted only during their own route phase. */}
        <div className={motionTokenCalm}>{children}</div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RouteTransitionWrapper;


