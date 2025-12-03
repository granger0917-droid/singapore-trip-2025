
export enum Tab {
  Overview = 'overview',
  Itinerary = 'itinerary',
  Tickets = 'tickets',
  More = 'more'
}

export interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  mapQuery: string;
  note?: string;
  isImportant?: boolean;
}

export interface DayItinerary {
  date: string; // YYYY-MM-DD
  dayLabel: string; // Day 1
  activities: Activity[];
}

export enum TicketType {
  Image = 'image',
  PDF = 'pdf'
}

export enum TicketCategory {
  Flight = '機票',
  Zoo = '動物園',
  Feeding = '餵食券',
  Other = '其他'
}

export interface Ticket {
  id: string;
  title: string;
  description?: string; // New field for "Flight no / Date"
  category: TicketCategory;
  type: TicketType;
  data: string; // Base64
  fileName: string;
}

export interface FlightSegment {
  airline: string;    // New: STARLUX
  code: string;       // JX771
  date: string;       // 2025-11-27
  time: string;       // 08:25
  origin: string;     // New: TPE
  destination: string;// New: SIN
  terminal: string;   // T2
}

export interface HotelInfo {
  name: string;
  address: string;
  mapQuery: string;
  checkIn: string;
  checkOut: string;
  phone?: string;
}

export interface AppData {
  itinerary: DayItinerary[];
  tickets: Ticket[];
  flights: {
    outbound: FlightSegment;
    inbound: FlightSegment;
  };
  hotel: HotelInfo;
}

export enum PrintMode {
  Itinerary = 'itinerary',
  Flights = 'flights',
  All = 'all'
}
