const fs = require("fs");
const path = require("path");

const inputPath = path.resolve(__dirname, "../ai-docs/UTILITIES.md");
const outputPath = path.resolve(__dirname, "../app/constants/utilities.json");

const content = fs.readFileSync(inputPath, "utf-8");
const lines = content.split("\n");

const cities = [];
let currentCity = null;
let currentProvider = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // City section: ## City Name
  const cityMatch = line.match(/^##\s+(.+)$/);
  if (cityMatch) {
    const cityName = cityMatch[1].trim();
    if (cityName) {
      currentCity = { city: cityName, providers: [] };
      cities.push(currentCity);
      currentProvider = null;
    }
    continue;
  }

  if (!currentCity) continue;

  // Top-level provider: *   **Category:** content
  const providerMatch = line.match(/^\*\s+\*\*(.+?):\*\*\s*(.*)$/);
  if (providerMatch) {
    const category = providerMatch[1].trim();
    const content = providerMatch[2].trim();
    currentProvider = { category, items: [] };
    currentCity.providers.push(currentProvider);
    if (content) {
      currentProvider.items.push(content);
    }
    continue;
  }

  // Nested item: *   provider (4+ spaces before asterisk, or continuation)
  const nestedMatch = line.match(/^\s+\*\s+(.+)$/);
  if (nestedMatch && currentProvider) {
    currentProvider.items.push(nestedMatch[1].trim());
    continue;
  }
}

// Ensure output directory exists
const outDir = path.dirname(outputPath);
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(outputPath, JSON.stringify(cities, null, 2));
console.log(`Parsed ${cities.length} cities, wrote to ${outputPath}`);
