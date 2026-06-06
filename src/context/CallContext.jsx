import React, {
  createContext,
  useContext,
} from 'react';

import useCall from '../hooks/useCall';

export const CallContext = createContext(null);

export function CallProvider({
  children,
  currentUserId = null,
}) {
  const call = useCall(currentUserId);

  return (
    <CallContext.Provider value={call}>
      {children}
    </CallContext.Provider>
  );
}

export function useCallContext() {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error(
      'useCallContext must be used inside CallProvider'
    );
  }

  return context;
}

export default CallContext;