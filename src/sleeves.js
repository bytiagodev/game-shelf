import mint from "./assets/v3-spine-mint.webp";
import yellow from "./assets/v3-spine-yellow.webp";
import blue from "./assets/v3-spine-blue.webp";
import lavender from "./assets/v3-spine-lavender.webp";
import pink from "./assets/v3-spine-pink.webp";
import orange from "./assets/v3-spine-orange.webp";
import black from "./assets/v3-spine-black.webp";
import white from "./assets/v3-spine-white.webp";
import red from "./assets/v3-spine-red.webp";
import royalBlue from "./assets/v3-spine-royal-blue.webp";
import green from "./assets/v3-spine-green.webp";
import grey from "./assets/v3-spine-grey.webp";
import teal from "./assets/v3-spine-teal.webp";
import cream from "./assets/v3-spine-cream.webp";
import brown from "./assets/v3-spine-brown.webp";
import burgundy from "./assets/v3-spine-burgundy.webp";
import lime from "./assets/v3-spine-lime.webp";
import violet from "./assets/v3-spine-violet.webp";
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
