/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion block.
 * Base: accordion. Source: https://platinum.madridistas.com/es-es
 * Instance: .framer-1vxdqaf (FAQ section with 6 expandable items)
 *
 * Block library structure (2 columns, multiple rows):
 *   Row 1: block name
 *   Each subsequent row: title (question) | content (answer)
 *
 * Note: In the Framer source, FAQ answers are loaded dynamically on expand.
 * The static HTML only contains question text. Answers will need manual entry.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all accordion item containers
  // Each FAQ item is in a div with class framer-nFv4C (the accordion component)
  const items = Array.from(element.querySelectorAll('.framer-nFv4C'));

  // Deduplicate - sometimes nested components create duplicates
  const seen = new Set();
  const uniqueItems = items.filter((item) => {
    const text = item.textContent.trim();
    if (seen.has(text)) return false;
    seen.add(text);
    return true;
  });

  uniqueItems.forEach((item) => {
    // Extract question text from the header area
    const questionEl = item.querySelector('.framer-1g3yhs8 p, .framer-11rwfhs p');
    const question = questionEl ? questionEl.textContent.trim() : '';

    if (!question) return;

    // Build title cell (question)
    const titleCell = document.createElement('p');
    titleCell.textContent = question;

    // Build content cell (answer)
    // Answers are not in static HTML - create placeholder
    const contentCell = document.createElement('p');
    contentCell.textContent = '[Answer content to be added]';

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion', cells });
  element.replaceWith(block);
}
