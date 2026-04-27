export interface Trip {
  id: string;
  name: string;
  destination: string;
  days: number;
  startDate: string;
  itinerary?: {
    [key: string]: string[];
  };
  budget?: {
    total: number;
    expenses: { name: string; amount: number; category: string }[];
  };
}
