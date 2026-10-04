import controllerImage from "./assets/v3-controller-grounded.webp";

export default function Controller() {
  return (
    <img
      className="controller"
      src={controllerImage}
      alt="8BitDo Ultimate 2C controller in mint with orange controls"
      width="768"
      height="503"
      decoding="async"
    />
  );
}
