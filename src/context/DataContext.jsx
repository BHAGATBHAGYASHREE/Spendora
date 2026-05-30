import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DataContext = createContext(null);

export function DataProvider({ children, token }) {
  const [personalTransactions, setPersonalTransactionsState] = useState([]);
  const [businessTransactions, setBusinessTransactionsState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  
  const isMigrated = useRef(false);
  const syncTimeoutRef = useRef(null);
  
  // Keep latest state in refs for debounced sync to avoid closure issues
  const stateRef = useRef({
    personal: [],
    business: [],
    customers: []
  });

  useEffect(() => {
    stateRef.current = {
      personal: personalTransactions,
      business: businessTransactions,
      customers: customers
    };
  }, [personalTransactions, businessTransactions, customers]);

  // Load data from MongoDB when user logs in or changes session token
  useEffect(() => {
    if (!token) {
      setPersonalTransactionsState([]);
      setBusinessTransactionsState([]);
      setCustomersState([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setSyncStatus('syncing');
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
        const res = await fetch(`${apiUrl}/api/user/financial-data`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch user data from MongoDB');
        const data = await res.json();
        
        // Automatic One-Time Migration:
        // If the backend has no data, but the local browser storage contains transactions, 
        // migrate the local data into MongoDB Atlas so the user does not lose their mock history.
        const localPersonal = JSON.parse(localStorage.getItem('finance_personal') || '[]');
        const localBusiness = JSON.parse(localStorage.getItem('finance_business') || '[]');
        const localCustomers = JSON.parse(localStorage.getItem('finance_customers') || '[]');

        const isBackendEmpty = 
          (!data.personalTransactions || data.personalTransactions.length === 0) && 
          (!data.businessTransactions || data.businessTransactions.length === 0) && 
          (!data.businessCustomers || data.businessCustomers.length === 0);
                             
        const localHasData = localPersonal.length > 0 || localBusiness.length > 0 || localCustomers.length > 0;

        if (isBackendEmpty && localHasData && !isMigrated.current) {
          console.log('Spendora Data Engine: Local data detected. Migrating mock history to MongoDB Atlas...');
          isMigrated.current = true;
          
          setPersonalTransactionsState(localPersonal);
          setBusinessTransactionsState(localBusiness);
          setCustomersState(localCustomers);
          
          // Write to Atlas immediately
          await performImmediateSync(localPersonal, localBusiness, localCustomers);
        } else {
          // Load clean database data from MongoDB Atlas
          setPersonalTransactionsState(data.personalTransactions || []);
          setBusinessTransactionsState(data.businessTransactions || []);
          setCustomersState(data.businessCustomers || []);
          
          // Cache locally for instant loading / offline fallback
          localStorage.setItem('finance_personal', JSON.stringify(data.personalTransactions || []));
          localStorage.setItem('finance_business', JSON.stringify(data.businessTransactions || []));
          localStorage.setItem('finance_customers', JSON.stringify(data.businessCustomers || []));
          
          setSyncStatus('synced');
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      } catch (err) {
        console.error('Spendora Data Engine Error fetching data:', err);
        setSyncStatus('error');
        
        // Offline Fallback: Load from local storage cache
        setPersonalTransactionsState(JSON.parse(localStorage.getItem('finance_personal') || '[]'));
        setBusinessTransactionsState(JSON.parse(localStorage.getItem('finance_business') || '[]'));
        setCustomersState(JSON.parse(localStorage.getItem('finance_customers') || '[]'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Performs immediate, blocking sync to database
  const performImmediateSync = async (personal, business, custs) => {
    if (!token) return;
    setSyncStatus('syncing');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005';
      const res = await fetch(`${apiUrl}/api/user/financial-data`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          personalTransactions: personal,
          businessTransactions: business,
          businessCustomers: custs
        })
      });
      if (!res.ok) throw new Error('Synchronization failed');
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) {
      console.error('Spendora Sync Error:', err);
      setSyncStatus('error');
    }
  };

  // Debounced Sync Helper to avoid overwhelming MongoDB Atlas on rapid actions
  const triggerDebouncedSync = () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    setSyncStatus('syncing');
    syncTimeoutRef.current = setTimeout(async () => {
      const { personal, business, customers: custs } = stateRef.current;
      await performImmediateSync(personal, business, custs);
    }, 1200); // 1.2s delay before sending request
  };

  // State setters that update local UI immediately, cache locally, and schedule a cloud sync
  const setPersonalTransactions = (newVal) => {
    setPersonalTransactionsState(prev => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      localStorage.setItem('finance_personal', JSON.stringify(updated));
      // Update our ref immediately to ensure next debounce takes the fresh data
      stateRef.current.personal = updated;
      triggerDebouncedSync();
      return updated;
    });
  };

  const setBusinessTransactions = (newVal) => {
    setBusinessTransactionsState(prev => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      localStorage.setItem('finance_business', JSON.stringify(updated));
      stateRef.current.business = updated;
      triggerDebouncedSync();
      return updated;
    });
  };

  const setCustomers = (newVal) => {
    setCustomersState(prev => {
      const updated = typeof newVal === 'function' ? newVal(prev) : newVal;
      localStorage.setItem('finance_customers', JSON.stringify(updated));
      stateRef.current.customers = updated;
      triggerDebouncedSync();
      return updated;
    });
  };

  // Force an immediate sync (e.g. on manual trigger)
  const triggerManualSync = () => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    const { personal, business, customers: custs } = stateRef.current;
    performImmediateSync(personal, business, custs);
  };

  return (
    <DataContext.Provider value={{
      personalTransactions,
      setPersonalTransactions,
      businessTransactions,
      setBusinessTransactions,
      customers,
      setCustomers,
      isLoading,
      syncStatus,
      triggerManualSync
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
