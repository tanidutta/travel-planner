import { Trip } from '@/lib/types';

export const getTrips = (): Trip[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('trips');
  return stored ? JSON.parse(stored) : [];
};

export const saveTrips = (trips: Trip[]): void => {
  localStorage.setItem('trips', JSON.stringify(trips));
};

export const getTripById = (id: string): Trip | null => {
  const trips = getTrips();
  return trips.find(t => t.id === id) ?? null;
};

export const addTrip = (trip: Trip): void => {
  const trips = getTrips();
  saveTrips([...trips, trip]);
};

export const updateTrip = (updatedTrip: Trip): void => {
  const trips = getTrips();
  const index = trips.findIndex(t => t.id === updatedTrip.id);
  if (index !== -1) {
    trips[index] = updatedTrip;
    saveTrips(trips);
  }
};

export const deleteTripById = (id: string): void => {
  const trips = getTrips();
  saveTrips(trips.filter(t => t.id !== id));
};
