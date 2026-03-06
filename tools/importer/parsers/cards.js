/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://platinum.madridistas.com/es-es
 * Instance 1: .framer-54ignn (pricing cards - 2 jersey options with prices)
 * Instance 2: ul.framer--carousel (benefits carousel - 12 benefit items)
 *
 * Block library structure (2 columns, multiple rows):
 *   Row 1: block name
 *   Each subsequent row: image | title + description + CTA
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance: pricing cards vs carousel
  const isCarousel = element.tagName === 'UL' || element.querySelector('ul.framer--carousel');
  const carouselUl = element.tagName === 'UL' ? element : element.querySelector('ul.framer--carousel');

  if (carouselUl) {
    // Instance 2: Benefits carousel - each <li> is a card
    const items = Array.from(carouselUl.querySelectorAll(':scope > li'));
    items.forEach((li) => {
      // Find the non-SVG image (the benefit photo, not the small icon)
      const images = Array.from(li.querySelectorAll('img'));
      const photo = images.find((img) => {
        const src = img.getAttribute('src') || '';
        return !src.startsWith('data:') && src.includes('framerusercontent');
      });

      // Find the benefit text
      const textEl = li.querySelector('p.framer-text');
      const text = textEl ? textEl.textContent.trim() : '';

      // Build row: image | text
      const imageCell = photo || document.createTextNode('');
      const textCell = [];
      if (text) {
        const p = document.createElement('p');
        p.textContent = text;
        textCell.push(p);
      }

      if (text || photo) {
        cells.push([imageCell, textCell.length ? textCell : document.createTextNode('')]);
      }
    });
  } else {
    // Instance 1: Pricing cards - find card containers
    // Each card has: h4 title, strikethrough price, current price, image, description
    const cardDivs = Array.from(element.querySelectorAll('.framer-17q435m, .framer-16pihcd'));

    if (cardDivs.length === 0) {
      // Fallback: look for h4 elements as card indicators
      const headings = Array.from(element.querySelectorAll('h4'));
      headings.forEach((h4) => {
        const cardContainer = h4.closest('[class^="framer-"]');
        if (cardContainer && !cardDivs.includes(cardContainer)) {
          cardDivs.push(cardContainer);
        }
      });
    }

    cardDivs.forEach((card) => {
      // Extract card image
      const images = Array.from(card.querySelectorAll('img'));
      const cardImage = images.find((img) => {
        const src = img.getAttribute('src') || '';
        return !src.startsWith('data:') && src.includes('framerusercontent');
      });

      // Extract title
      const titleEl = card.querySelector('h4, h3');
      const title = titleEl ? titleEl.textContent.trim() : '';

      // Extract prices - look for price text patterns
      const paragraphs = Array.from(card.querySelectorAll('p.framer-text'));
      const priceTexts = paragraphs.filter((p) => {
        const text = p.textContent.trim();
        return text.match(/[\d,.]+€/);
      });

      // Extract description - paragraph that's not a price
      const descriptionEl = paragraphs.find((p) => {
        const text = p.textContent.trim();
        return !text.match(/[\d,.]+€/) && text.length > 10;
      });

      // Build text cell
      const textCell = [];
      if (title) {
        const strong = document.createElement('strong');
        strong.textContent = title;
        textCell.push(strong);
      }
      priceTexts.forEach((priceP) => {
        const p = document.createElement('p');
        p.textContent = priceP.textContent.trim();
        textCell.push(p);
      });
      if (descriptionEl) {
        const p = document.createElement('p');
        p.textContent = descriptionEl.textContent.trim();
        textCell.push(p);
      }

      // Build row: image | text content
      const imageCell = cardImage || document.createTextNode('');
      cells.push([imageCell, textCell.length ? textCell : document.createTextNode('')]);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
