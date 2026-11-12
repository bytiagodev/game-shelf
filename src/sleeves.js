import mint from "./assets/spine-mint.webp";
import yellow from "./assets/spine-yellow.webp";
import blue from "./assets/spine-blue.webp";
import lavender from "./assets/spine-lavender.webp";
import pink from "./assets/spine-pink.webp";
import orange from "./assets/spine-orange.webp";
import black from "./assets/spine-black.webp";
import white from "./assets/spine-white.webp";
import red from "./assets/spine-red.webp";
import royalBlue from "./assets/spine-royal-blue.webp";
import green from "./assets/spine-green.webp";
import grey from "./assets/spine-grey.webp";
import teal from "./assets/spine-teal.webp";
import cream from "./assets/spine-cream.webp";
import brown from "./assets/spine-brown.webp";
import burgundy from "./assets/spine-burgundy.webp";
import lime from "./assets/spine-lime.webp";
import violet from "./assets/spine-violet.webp";
import navy from "./assets/spine-navy.webp";
import gold from "./assets/spine-gold.webp";
import { sleeveColors } from "./sleeveColors.js";

const sleeveImages = {
  mint,
  yellow,
  blue,
  lavender,
  pink,
  orange,
  black,
  white,
  red,
  "royal-blue": royalBlue,
  green,
  grey,
  teal,
  cream,
  brown,
  burgundy,
  lime,
  violet,
  navy,
  gold,
};

const lightInk = "#fffaf3";
const darkInk = "#191928";

// An unknown sleeve name falls back to mint so a typo never breaks the shelf.
export function getSleeve(sleeveName) {
  const name = sleeveName in sleeveColors ? sleeveName : "mint";
  const { color, lightTitle } = sleeveColors[name];
  return {
    image: sleeveImages[name],
    color,
    ink: lightTitle ? lightInk : darkInk,
  };
}
