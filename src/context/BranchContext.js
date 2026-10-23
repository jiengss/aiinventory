import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';
import { useAuth } from './AuthContext';

const BranchContext = createContext(null);

export function BranchProvider({ children }) {
  const { user } = useAuth();
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBranches = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await client.get('/branches');
      if (Array.isArray(data)) {
        setBranches(data);
        const savedId = await AsyncStorage.getItem('selected_branch_id');
        const found = data.find((b) => String(b.id) === String(savedId));
        if (found) {
          setSelectedBranch(found);
        } else if (data.length > 0) {
          setSelectedBranch(data[0]);
        }
      }
    } catch (e) {
      console.log('Branch loading notice:', e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    const fetchInitialBranches = async () => {
      if (!user) return;
      try {
        const { data } = await client.get('/branches');
        if (active && Array.isArray(data)) {
          setBranches(data);
          const savedId = await AsyncStorage.getItem('selected_branch_id');
          const found = data.find((b) => String(b.id) === String(savedId));
          setSelectedBranch(found || data[0] || null);
        }
      } catch (e) {
        console.log('Branch loading notice:', e.message);
      }
    };

    fetchInitialBranches();

    return () => {
      active = false;
    };
  }, [user]);

  const changeBranch = async (branch) => {
    setSelectedBranch(branch);
    if (branch?.id) {
      await AsyncStorage.setItem('selected_branch_id', String(branch.id));
    } else {
      await AsyncStorage.removeItem('selected_branch_id');
    }
  };

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranch,
        setSelectedBranch: changeBranch,
        refreshBranches: loadBranches,
        loading,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export const useBranch = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
