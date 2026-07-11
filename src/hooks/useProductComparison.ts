'use client';

import { useState, useEffect } from 'react';

const COMPARISON_KEY = 'product_comparison';
const MAX_COMPARISON_ITEMS = 4;

export function useProductComparison() {
  const [comparisonList, setComparisonList] = useState<any[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(COMPARISON_KEY);
      if (stored) {
        setComparisonList(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading comparison list:', error);
    }
  }, []);

  const addToComparison = (product: any) => {
    setComparisonList(prev => {
      // Check if already in list
      if (prev.some(p => p._id === product._id || p.id === product.id)) {
        return prev;
      }
      
      // Check if max reached
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        return prev;
      }
      
      const updated = [...prev, product];
      
      try {
        localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving comparison list:', error);
      }
      
      return updated;
    });
  };

  const removeFromComparison = (productId: string) => {
    setComparisonList(prev => {
      const updated = prev.filter(p => (p._id !== productId && p.id !== productId));
      
      try {
        localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving comparison list:', error);
      }
      
      return updated;
    });
  };

  const clearComparison = () => {
    setComparisonList([]);
    try {
      localStorage.removeItem(COMPARISON_KEY);
    } catch (error) {
      console.error('Error clearing comparison list:', error);
    }
  };

  const isInComparison = (productId: string) => {
    return comparisonList.some(p => p._id === productId || p.id === productId);
  };

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonList.length < MAX_COMPARISON_ITEMS,
  };
}
