/** Brand map pins — SVG data URLs (no dependency on google.maps at call time). */

const STEM = "#d98324";
const STEM_DEEP = "#c0561f";
const CREAM = "#fdfbf7";

/** Teardrop pin with cream bloom center — browse / listing markers. */
const LISTING_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="52" viewBox="0 0 40 52" fill="none">
  <path d="M20 50C20 50 38 32.5 38 20C38 9.5 30 2 20 2S2 9.5 2 20C2 32.5 20 50 20 50Z"
        fill="${STEM}" stroke="${STEM_DEEP}" stroke-width="1.5"/>
  <circle cx="20" cy="19" r="10" fill="${CREAM}"/>
  <g fill="${STEM}" opacity="0.92">
    <circle cx="20" cy="15.2" r="2.4"/>
    <circle cx="23.6" cy="17.6" r="2.4"/>
    <circle cx="22.2" cy="21.6" r="2.4"/>
    <circle cx="17.8" cy="21.6" r="2.4"/>
    <circle cx="16.4" cy="17.6" r="2.4"/>
    <circle cx="20" cy="19" r="2.1" fill="${STEM_DEEP}"/>
  </g>
</svg>`.trim();

/** Slightly larger pin for the sell drag handle. */
const PICKUP_PIN_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56" fill="none">
  <path d="M22 54C22 54 41 35 41 22C41 10.4 32.2 2 22 2S3 10.4 3 22C3 35 22 54 22 54Z"
        fill="${STEM}" stroke="${STEM_DEEP}" stroke-width="1.75"/>
  <circle cx="22" cy="21" r="11.5" fill="${CREAM}"/>
  <g fill="${STEM}" opacity="0.92">
    <circle cx="22" cy="16.8" r="2.7"/>
    <circle cx="26.1" cy="19.5" r="2.7"/>
    <circle cx="24.5" cy="24.1" r="2.7"/>
    <circle cx="19.5" cy="24.1" r="2.7"/>
    <circle cx="17.9" cy="19.5" r="2.7"/>
    <circle cx="22" cy="21" r="2.4" fill="${STEM_DEEP}"/>
  </g>
</svg>`.trim();

function svgIcon(
  svg: string,
  width: number,
  height: number,
): google.maps.Icon {
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width, height } as google.maps.Size,
    anchor: { x: width / 2, y: height } as google.maps.Point,
  };
}

export function listingPinIcon(): google.maps.Icon {
  return svgIcon(LISTING_PIN_SVG, 36, 47);
}

export function pickupPinIcon(): google.maps.Icon {
  return svgIcon(PICKUP_PIN_SVG, 40, 51);
}
