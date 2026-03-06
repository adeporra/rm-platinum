/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://platinum.madridistas.com/es-es
 * 6 instances with text|image or image|text layouts:
 *   - .framer-15t9bnw (feature 01: text|image)
 *   - .framer-r73wlt (feature 02: image|text)
 *   - .framer-7eklff (feature 03: text|image)
 *   - section.framer-k3mkbh .framer-34b08d (RM Play: text|image)
 *   - section.framer-1d2aruc .framer-14qpfq (Wallet: text|image)
 *   - section.framer-1askbkw .framer-1wv5k5o (Welcome Pack: image|text)
 *
 * Block library structure (2+ columns, multiple rows):
 *   Row 1: block name
 *   Row 2+: cell1 | cell2 (text and/or images per cell)
 */
export default function parse(element, { document }) {
  // Collect all text content elements (headings, paragraphs)
  const headings = Array.from(element.querySelectorAll('h2, h3'));
  const paragraphs = Array.from(element.querySelectorAll('p.framer-text')).filter((p) => {
    // Exclude paragraphs inside links
    if (p.closest('a')) return false;
    return p.textContent.trim().length > 0;
  });

  // Collect all non-SVG, non-icon images (skip small icons < 100px)
  const images = Array.from(element.querySelectorAll('img')).filter((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) return false;
    if (!src.includes('framerusercontent')) return false;
    // Skip small icon images based on URL width/height hints
    const widthMatch = src.match(/width=(\d+)/);
    const heightMatch = src.match(/height=(\d+)/);
    if (widthMatch && heightMatch) {
      const w = parseInt(widthMatch[1]);
      const h = parseInt(heightMatch[1]);
      if (w < 100 && h < 100) return false;
    }
    return true;
  });

  // Build text content cell - combine all text elements
  const textContent = [];

  headings.forEach((h) => {
    const clone = document.createElement(h.tagName.toLowerCase());
    clone.textContent = h.textContent.trim();
    textContent.push(clone);
  });

  paragraphs.forEach((p) => {
    const text = p.textContent.trim();
    // Skip very short text that might be a number badge (01, 02, 03)
    // but include it as part of the content
    const para = document.createElement('p');
    para.textContent = text;
    textContent.push(para);
  });

  // Build image cell - use the main content image (largest/first non-icon)
  const mainImage = images.length > 0 ? images[0] : null;

  // Determine layout order based on DOM structure
  // Check if the first significant child is an image container
  const firstChild = element.querySelector(':scope > div > div');
  let imageFirst = false;
  if (firstChild) {
    const firstImg = firstChild.querySelector('img');
    const firstHeading = firstChild.querySelector('h2, h3');
    if (firstImg && !firstHeading) {
      const imgSrc = firstImg.getAttribute('src') || '';
      if (!imgSrc.startsWith('data:') && imgSrc.includes('framerusercontent')) {
        imageFirst = true;
      }
    }
  }

  // Build cells: single row with 2 columns
  const cells = [];
  if (imageFirst && mainImage) {
    cells.push([mainImage, textContent]);
  } else if (mainImage) {
    cells.push([textContent, mainImage]);
  } else {
    cells.push([textContent]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
