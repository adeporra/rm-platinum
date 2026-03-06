var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-platinum-landing.js
  var import_platinum_landing_exports = {};
  __export(import_platinum_landing_exports, {
    default: () => import_platinum_landing_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const heading = element.querySelector("h1, h2");
    const allParagraphs = Array.from(element.querySelectorAll("p.framer-text"));
    const description = allParagraphs.find((p) => {
      const text = p.textContent.trim();
      if (text.length < 30) return false;
      if (p.closest("a")) return false;
      return true;
    });
    const ctaLinks = Array.from(element.querySelectorAll('a.framer-PPENh, a[class*="framer-PPENh"]'));
    const ctas = ctaLinks.map((link) => {
      const a = document.createElement("a");
      a.href = link.href || "#";
      a.textContent = link.textContent.trim();
      return a;
    });
    const images = Array.from(element.querySelectorAll("img"));
    const bgImage = images.find((img) => {
      const src = img.getAttribute("src") || "";
      if (src.startsWith("data:")) return false;
      const widthMatch = src.match(/width=(\d+)/);
      if (widthMatch && parseInt(widthMatch[1]) < 200) return false;
      return true;
    });
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    contentCell.push(...ctas);
    if (contentCell.length > 0) {
      cells.push([contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document }) {
    const cells = [];
    const isCarousel = element.tagName === "UL" || element.querySelector("ul.framer--carousel");
    const carouselUl = element.tagName === "UL" ? element : element.querySelector("ul.framer--carousel");
    if (carouselUl) {
      const items = Array.from(carouselUl.querySelectorAll(":scope > li"));
      items.forEach((li) => {
        const images = Array.from(li.querySelectorAll("img"));
        const photo = images.find((img) => {
          const src = img.getAttribute("src") || "";
          return !src.startsWith("data:") && src.includes("framerusercontent");
        });
        const textEl = li.querySelector("p.framer-text");
        const text = textEl ? textEl.textContent.trim() : "";
        const imageCell = photo || document.createTextNode("");
        const textCell = [];
        if (text) {
          const p = document.createElement("p");
          p.textContent = text;
          textCell.push(p);
        }
        if (text || photo) {
          cells.push([imageCell, textCell.length ? textCell : document.createTextNode("")]);
        }
      });
    } else {
      const cardDivs = Array.from(element.querySelectorAll(".framer-17q435m, .framer-16pihcd"));
      if (cardDivs.length === 0) {
        const headings = Array.from(element.querySelectorAll("h4"));
        headings.forEach((h4) => {
          const cardContainer = h4.closest('[class^="framer-"]');
          if (cardContainer && !cardDivs.includes(cardContainer)) {
            cardDivs.push(cardContainer);
          }
        });
      }
      cardDivs.forEach((card) => {
        const images = Array.from(card.querySelectorAll("img"));
        const cardImage = images.find((img) => {
          const src = img.getAttribute("src") || "";
          return !src.startsWith("data:") && src.includes("framerusercontent");
        });
        const titleEl = card.querySelector("h4, h3");
        const title = titleEl ? titleEl.textContent.trim() : "";
        const paragraphs = Array.from(card.querySelectorAll("p.framer-text"));
        const priceTexts = paragraphs.filter((p) => {
          const text = p.textContent.trim();
          return text.match(/[\d,.]+€/);
        });
        const descriptionEl = paragraphs.find((p) => {
          const text = p.textContent.trim();
          return !text.match(/[\d,.]+€/) && text.length > 10;
        });
        const textCell = [];
        if (title) {
          const strong = document.createElement("strong");
          strong.textContent = title;
          textCell.push(strong);
        }
        priceTexts.forEach((priceP) => {
          const p = document.createElement("p");
          p.textContent = priceP.textContent.trim();
          textCell.push(p);
        });
        if (descriptionEl) {
          const p = document.createElement("p");
          p.textContent = descriptionEl.textContent.trim();
          textCell.push(p);
        }
        const imageCell = cardImage || document.createTextNode("");
        cells.push([imageCell, textCell.length ? textCell : document.createTextNode("")]);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse3(element, { document }) {
    const headings = Array.from(element.querySelectorAll("h2, h3"));
    const paragraphs = Array.from(element.querySelectorAll("p.framer-text")).filter((p) => {
      if (p.closest("a")) return false;
      return p.textContent.trim().length > 0;
    });
    const images = Array.from(element.querySelectorAll("img")).filter((img) => {
      const src = img.getAttribute("src") || "";
      if (src.startsWith("data:")) return false;
      if (!src.includes("framerusercontent")) return false;
      const widthMatch = src.match(/width=(\d+)/);
      const heightMatch = src.match(/height=(\d+)/);
      if (widthMatch && heightMatch) {
        const w = parseInt(widthMatch[1]);
        const h = parseInt(heightMatch[1]);
        if (w < 100 && h < 100) return false;
      }
      return true;
    });
    const textContent = [];
    headings.forEach((h) => {
      const clone = document.createElement(h.tagName.toLowerCase());
      clone.textContent = h.textContent.trim();
      textContent.push(clone);
    });
    paragraphs.forEach((p) => {
      const text = p.textContent.trim();
      const para = document.createElement("p");
      para.textContent = text;
      textContent.push(para);
    });
    const mainImage = images.length > 0 ? images[0] : null;
    const firstChild = element.querySelector(":scope > div > div");
    let imageFirst = false;
    if (firstChild) {
      const firstImg = firstChild.querySelector("img");
      const firstHeading = firstChild.querySelector("h2, h3");
      if (firstImg && !firstHeading) {
        const imgSrc = firstImg.getAttribute("src") || "";
        if (!imgSrc.startsWith("data:") && imgSrc.includes("framerusercontent")) {
          imageFirst = true;
        }
      }
    }
    const cells = [];
    if (imageFirst && mainImage) {
      cells.push([mainImage, textContent]);
    } else if (mainImage) {
      cells.push([textContent, mainImage]);
    } else {
      cells.push([textContent]);
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion.js
  function parse4(element, { document }) {
    const cells = [];
    const items = Array.from(element.querySelectorAll(".framer-nFv4C"));
    const seen = /* @__PURE__ */ new Set();
    const uniqueItems = items.filter((item) => {
      const text = item.textContent.trim();
      if (seen.has(text)) return false;
      seen.add(text);
      return true;
    });
    uniqueItems.forEach((item) => {
      const questionEl = item.querySelector(".framer-1g3yhs8 p, .framer-11rwfhs p");
      const question = questionEl ? questionEl.textContent.trim() : "";
      if (!question) return;
      const titleCell = document.createElement("p");
      titleCell.textContent = question;
      const contentCell = document.createElement("p");
      contentCell.textContent = "[Answer content to be added]";
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/madridistas-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="onetrust"]',
        '[id*="onetrust"]'
      ]);
      WebImporter.DOMUtils.remove(element, ["canvas"]);
      const inlineSvgs = element.querySelectorAll('img[src^="data:image/svg+xml;base64"]');
      inlineSvgs.forEach((img) => {
        const container = img.closest(".svgContainer");
        if (container) {
          container.remove();
        } else {
          img.remove();
        }
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [".framer-kq6m5m-container"]);
      WebImporter.DOMUtils.remove(element, [".framer-j6wha7"]);
      WebImporter.DOMUtils.remove(element, [".framer-1r801k"]);
      WebImporter.DOMUtils.remove(element, ["noscript", "link", "iframe"]);
      WebImporter.DOMUtils.remove(element, [".framer-1vpndnp", ".framer-1bsscfn"]);
    }
  }

  // tools/importer/transformers/madridistas-sections.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === TransformHook2.afterTransform) {
      const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
      const template = payload && payload.template;
      if (!template || !template.sections || template.sections.length < 2) return;
      const sections = template.sections;
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const selectorList = Array.isArray(section.selector) ? section.selector : [section.selector];
        let sectionEl = null;
        for (const sel of selectorList) {
          sectionEl = element.querySelector(sel);
          if (sectionEl) break;
        }
        if (!sectionEl) continue;
        if (section.style) {
          const metaBlock = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          sectionEl.append(metaBlock);
        }
        if (i > 0) {
          const hr = document.createElement("hr");
          sectionEl.before(hr);
        }
      }
    }
  }

  // tools/importer/import-platinum-landing.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "columns": parse3,
    "accordion": parse4
  };
  var PAGE_TEMPLATE = {
    name: "platinum-landing",
    description: "Madridistas Platinum membership landing page with hero, pricing plans, benefits carousel, feature details, FAQ accordion, and CTA sections",
    urls: [
      "https://platinum.madridistas.com/es-es"
    ],
    blocks: [
      {
        name: "hero",
        instances: ["section#hero", "section.framer-7udm7i .framer-1dbf18k"]
      },
      {
        name: "cards",
        instances: [".framer-54ignn", "ul.framer--carousel"]
      },
      {
        name: "columns",
        instances: [".framer-15t9bnw", ".framer-r73wlt", ".framer-7eklff", "section.framer-k3mkbh .framer-34b08d", "section.framer-1d2aruc .framer-14qpfq", "section.framer-1askbkw .framer-1wv5k5o"]
      },
      {
        name: "accordion",
        instances: [".framer-1vxdqaf"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero",
        selector: "section#hero",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2-pricing",
        name: "Todo lo que incluye Platinum",
        selector: "section#aldetalle",
        style: null,
        blocks: ["cards"],
        defaultContent: ["section#aldetalle h2", "section#aldetalle .framer-1c8re90 h3"]
      },
      {
        id: "section-3-details",
        name: "Platinum al detalle",
        selector: "section#aldetalle-2",
        style: null,
        blocks: ["columns"],
        defaultContent: ["section#aldetalle-2 h2"]
      },
      {
        id: "section-4-rmplay",
        name: "RM Play",
        selector: "section.framer-k3mkbh",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-5-motivation",
        name: "Motivation",
        selector: "section.framer-1u7uig8",
        style: null,
        blocks: [],
        defaultContent: ["section.framer-1u7uig8 h2", "section.framer-1u7uig8 p"]
      },
      {
        id: "section-6-wallet",
        name: "Wallet / Subscription",
        selector: "section.framer-1d2aruc",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-7-welcome-pack",
        name: "Welcome Pack",
        selector: "section.framer-1askbkw",
        style: null,
        blocks: ["columns"],
        defaultContent: []
      },
      {
        id: "section-8-faq",
        name: "FAQ",
        selector: "section.framer-1bmqxb9",
        style: null,
        blocks: ["accordion"],
        defaultContent: ["section.framer-1bmqxb9 h2", "section.framer-1bmqxb9 .framer-hf713p p", "section.framer-1bmqxb9 .framer-765mlr a"]
      },
      {
        id: "section-9-cta",
        name: "Final CTA",
        selector: "section.framer-7udm7i",
        style: null,
        blocks: ["hero"],
        defaultContent: []
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_platinum_landing_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_platinum_landing_exports);
})();
