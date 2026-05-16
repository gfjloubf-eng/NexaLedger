import React from 'react';

interface BackdropProps {
  onClick: () => void;
}

export const Backdrop: React.FC<BackdropProps> = ({ onClick }) => (
  <div
    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
    onClick={onClick}
  />
);
