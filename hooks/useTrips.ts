'use client';

import { useState, useEffect } from 'react';
import { Trip } from '@/lib/types';
import { getTrips, deleteTripById } from '@/utils/storage';

export function useTrips() {
  const [trips, setTrips] = useState<Trip[]>([]);

  const loadTrips = () => {
    setTrips(getTrips());
  };

  useEffect(() => {
    loadTrips();
  }, []);

  const handleDelete = (id: string) => {
    deleteTripById(id);
    loadTrips();
  };

  const refreshTrips = () => {
    loadTrips();
  };

  return {
    trips,
    handleDelete,
    refreshTrips,
  };
}
