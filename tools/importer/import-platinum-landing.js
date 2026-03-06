/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import columnsParser from './parsers/columns.js';
import accordionParser from './parsers/accordion.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/madridistas-cleanup.js';
import sectionsTransformer from './transformers/madridistas-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'columns': columnsParser,
  'accordion': accordionParser,
};

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'platinum-landing',
  description: 'Madridistas Platinum membership landing page with hero, pricing plans, benefits carousel, feature details, FAQ accordion, and CTA sections',
  urls: [
    'https://platinum.madridistas.com/es-es',
  ],
  blocks: [
    {
      name: 'hero',
      instances: ['section#hero', 'section.framer-7udm7i .framer-1dbf18k'],
    },
    {
      name: 'cards',
      instances: ['.framer-54ignn', 'ul.framer--carousel'],
    },
    {
      name: 'columns',
      instances: ['.framer-15t9bnw', '.framer-r73wlt', '.framer-7eklff', 'section.framer-k3mkbh .framer-34b08d', 'section.framer-1d2aruc .framer-14qpfq', 'section.framer-1askbkw .framer-1wv5k5o'],
    },
    {
      name: 'accordion',
      instances: ['.framer-1vxdqaf'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero',
      selector: 'section#hero',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-pricing',
      name: 'Todo lo que incluye Platinum',
      selector: 'section#aldetalle',
      style: null,
      blocks: ['cards'],
      defaultContent: ['section#aldetalle h2', 'section#aldetalle .framer-1c8re90 h3'],
    },
    {
      id: 'section-3-details',
      name: 'Platinum al detalle',
      selector: 'section#aldetalle-2',
      style: null,
      blocks: ['columns'],
      defaultContent: ['section#aldetalle-2 h2'],
    },
    {
      id: 'section-4-rmplay',
      name: 'RM Play',
      selector: 'section.framer-k3mkbh',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-5-motivation',
      name: 'Motivation',
      selector: 'section.framer-1u7uig8',
      style: null,
      blocks: [],
      defaultContent: ['section.framer-1u7uig8 h2', 'section.framer-1u7uig8 p'],
    },
    {
      id: 'section-6-wallet',
      name: 'Wallet / Subscription',
      selector: 'section.framer-1d2aruc',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-7-welcome-pack',
      name: 'Welcome Pack',
      selector: 'section.framer-1askbkw',
      style: null,
      blocks: ['columns'],
      defaultContent: [],
    },
    {
      id: 'section-8-faq',
      name: 'FAQ',
      selector: 'section.framer-1bmqxb9',
      style: null,
      blocks: ['accordion'],
      defaultContent: ['section.framer-1bmqxb9 h2', 'section.framer-1bmqxb9 .framer-hf713p p', 'section.framer-1bmqxb9 .framer-765mlr a'],
    },
    {
      id: 'section-9-cta',
      name: 'Final CTA',
      selector: 'section.framer-7udm7i',
      style: null,
      blocks: ['hero'],
      defaultContent: [],
    },
  ],
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
