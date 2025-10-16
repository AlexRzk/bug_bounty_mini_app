#!/usr/bin/env node
/**
 * Clean JSON files - removes BOM and invalid characters
 * Usage: node scripts/clean-json.js <file1.json> <file2.json> ...
 */

const fs = require('fs');
const path = require('path');

const files = process.argv.slice(2);

if (files.length === 0) {
  console.log('Usage: node scripts/clean-json.js <file1.json> <file2.json> ...');
  console.log('\nExample: node scripts/clean-json.js lib/bounty-manager-abi.json');
  process.exit(1);
}

files.forEach(file => {
  try {
    const filePath = path.resolve(file);
    console.log(`Cleaning ${file}...`);
    
    // Read file as buffer to detect BOM
    const buffer = fs.readFileSync(filePath);
    let content = buffer.toString('utf8');
    
    // Remove BOM if present
    if (content.charCodeAt(0) === 0xFEFF) {
      console.log('  ⚠ Removed BOM (Byte Order Mark)');
      content = content.slice(1);
    }
    
    // Validate JSON
    const json = JSON.parse(content);
    
    // Write back without BOM
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2), 'utf8');
    
    console.log(`  ✓ Cleaned and validated (${Array.isArray(json) ? json.length + ' items' : 'object'})`);
  } catch (err) {
    console.error(`  ✗ Error cleaning ${file}:`, err.message);
  }
});

console.log('\nDone!');
