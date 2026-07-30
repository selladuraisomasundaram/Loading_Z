export interface LeafletZone {
  id: string;
  name: string;
  color: string;
  bounds: [[number, number], [number, number]]; // [[y1, x1], [y2, x2]]
}

export interface LeafletAisle {
  id: string;
  name: string;
  zoneId: string;
  bounds: [[number, number], [number, number]];
}

// Flat 2D coordinate system boundaries: [y, x]
// Max Width: 1000px, Max Height: 700px
export const MAP_BOUNDS: [[number, number], [number, number]] = [
  [0, 0],
  [700, 1000],
];

export const STORE_ZONES: LeafletZone[] = [
  { id: "ZONE_BAKERY", name: "Bakery", color: "#fef3c7", bounds: [[50, 50], [250, 300]] },
  { id: "ZONE_DAIRY", name: "Dairy", color: "#e0f2fe", bounds: [[50, 350], [250, 600]] },
  { id: "ZONE_SNACKS", name: "Snacks", color: "#ffedd5", bounds: [[300, 50], [500, 300]] },
  { id: "ZONE_BEVERAGES", name: "Beverages", color: "#dbeafe", bounds: [[300, 350], [500, 600]] },
  { id: "ZONE_FROZEN", name: "Frozen Food", color: "#e0e7ff", bounds: [[50, 650], [250, 950]] },
  { id: "ZONE_HOUSEHOLD", name: "Household", color: "#f3f4f6", bounds: [[300, 650], [500, 950]] },
];

export const STORE_AISLES: LeafletAisle[] = [
  { id: "A1", name: "Aisle 1", zoneId: "ZONE_BAKERY", bounds: [[100, 100], [200, 150]] },
  { id: "A2", name: "Aisle 2", zoneId: "ZONE_BAKERY", bounds: [[100, 200], [200, 250]] },
  { id: "A3", name: "Aisle 3", zoneId: "ZONE_DAIRY", bounds: [[100, 400], [200, 450]] },
  { id: "A4", name: "Aisle 4", zoneId: "ZONE_DAIRY", bounds: [[100, 500], [200, 550]] },
  { id: "A5", name: "Aisle 5", zoneId: "ZONE_SNACKS", bounds: [[350, 100], [450, 150]] },
  { id: "A6", name: "Aisle 6", zoneId: "ZONE_SNACKS", bounds: [[350, 200], [450, 250]] },
  { id: "A7", name: "Aisle 7", zoneId: "ZONE_BEVERAGES", bounds: [[350, 400], [450, 450]] },
  { id: "A8", name: "Aisle 8", zoneId: "ZONE_BEVERAGES", bounds: [[350, 500], [450, 550]] },
];

// Dedicated zone for web-scraped / uncataloged items
export const AISLE_UNKNOWN = {
  id: "A99",
  name: "Zone 99 / Uncataloged & Guest Items Section",
  bounds: [[100, 800], [200, 900]] as [[number, number], [number, number]],
  center: [150, 850] as [number, number],
  color: "#fce7f3",
};

export const STORE_ENTRANCE = {
  bounds: [[600, 50], [650, 200]] as [[number, number], [number, number]],
  center: [625, 125] as [number, number],
};

export const STORE_CHECKOUT = {
  bounds: [[600, 800], [650, 950]] as [[number, number], [number, number]],
  center: [625, 875] as [number, number],
};
