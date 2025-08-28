import React, { createContext, useContext, useState } from "react";

const UiContext = createContext();

export const useLayoutUi = () => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useLayoutUi must be used within a UiProvider");
  }
  return context;
};

export const UiProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const openSidebar = () => {
    setIsSidebarOpen(true);
  };

  const value = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    openSidebar,
  };

  return (
    <UiContext.Provider value={value}>
      {children}
    </UiContext.Provider>
  );
};
