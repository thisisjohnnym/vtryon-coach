export type Colorway = {
  id: string;
  name: string;
  hero: string;
  tile: string;
  /** Tile crop lifted from the matching Paper rectangle. */
  tileSize: string;
  tilePosition: string;
};

export const PRODUCT_TITLE = "Tabby Shoulder Bag 26";
export const PRODUCT_PRICE = "$475";

export const colorways: Colorway[] = [
  {
    id: "marigold",
    name: "Suede/Brass/Marigold",
    hero: "/images/hero-marigold.png",
    tile: "/images/tile-marigold.png",
    tileSize: "171.552%",
    tilePosition: "50% 0%",
  },
  {
    id: "magenta",
    name: "Suede/Brass/Magenta",
    hero: "/images/hero-magenta.png",
    tile: "/images/tile-magenta.png",
    tileSize: "cover",
    tilePosition: "50%",
  },
  {
    id: "dark-cherry",
    name: "B4/Dark Cherry",
    hero: "/images/hero-dark-cherry.png",
    tile: "/images/tile-dark-cherry.png",
    tileSize: "171.552%",
    tilePosition: "50% 0%",
  },
  {
    id: "black",
    name: "Natural Grain Leather/Brass/Black",
    hero: "/images/hero-black.png",
    tile: "/images/tile-black.png",
    tileSize: "171.552%",
    tilePosition: "50% 0%",
  },
];

/** Dark Cherry is the colorway shown on the splash phone and on Paper frame 1. */
export const INITIAL_COLORWAY_INDEX = 2;
