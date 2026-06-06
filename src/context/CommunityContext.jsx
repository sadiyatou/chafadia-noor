import React, { createContext, useContext } from 'react';

import useCommunity from '../hooks/useCommunity';

export const CommunityContext = createContext(null);

export function CommunityProvider({ children }) {
  const community = useCommunity();

  return (
    <CommunityContext.Provider value={community}>
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunityContext() {
  const context = useContext(CommunityContext);

  if (!context) {
    throw new Error(
      'useCommunityContext must be used inside CommunityProvider'
    );
  }

  return context;
}

export default CommunityContext;