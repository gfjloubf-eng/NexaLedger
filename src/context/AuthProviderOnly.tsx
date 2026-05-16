import React from 'react';

import { AuthProvider } from './AuthProviderComponent';

export { AuthProvider };

export default function AuthProviderOnly({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

