/**
 * A simple parser to extract items and prices from raw receipt text.
 * This is a basic implementation and can be improved with more advanced regex.
 * @param {string} text - The raw text extracted from the receipt by the AI.
 * @returns {Array} An array of objects, where each object represents an item with a description and a price.
 */
export const parseReceiptText = (text) => {
  const lines = text.split('\n');
  const items = [];
  // This regex looks for lines that likely contain an item and a price.
  // It looks for text followed by a number with a decimal point.
  const itemRegex = /(.+?)\s+([\d,]+\.\d{2})/;

  lines.forEach(line => {
    const match = line.match(itemRegex);
    if (match) {
      // match[1] is the item description, match[2] is the price
      const description = match[1].trim();
      const price = parseFloat(match[2].replace(',', '')); // Remove commas for parsing
      
      // Filter out common lines that are not items
      if (!/total|subtotal|tax|cash|change/i.test(description)) {
        items.push({ description, price });
      }
    }
  });

  return items;
};
