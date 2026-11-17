import ingredientData from "./data/ingredients.json" with { type: "json" };
import recipesA from "./data/recipes-a.json" with { type: "json" };
import recipesB from "./data/recipes-b.json" with { type: "json" };
import vendorRecipeData from "./data/vendor-recipes.json" with { type: "json" };
import bookReferenceRecipes from "./data/book-reference-recipes.json" with { type: "json" };
export const bookReferenceRecipeCount = bookReferenceRecipes.length;
export const vendorRecipeCount = vendorRecipeData.length;
export type Ingredient = { id: string; name: string; category: string };
const groups: Record<string, [string, string][]> = {
  Spirits: [
    ["gin", "Gin"],
    ["vodka", "Vodka"],
    ["tequila", "100% agave tequila"],
    ["rum", "White rum"],
    ["bourbon", "Bourbon whiskey"],
    ["rye", "Rye whiskey"],
    ["japanese-whisky", "Japanese whisky"],
    ["cognac", "Cognac"],
    ["fireball", "Fireball"],
    ["lychee-soju", "Lychee-flavored soju"],
  ],
  "Liqueurs & aperitifs": [
    ["triple-sec", "Triple sec"],
    ["amber-curacao", "Amber curaçao"],
    ["raspberry", "Raspberry liqueur"],
    ["aperol", "Aperol"],
    ["campari", "Campari"],
    ["sweet-vermouth", "Sweet red vermouth"],
    ["dry-vermouth", "Dry vermouth"],
    ["coffee", "Coffee liqueur"],
    ["lychee", "Lychee liqueur"],
  ],
  "Juice & mixers": [
    ["bottled-lemon", "Bottled lemon juice"],
    ["bottled-lime", "Bottled lime juice"],
    ["bottled-orange", "Bottled orange juice"],
    ["fruit-punch", "Fruit punch juice drink"],
    ["tonic-concentrate", "Tonic concentrate"],
    ["matcha", "Matcha"],
    ["ginger-blend", "Organic ginger blend"],
    ["diet-cola-concentrate", "Diet cola concentrate"],
    ["diet-ginger-ale-concentrate", "Diet ginger ale concentrate"],
    ["diet-lemon-lime-concentrate", "Diet lemon-lime concentrate"],
    ["lime", "Fresh lime juice"],
    ["lemon", "Fresh lemon juice"],
    ["orange", "Fresh orange juice"],
    ["pineapple", "Fresh pineapple juice"],
    ["pineapple-juice", "Pineapple juice"],
    ["soda", "Plain sparkling water"],
    ["water", "Water"],
    ["cola", "Cola"],
    ["cola-zero", "Coke Zero"],
    ["tonic", "Tonic water"],
    ["ginger-ale", "Ginger ale"],
    ["lemon-lime-soda", "Lemon-lime soda"],
    ["ginger-beer", "Ginger beer"],
    ["prosecco", "Prosecco"],
    ["peach-ginger", "White peach & ginger mixer"],
    ["grapefruit-seltzer", "Grapefruit sparkling water"],
  ],
  "Syrups & extras": [
    ["portland-georgia-peach", "Georgia Peach syrup concentrate"],
    ["portland-ube", "Ube syrup concentrate"],
    ["portland-pomegranate-cherry", "Pomegranate Cherry syrup concentrate"],
    ["ube-flavouring", "Ube flavoring"],
    ["jasmine-essence", "Jasmine flavoring essence"],
    ["tamarind-margarita-premix", "Tamarind margarita (premixed)"],
    ["wine-unconfirmed", "Wine (style unconfirmed)"],
    ["fire-tincture", "Spicy fire tincture"],
    ["chocolate-bitters", "Chocolate bitters"],
    ["dehydrated-lemon", "Dehydrated lemon garnish"],
    ["cosmo-rimmer", "Cosmopolitan rim garnish"],
    ["goldschlager", "Goldschläger cinnamon schnapps"],
    ["aperix", "Aperix aperitivo"],
    ["tajin-rim", "Tajín rim seasoning"],
    ["stout", "Stout beer"],
    ["cream-sherry", "Cream sherry"],
    ["coconut-liqueur", "Coconut liqueur"],
    ["coconut-water-syrup", "Coconut water syrup"],
    ["coconut-cream", "Coconut cream"],
    ["fernet", "Fernet"],
    ["elderflower-simple-syrup", "Elderflower simple syrup"],
    ["matcha-syrup", "Matcha syrup"],
    ["jalapeno", "Fresh jalapeño"],
    ["tajin-sauce", "Tajín chile-lime sauce"],
    ["grapefruit-fruit", "Fresh grapefruit"],
    ["syrup", "Simple syrup"],
    ["sugar", "Superfine sugar"],
    ["sugar-cube", "Sugar cubes"],
    ["grenadine", "Grenadine"],
    ["aromatic", "Aromatic bitters"],
    ["angostura", "Angostura aromatic bitters"],
    ["peach-bitters", "Peach bitters"],
    ["cherries", "Cocktail cherries"],
    ["ice", "Ice"],
    ["premix", "Strawberry margarita (premixed)"],
  ],
};
export const ingredients: Ingredient[] = [
  ...Object.entries(groups).flatMap(([category, rows]) =>
    rows.map(([id, name]) => ({ id, name, category })),
  ),
  ...ingredientData,
];
export const ingredientName = (id: string) =>
  ingredients.find((i) => i.id === id)?.name ?? id;
