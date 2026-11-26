type Project = {
  id: string;
  title: string;
  category: string;
  location: string;
  description: string;
  imageAlt: string;
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
    page: 2,
  },
  {
    id: "harapan-yang-prihatin",
    title: "Harapan Yang Prihatin",
    category: "Assisted living",
    location: "Kuala Lumpur, Malaysia",
    description: "An assisted living concept that uses daylight, local textiles, and tropical planting to create a welcoming environment for older residents.",
    imageAlt: "Interior design study for the Harapan Yang Prihatin assisted living concept",
    page: 5,
  },
  {
    id: "eames-study",
    title: "Eames Chairs & Office Building",
    category: "3D modeling and visualization",
    location: "San Francisco, California",
    description: "A modeling study that develops two-dimensional references into detailed Rhino models and finished Twinmotion renders.",
    imageAlt: "Overhead rendering of the office design study",
    page: 9,
  },
  {
    id: "vital-roots-kitchen",
    title: "Vital Roots Kitchen",
    category: "Restaurant",
    location: "San Francisco, California",
    description: "A neighborhood restaurant concept that brings flexible dining, a teaching space, and a rooftop community garden together.",
    imageAlt: "Rendering of the Vital Roots Kitchen dining room",
    page: 11,
  },
  {
    id: "taylor-residence",
    title: "Taylor Residence",
    category: "Residential",
    location: "San Francisco, California",
    description: "A refresh informed by Edwardian and English Arts and Crafts architecture, including an accessible redesign of the lower-level apartment.",
    imageAlt: "Rendering of a Taylor Residence interior",
    page: 13,
  },
];
