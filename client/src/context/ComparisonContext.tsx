import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types/index.js';
import { useToast } from './ToastContext.js';

interface ComparisonContextType {
  comparedProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isCompared: (productId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARE_ITEMS = 3;

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [comparedProducts, setComparedProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('product_comparison');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { success, error } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('product_comparison', JSON.stringify(comparedProducts));
    } catch (e) {
      console.error('Failed to persist comparison list', e);
    }
  }, [comparedProducts]);

  const addToCompare = (product: Product) => {
    if (comparedProducts.some((p) => p.id === product.id)) {
      removeFromCompare(product.id);
      return;
    }
    if (comparedProducts.length >= MAX_COMPARE_ITEMS) {
      error(`You can compare a maximum of ${MAX_COMPARE_ITEMS} products at once.`);
      return;
    }

    // Only compare equivalent models (same catalogGroup) or items within the same category
    if (comparedProducts.length > 0) {
      const first = comparedProducts[0];
      const sameGroup = product.catalogGroup && first.catalogGroup && product.catalogGroup === first.catalogGroup;
      const sameCategory = product.categoryId === first.categoryId;
      if (!sameGroup && !sameCategory) {
        error(`Comparison is restricted to equivalent models or items in the same category (${first.category?.name || 'current'}).`);
        return;
      }
    }

    setComparedProducts((prev) => [...prev, product]);
    success(`Added "${product.title}" to product comparison.`);
  };

  const removeFromCompare = (productId: string) => {
    setComparedProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const clearCompare = () => {
    setComparedProducts([]);
  };

  const isCompared = (productId: string) => {
    return comparedProducts.some((p) => p.id === productId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        comparedProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isCompared,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
