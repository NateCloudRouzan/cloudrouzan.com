type Project = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  imageAlt: string;
  coverCaption: string;
  views: { image: string; alt: string; caption: string }[];
  designNote: string;
  page: number;
};

export const projects: Project[] = [
  {
    id: "national-geographic",
    title: "National Geographic",
    category: "Mixed-use commercial",
    location: "San Francisco, California",
    description: "An exhibition, shop, café, and workplace concept for a historic Presidio building, shaped by the surrounding landscape and a focus on reclaimed materials.",
    imageAlt: "Exterior rendering of the National Geographic building in the Presidio",
    coverCaption: "Presidio exterior",
    views: [
      { image: "exhibition", alt: "Daylit exhibition space with display tables and partitions", caption: "Exhibition interior" },
    ],
    designNote: "The concept preserves the historic exterior and uses the existing windows to bring natural light into the exhibition and work spaces.",
    page: 2,
  },
  {
    id: "harapan-yang-prihatin",
    title: "Harapan Yang Prihatin",
    category: "Assisted living",
    location: "Kuala Lumpur, Malaysia",
    description: "An assisted living concept that uses daylight, local textiles, and tropical planting to create a welcoming environment for older residents.",
    imageAlt: "Interior design study for the Harapan Yang Prihatin assisted living concept",
    coverCaption: "Lobby and reception",
    views: [
      { image: "harapan-entrance", alt: "Glazed entrance to the assisted living facility", caption: "Main entrance" },
      { image: "harapan-dining", alt: "Communal dining room with seating and a planted wall", caption: "Communal dining room" },
    ],
    designNote: "Local artwork and fabrics connect the interiors to Malaysian culture. Soft textures, daylight, and accessible layouts support everyday comfort.",
    page: 5,
  },
  {
    id: "eames-study",
    title: "Eames Chairs & Office Building",
    category: "3D modeling and visualization",
    location: "San Francisco, California",
    description: "A modeling study that develops two-dimensional references into detailed Rhino models and finished Twinmotion renders.",
    imageAlt: "Overhead rendering of the office design study",
    coverCaption: "Overhead office view",
    views: [
      { image: "eames-render", alt: "Ground-level view of reception and the staircase in the office model", caption: "Reception render" },
    ],
    designNote: "The study follows the drafting process from two-dimensional references through Rhino models to materials, lighting, and final renders in Twinmotion.",
    page: 9,
  },
  {
    id: "vital-roots-kitchen",
    title: "Vital Roots Kitchen",
    category: "Restaurant",
    location: "San Francisco, California",
    description: "A neighborhood restaurant concept that brings flexible dining, a teaching space, and a rooftop community garden together.",
    imageAlt: "Rendering of the Vital Roots Kitchen dining room",
    coverCaption: "Dining room",
    views: [
      { image: "vital-roots-plan", alt: "Furniture plan showing the restaurant dining layout and support spaces", caption: "Furniture plan" },
    ],
    designNote: "Modular seating lets the dining room shift between everyday service, group gatherings, and classes. The rooftop garden connects the restaurant to the neighborhood.",
    page: 11,
  },
  {
    id: "taylor-residence",
    title: "Taylor Residence",
    category: "Residential",
    location: "San Francisco, California",
    description: "A refresh informed by Edwardian and English Arts and Crafts architecture, including an accessible redesign of the lower-level apartment.",
    imageAlt: "Rendering of a Taylor Residence interior",
    coverCaption: "Main-level interior",
    views: [
      { image: "taylor-apartment", alt: "Three-dimensional furniture plan of the lower-level apartment", caption: "Lower-level apartment plan" },
    ],
    designNote: "The apartment plan places living and dining rooms along the north side for daylight and groups utility rooms along the below-grade side.",
    page: 13,
  },
];
