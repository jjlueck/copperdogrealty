const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'listings.txt');
const outputPath = path.join(__dirname, 'fields_summary.txt');

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  
  const startMarker = 'Sample Listings (full detail):';
  const startIndex = content.indexOf(startMarker);
  
  if (startIndex === -1) {
    throw new Error('Could not find start marker "Sample Listings (full detail):" in listings.txt');
  }

  const jsonStart = content.indexOf('{', startIndex);
  if (jsonStart === -1) {
      throw new Error('Could not find JSON start "{" after marker');
  }

  let jsonSection = content.substring(jsonStart);
  
  // Find the end of the JSON object. 
  // Since it's a log file, we can look for the "Statuses found" line which comes after.
  const endMarker = 'Statuses found';
  const endIndex = jsonSection.indexOf(endMarker);
  
  let jsonString;
  if (endIndex !== -1) {
    jsonString = jsonSection.substring(0, endIndex).trim();
  } else {
    // Fallback: simple finding of last '}'
    const lastBrace = jsonSection.lastIndexOf('}');
    if (lastBrace !== -1) {
        jsonString = jsonSection.substring(0, lastBrace + 1);
    } else {
        throw new Error('Could not determine JSON end');
    }
  }

  const data = JSON.parse(jsonString);
  
  let summary = "Summary of Non-Empty Fields from RETS Listing:\n";
  summary += "==============================================\n\n";
  summary += "Field Name | Content\n";
  summary += "--- | ---\n";
  
  const keys = Object.keys(data).sort(); // Sort alphabetically for better readability

  let count = 0;
  for (const key of keys) {
    const value = data[key];
    if (value && (typeof value === 'string' ? value.trim() !== '' : true)) {
        summary += `${key}: ${value}\n`;
        count++;
    }
  }
  
  fs.writeFileSync(outputPath, summary);
  console.log(`Successfully wrote summary of ${count} fields to ${outputPath}`);

} catch (err) {
  console.error('Error generating summary:', err);
  process.exit(1);
}
