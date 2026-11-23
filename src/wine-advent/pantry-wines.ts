type PantryWine = {
  name: string;
  region: string;
  notes: readonly [string, string, string];
  description: string;
  pairings: string;
  retailPrice: string;
  product: string;
};

// Negative IDs keep pantry entries independent of existing numbered home rounds.
export const pantryWines: Readonly<Partial<Record<number, PantryWine>>> = {
  [-1]: {
    name: "Tintoretto 2024 Primitivo",
    region: "Puglia IGT, Italy",
    notes: ["Blackberry", "Plum", "Black cherry"],
    description: "A smooth, rounded red with ripe dark fruit, gentle baking spice, a lingering toast note, and fine tannins.",
    pairings: "Pork tenderloin, lasagna, aged hard cheese",
    retailPrice: "$31.00",
    product: "tintoretto-2024-primitivo-puglia-igt",
  },
  [-2]: {
    name: "Tallax 2023 Shiraz",
    region: "South Australia, Australia",
    notes: ["Black cherry", "Lavender", "Dark chocolate"],
    description: "Perfumed and plush, with cocoa, a touch of earthiness, and subtle oak on a long finish.",
    pairings: "Braised beef, roasted lamb, oven-baked brie",
    retailPrice: "$36.00",
    product: "tallax-2023-shiraz-south-australia",
  },
  [-3]: {
    name: "Masterworks Series 2024 Vino Tinto",
    region: "Spain",
    notes: ["Plum", "Black cherry", "Baking spice"],
    description: "Juicy and fresh, with blackberry and mulberry aromas, dusty chocolate, sweet spice, and fine tannins.",
    pairings: "Beef tenderloin, oven-baked brie, braised lamb shanks",
    retailPrice: "$26.50",
    product: "masterworks-series-2024-vino-tinto-spain",
  },
  [-4]: {
    name: "Earth’s Draw 2024 Merlot",
    region: "Mendocino County, California",
    notes: ["Plum", "Black cherry", "Black currant"],
    description: "Round and ripe, with dark fruit compote and juicy tannins. Spice and cocoa linger on the finish.",
    pairings: "Short ribs, mushroom risotto, roasted chicken",
    retailPrice: "$32.50",
    product: "earths-draw-2024-merlot-mendocino-county-california",
  },
  [-5]: {
    name: "Cien por Ciento 2024 Malbec",
    region: "Mendoza, Argentina",
    notes: ["Blackberry", "Cigar box", "Dried herbs"],
    description: "Savory cedar and chaparral mingle with blueberry and cranberry. Concentrated dark fruit and gentle spice lead to a juicy finish.",
    pairings: "Beef tenderloin, aged Manchego, roasted mushrooms",
    retailPrice: "$26.50",
    product: "cien-por-ciento-2024-malbec-mendoza-argentina",
  },
  [-6]: {
    name: "Alavez 2024 Verdejo",
    region: "Spain",
    notes: ["Citrus blossom", "Fresh herbs", "Mineral"],
    description: "A lean, zesty white with bright acidity, a light savory grip, and a crisp mineral finish.",
    pairings: "Ahi tuna, spinach salad, grilled lamb",
    retailPrice: "$26.00",
    product: "alavez-2024-verdejo-spain",
  },
  [-7]: {
    name: "Meiggs’ Pardon 2024 Promissory Red",
    region: "North Coast, California",
    notes: ["Plum", "Baking spice", "Dark chocolate"],
    description: "Juicy and rounded, with black cherry and cassis alongside cinnamon, nutmeg, and vanilla. Smooth tannins carry dark fruit and spice into the finish.",
    pairings: "Eggplant Parmesan, roasted chicken, short ribs",
    retailPrice: "$26.50",
    product: "meiggs-pardon-2024-promissory-red-north-coast",
  },
};

export const pantryIds = Object.keys(pantryWines).map(Number);
