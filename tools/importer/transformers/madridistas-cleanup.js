/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: madridistas cleanup.
 * Selectors from captured DOM of https://platinum.madridistas.com/es-es
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie consent dialogs (OneTrust)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="onetrust"]',
      '[id*="onetrust"]',
    ]);

    // Remove canvas elements (THREE.js animated backgrounds)
    WebImporter.DOMUtils.remove(element, ['canvas']);

    // Remove base64 SVG inline icons (small decorative icons that won't import)
    const inlineSvgs = element.querySelectorAll('img[src^="data:image/svg+xml;base64"]');
    inlineSvgs.forEach((img) => {
      const container = img.closest('.svgContainer');
      if (container) {
        container.remove();
      } else {
        img.remove();
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove navigation bar (Framer nav at top)
    WebImporter.DOMUtils.remove(element, ['.framer-kq6m5m-container']);

    // Remove footer content embedded in last section
    WebImporter.DOMUtils.remove(element, ['.framer-j6wha7']);

    // Remove floating bottom element
    WebImporter.DOMUtils.remove(element, ['.framer-1r801k']);

    // Remove safe elements
    WebImporter.DOMUtils.remove(element, ['noscript', 'link', 'iframe']);

    // Remove empty divs that are just spacers
    WebImporter.DOMUtils.remove(element, ['.framer-1vpndnp', '.framer-1bsscfn']);
  }
}
