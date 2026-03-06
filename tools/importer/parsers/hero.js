/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://platinum.madridistas.com/es-es
 * Instances: section#hero (main hero), section.framer-7udm7i .framer-1dbf18k (final CTA)
 *
 * Block library structure (1 column, 3 rows):
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: heading + subheading + CTA links
 */
export default function parse(element, { document }) {
  // Extract heading (h1 or h2)
  const heading = element.querySelector('h1, h2');

  // Extract description paragraph (not inside a button/link container)
  const allParagraphs = Array.from(element.querySelectorAll('p.framer-text'));
  const description = allParagraphs.find((p) => {
    const text = p.textContent.trim();
    // Skip short texts that are likely button labels or prices
    if (text.length < 30) return false;
    // Skip if inside a link
    if (p.closest('a')) return false;
    return true;
  });

  // Extract CTA links
  const ctaLinks = Array.from(element.querySelectorAll('a.framer-PPENh, a[class*="framer-PPENh"]'));
  // Create proper anchor elements with text
  const ctas = ctaLinks.map((link) => {
    const a = document.createElement('a');
    a.href = link.href || '#';
    a.textContent = link.textContent.trim();
    return a;
  });

  // Extract background image - look for large images (not small icons)
  const images = Array.from(element.querySelectorAll('img'));
  const bgImage = images.find((img) => {
    const src = img.getAttribute('src') || '';
    // Skip base64 SVG icons and small images
    if (src.startsWith('data:')) return false;
    // Prefer larger images (width hints in URL or actual dimensions)
    const widthMatch = src.match(/width=(\d+)/);
    if (widthMatch && parseInt(widthMatch[1]) < 200) return false;
    return true;
  });

  // Build cells array matching block library structure
  const cells = [];

  // Row 1: Background image (optional)
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 2: Content cell (heading + description + CTAs)
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  contentCell.push(...ctas);
  if (contentCell.length > 0) {
    cells.push([contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
