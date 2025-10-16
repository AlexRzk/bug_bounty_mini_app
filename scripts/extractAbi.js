// scripts/extractAbi.js
// Extracts large inline ABI from lib/contracts.ts into JSON and patches the file
const fs = require('fs');
const path = require('path');

const srcPath = path.resolve(process.cwd(), 'lib/contracts.ts');
if (!fs.existsSync(srcPath)) {
  console.error('❌ lib/contracts.ts not found!');
  process.exit(2);
}

// Backup original
const backupPath = srcPath + '.bak';
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(srcPath, backupPath);
  console.log('✓ Backed up to lib/contracts.ts.bak');
}

const src = fs.readFileSync(srcPath, 'utf8');

// Find "export const <name> = [" or "const <name> = [" with optional "as const"
const re = /(?:export\s+)?const\s+([A-Za-z0-9$_]+)\s*(?::\s*[A-Za-z0-9<>[\].,\s]+)?\s*=\s*\[/gm;
let match;
const exports = [];

while ((match = re.exec(src)) !== null) {
  const name = match[1];
  const startIndex = src.indexOf('[', match.index);
  
  // Balance brackets to find the closing ]
  let depth = 0;
  let endIndex = -1;
  let inString = false;
  let stringChar = null;
  
  for (let i = startIndex; i < src.length; i++) {
    const ch = src[i];
    const prev = i > 0 ? src[i - 1] : '';
    
    // Track string state to avoid counting brackets inside strings
    if ((ch === '"' || ch === "'" || ch === '`') && prev !== '\\') {
      if (!inString) {
        inString = true;
        stringChar = ch;
      } else if (ch === stringChar) {
        inString = false;
        stringChar = null;
      }
    }
    
    if (!inString) {
      if (ch === '[' || ch === '{') depth++;
      else if (ch === ']' || ch === '}') {
        depth--;
        if (depth === 0 && ch === ']') {
          endIndex = i;
          break;
        }
      }
    }
  }
  
  if (endIndex < 0) {
    console.warn(`⚠ Could not find matching ] for ${name}`);
    continue;
  }
  
  const arrayText = src.slice(startIndex, endIndex + 1);
  
  // Check if this looks like a huge ABI (>10KB)
  if (arrayText.length > 10000) {
    exports.push({ name, startIndex: match.index, endIndex, arrayText });
    console.log(`✓ Found large export: ${name} (${Math.round(arrayText.length / 1024)}KB)`);
  }
}

if (exports.length === 0) {
  console.log('✓ No large inline ABIs found (file is already clean or small)');
  process.exit(0);
}

// Process the largest export first (usually the problematic one)
exports.sort((a, b) => b.arrayText.length - a.arrayText.length);

for (const exp of exports) {
  const { name, startIndex, endIndex, arrayText } = exp;
  
  // Try to parse as JSON
  let jsonText = arrayText;
  
  // Clean up TypeScript-specific syntax
  jsonText = jsonText.replace(/,(\s*[}\]])/g, '$1'); // trailing commas
  jsonText = jsonText.replace(/'/g, '"'); // single to double quotes (naive but works for most ABIs)
  
  try {
    const parsed = JSON.parse(jsonText);
    
    // Write JSON file
    const libDir = path.resolve(process.cwd(), 'lib');
    const outPath = path.join(libDir, `${name}.abi.json`);
    fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2), 'utf8');
    console.log(`✓ Wrote ABI to lib/${name}.abi.json`);
    
    // Now patch the TypeScript file
    // Find the full declaration including "as const" and semicolon
    const afterEnd = src.slice(endIndex + 1);
    const asConstMatch = afterEnd.match(/^\s*as\s+const\s*;?/);
    let cutTo = endIndex + 1;
    if (asConstMatch) {
      cutTo += asConstMatch[0].length;
    } else {
      const semiMatch = afterEnd.match(/^\s*;/);
      if (semiMatch) cutTo += semiMatch[0].length;
    }
    
    const head = src.slice(0, startIndex);
    const tail = src.slice(cutTo);
    
    // Generate clean import-based replacement
    const importSnippet = `import ${name}Json from './${name}.abi.json';\nimport type { Abi } from 'viem';\n\nexport const ${name}: Abi = ${name}Json as unknown as Abi;\nexport type ${name.charAt(0).toUpperCase() + name.slice(1)}Type = Abi;\n`;
    
    const newSrc = head + importSnippet + tail;
    fs.writeFileSync(srcPath, newSrc, 'utf8');
    console.log(`✓ Patched lib/contracts.ts - replaced ${name} with clean import`);
    
    console.log('\n✅ Done! Next steps:');
    console.log('  1. Restart TypeScript server in VS Code');
    console.log('  2. Run: npm run build');
    console.log('  3. If still issues, clear cache: Remove-Item -Recurse -Force .next\\cache\n');
    
    process.exit(0);
    
  } catch (err) {
    console.error(`❌ Failed to parse ${name} as JSON:`, err.message);
    console.log('Trying fallback: write raw array and manually create JSON...');
    
    // Fallback: just write the raw text and let user manually fix
    const libDir = path.resolve(process.cwd(), 'lib');
    const rawPath = path.join(libDir, `${name}.raw.txt`);
    fs.writeFileSync(rawPath, arrayText, 'utf8');
    console.log(`⚠ Wrote raw ABI to lib/${name}.raw.txt - please manually convert to JSON`);
  }
}