export const equipment = [
  { id: "shaker", name: "Shaker & strainer" },
  { id: "mixing", name: "Mixing glass & strainer" },
  { id: "spoon", name: "Stirring spoon" },
  { id: "strainer", name: "Strainer" },
  { id: "aarke", name: "Aarke carbonator" },
  { id: "slushi", name: "Ninja SLUSHi" },
  { id: "blender", name: "Blender (separate from SLUSHi)" },
  { id: "muddler", name: "Muddler" },
];
export type Product = { name: string; ingredient: string };
// Generic product directory, not an owner's inventory. No stock is preselected.
export const products: Product[] = [
  { name: "Empress 1908 gin", ingredient: "gin" },
  { name: "Kirkland London Dry Gin", ingredient: "gin" },
  { name: "Suntory Toki", ingredient: "japanese-whisky" },
  { name: "Kirkland reposado tequila", ingredient: "tequila" },
  { name: "Ghost Face vodka", ingredient: "vodka" },
  { name: "Fireball", ingredient: "fireball" },
  { name: "Chambord", ingredient: "raspberry" },
  { name: "Curaçao Ambre", ingredient: "amber-curacao" },
  { name: "Aperol", ingredient: "aperol" },
  { name: "SOHO lychee liqueur", ingredient: "lychee" },
  { name: "Luxardo maraschino cherries", ingredient: "cherries" },
  { name: "Fee Brothers Peach Bitters", ingredient: "peach-bitters" },
  { name: "Scrappy’s Aromatic Bitters", ingredient: "aromatic" },
  { name: "Rose’s grenadine", ingredient: "grenadine" },
  {
    name: "SodaStream Crafted White Peach & Ginger",
    ingredient: "peach-ginger",
  },
  { name: "Mission strawberry margarita", ingredient: "premix" },
  { name: "Coke Zero", ingredient: "cola-zero" },
  { name: "LaCroix Pamplemousse", ingredient: "grapefruit-seltzer" },
];
export type Requirement = { id: string; amount: string };
export type Drink = {
  id: string;
  name: string;
  description: string;
  spirit: string;
  taste: string[];
  style: "Classic" | "Sparkling" | "Frozen";
  effort: "Quick" | "Shake or stir";
  needs: Requirement[];
  tools: string[];
  method: string;
  source: string;
  sourceLabel: string;
  note?: string;
  optionalNeeds?: Requirement[];
  originalSource?: string;
  garnish?: string;
  needsReview?: boolean;
  image?: {
    src: string;
    author: string;
    source: string;
    license: string;
    licenseURL: string;
  };
};
function iba(
  id: string,
  name: string,
  description: string,
  spirit: string,
  taste: string[],
  needs: [string, string][],
  tools: string[],
  method: string,
  note?: string,
): Drink {
  return {
    id,
    name,
    description,
    spirit,
    taste,
    style: needs.some(([id]) =>
      ["soda", "ginger-beer", "cola", "prosecco"].includes(id),
    )
      ? "Sparkling"
      : "Classic",
    effort:
      tools.includes("shaker") || tools.includes("mixing")
        ? "Shake or stir"
        : "Quick",
    needs: [
      ...needs.map(([id, amount]) => ({ id, amount })),
      { id: "ice", amount: "As needed" },
    ],
    tools,
    method,
    source: `https://iba-world.com/iba-cocktail/${id}/`,
    sourceLabel: "IBA recipe reference",
    note,
  };
}
export const drinks: Drink[] = [
  iba(
    "margarita",
    "Margarita",
    "Bright lime with a crisp orange edge.",
    "tequila",
    ["Citrusy"],
    [
      ["tequila", "50 ml"],
      ["triple-sec", "20 ml"],
      ["lime", "15 ml"],
    ],
    ["shaker"],
    "Shake with ice, then strain into a chilled cocktail glass.",
    "Optional salt rim. Amber curaçao is not automatically treated as triple sec.",
  ),
  iba(
    "daiquiri",
    "Daiquiri",
    "A clean balance of rum, lime, and sweetness.",
    "rum",
    ["Citrusy", "Refreshing"],
    [
      ["rum", "60 ml"],
      ["lime", "20 ml"],
      ["sugar", "2 bar spoons"],
    ],
    ["shaker"],
    "Dissolve the sugar in the liquids, add ice, shake, and strain into a chilled glass.",
  ),
  iba(
    "negroni",
    "Negroni",
    "Herbal, bittersweet, and deliberately bold.",
    "gin",
    ["Bitter", "Spirit-forward"],
    [
      ["gin", "30 ml"],
      ["campari", "30 ml"],
      ["sweet-vermouth", "30 ml"],
    ],
    ["spoon"],
    "Stir over ice in a rocks glass.",
    "Optional orange slice.",
  ),
  iba(
    "americano",
    "Americano",
    "A long, bittersweet aperitif with a sparkling finish.",
    "aperol-family",
    ["Bitter", "Refreshing"],
    [
      ["campari", "30 ml"],
      ["sweet-vermouth", "30 ml"],
      ["soda", "Splash"],
    ],
    ["spoon"],
    "Combine over ice, add sparkling water, and stir gently.",
    "Optional orange and lemon garnish.",
  ),
  iba(
    "spritz",
    "Aperol Spritz",
    "Bitter orange lifted by sparkling wine.",
    "aperol-family",
    ["Bitter", "Refreshing"],
    [
      ["prosecco", "90 ml"],
      ["aperol", "60 ml"],
      ["soda", "Splash"],
    ],
    ["spoon"],
    "Combine in an ice-filled wine glass and stir gently.",
    "Optional orange slice.",
  ),
  iba(
    "french-martini",
    "French Martini",
    "Raspberry and pineapple with a soft tropical finish.",
    "vodka",
    ["Fruity"],
    [
      ["vodka", "45 ml"],
      ["raspberry", "15 ml"],
      ["pineapple", "15 ml"],
    ],
    ["shaker"],
    "Shake the liquids with ice and strain into a chilled cocktail glass.",
    "Optional lemon-peel oil.",
  ),
  iba(
    "tequila-sunrise",
    "Tequila Sunrise",
    "Orange and grenadine layered over tequila.",
    "tequila",
    ["Fruity", "Refreshing"],
    [
      ["tequila", "45 ml"],
      ["orange", "90 ml"],
      ["grenadine", "15 ml"],
    ],
    [],
    "Pour tequila and orange juice over ice. Slowly add grenadine to settle at the bottom.",
    "Optional orange and cherry garnish.",
  ),
  iba(
    "gin-fizz",
    "Gin Fizz",
    "Lemon and gin finished with a light fizz.",
    "gin",
    ["Citrusy", "Refreshing"],
    [
      ["gin", "45 ml"],
      ["lemon", "30 ml"],
      ["syrup", "10 ml"],
      ["soda", "Splash"],
    ],
    ["shaker"],
    "Shake everything except sparkling water with ice. Strain into a tall glass and finish with sparkling water.",
    "Serve without ice in the glass. Optional lemon garnish.",
  ),
  iba(
    "white-lady",
    "White Lady",
    "A sharp, citrus-led gin cocktail.",
    "gin",
    ["Citrusy"],
    [
      ["gin", "40 ml"],
      ["triple-sec", "30 ml"],
      ["lemon", "20 ml"],
    ],
    ["shaker"],
    "Shake with ice and strain into a chilled cocktail glass.",
  ),
  iba(
    "dry-martini",
    "Dry Martini",
    "Gin and dry vermouth in a spare, aromatic pairing.",
    "gin",
    ["Spirit-forward"],
    [
      ["gin", "60 ml"],
      ["dry-vermouth", "10 ml"],
    ],
    ["mixing"],
    "Stir with ice and strain into a chilled martini glass.",
    "Optional lemon-peel oil or olive.",
  ),
  iba(
    "black-russian",
    "Black Russian",
    "Coffee richness with a vodka backbone.",
    "vodka",
    ["Spirit-forward"],
    [
      ["vodka", "50 ml"],
      ["coffee", "20 ml"],
    ],
    ["spoon"],
    "Stir together over ice in a rocks glass.",
  ),
  iba(
    "moscow-mule",
    "Moscow Mule",
    "Ginger heat, lime brightness, and a sparkling finish.",
    "vodka",
    ["Refreshing", "Citrusy"],
    [
      ["vodka", "45 ml"],
      ["ginger-beer", "120 ml"],
      ["lime", "10 ml"],
    ],
    ["spoon"],
    "Combine over ice and stir gently.",
    "Generic vodka adaptation of the IBA recipe, which specifies Smirnoff. Optional lime slice.",
  ),
  iba(
    "cuba-libre",
    "Cuba Libre",
    "Rum and cola sharpened with fresh lime.",
    "rum",
    ["Refreshing"],
    [
      ["rum", "50 ml"],
      ["cola", "120 ml"],
      ["lime", "10 ml"],
    ],
    [],
    "Combine in a tall glass over ice.",
    "Optional lime wedge. Coke Zero is kept separate from cola.",
  ),
  iba(
    "old-fashioned",
    "Old Fashioned",
    "Whiskey, bitters, and just enough sweetness.",
    "bourbon",
    ["Spirit-forward"],
    [
      ["bourbon", "45 ml"],
      ["sugar-cube", "1 cube"],
      ["angostura", "A few dashes"],
      ["water", "A few dashes"],
    ],
    ["spoon"],
    "Dissolve the sugar with bitters and water in a rocks glass. Add ice and whiskey; stir.",
    "Bourbon variant. Optional orange and cocktail cherry.",
  ),
  iba(
    "whiskey-sour",
    "Whiskey Sour",
    "Bourbon balanced with lemon and sugar.",
    "bourbon",
    ["Citrusy"],
    [
      ["bourbon", "45 ml"],
      ["lemon", "25 ml"],
      ["syrup", "20 ml"],
    ],
    ["shaker"],
    "Shake with ice and strain into a glass, with fresh ice if desired.",
    "Egg-white-free variant. Optional garnish omitted.",
  ),
  iba(
    "sidecar",
    "Sidecar",
    "A dry, orange-accented cognac sour.",
    "cognac",
    ["Citrusy"],
    [
      ["cognac", "50 ml"],
      ["triple-sec", "20 ml"],
      ["lemon", "20 ml"],
    ],
    ["shaker"],
    "Shake with ice and strain into a chilled cocktail glass.",
  ),
  ...[
    [
      "gin-tonic",
      "Gin & Tonic",
      "Bitter, botanical, and sparkling.",
      "gin",
      ["Refreshing", "Bitter"],
      [
        ["gin", "50 ml"],
        ["tonic", "150 ml"],
      ],
    ],
    [
      "vodka-soda",
      "Vodka Soda",
      "A simple, crisp sparkling highball.",
      "vodka",
      ["Refreshing"],
      [
        ["vodka", "45 ml"],
        ["soda", "135 ml"],
      ],
    ],
    [
      "whisky-highball",
      "Japanese Whisky Highball",
      "Whisky lengthened with sparkling water.",
      "japanese-whisky",
      ["Refreshing", "Spirit-forward"],
      [
        ["japanese-whisky", "45 ml"],
        ["soda", "135 ml"],
      ],
    ],
    [
      "gin-soda",
      "Gin Soda",
      "Botanicals with a light sparkling finish.",
      "gin",
      ["Refreshing"],
      [
        ["gin", "45 ml"],
        ["soda", "135 ml"],
      ],
    ],
  ].map((row) => {
    const [id, name, description, spirit, taste, needs] = row as [
      string,
      string,
      string,
      string,
      string[],
      [string, string][],
    ];
    return {
      ...iba(
        id,
        name,
        description,
        spirit,
        taste,
        needs,
        ["spoon"],
        "Pour over ice in a tall glass, add the mixer, and stir gently.",
      ),
      source: "",
      sourceLabel: "BarBuddy house proportions",
      note: "House recipe, not a book or IBA transcription. Garnish optional.",
    };
  }),
];

// Pinned, locally validated open recipe data. Existing stable IDs are preserved.
drinks.push(...([...recipesA, ...recipesB, ...vendorRecipeData, ...bookReferenceRecipes] as Drink[]));
const tokiHighball = drinks.find(d => d.id === "whisky-highball")!;
tokiHighball.source = "https://house.suntory.com/cocktails/whisky-highball";
tokiHighball.sourceLabel = "House of Suntory · Toki Highball";
tokiHighball.note = "Source checked 2026-11-16. Retained 1:3 proportions match Suntory guidance. Fresh lemon or grapefruit peel optional.";
const margarita = drinks.find((d) => d.id === "margarita")!;
margarita.image = {
  src: "/barbuddy/margarita.jpg",
  author: "Cocktailmarler",
  source: "https://commons.wikimedia.org/wiki/File:Klassiche_Margarita.jpg",
  license: "CC BY-SA 3.0",
  licenseURL: "https://creativecommons.org/licenses/by-sa/3.0/",
};
