"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/hooks/Api";

interface AdminContextType {
  selectedCustomer: User | null;
  setSelectedCustomer: (customer: User | null) => void;
  clearCustomer: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedCustomer, setSelectedCustomerState] = useState<User | null>(
    null
  );

  // Persistence: Save/Load from session storage to survive page refreshes
  useEffect(() => {
    const saved = sessionStorage.getItem("admin_selected_customer");
    if (saved) {
      try {
        setSelectedCustomerState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved customer", e);
      }
    }
  }, []);

  const setSelectedCustomer = (customer: User | null) => {
    setSelectedCustomerState(customer);
    if (customer) {
      sessionStorage.setItem("admin_selected_customer", JSON.stringify(customer));
    } else {
      sessionStorage.removeItem("admin_selected_customer");
    }
  };

  const clearCustomer = () => {
    setSelectedCustomer(null);
  };

  return (
    <AdminContext.Provider
      value={{ selectedCustomer, setSelectedCustomer, clearCustomer }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};
