#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Parse a halftone SVG file and extract dot data to JSON
 *
 * Usage:
 *   node scripts/parse-halftone-svg.js [input.svg] [output.json]
 *
 * Defaults:
 *   input:  public/images/halftone_swirl.svg
 *   output: public/images/halftone_swirl_data.json
 */

const fs = require('fs');
const path = require('path');

// Get arguments or use defaults
const args = process.argv.slice(2);
const inputPath = args[0] || path.join(__dirname, '../public/images/halftone_swirl.svg');
const outputPath = args[1] || path.join(__dirname, '../public/images/halftone_swirl_data.json');

// Minimum scale threshold - dots below this are invisible
const MIN_SCALE = 0.01;

console.log('Parsing SVG:', inputPath);

// Read SVG file
const svg = fs.readFileSync(inputPath, 'utf8');

// Extract viewBox dimensions
const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
const viewBox = viewBoxMatch
  ? viewBoxMatch[1].split(' ').map(Number)
  : [0, 0, 2000, 1419];

console.log('ViewBox:', viewBox);

// Extract all use elements with their transforms
// Matches: <use transform="translate(x, y) scale(s)" ... fill="#color"/>
// Also handles: <use transform="translate(x, y) scale(s) rotate(r)" ... fill="#color"/>
const useRegex = /<use transform="translate\(([^,]+),\s*([^)]+)\)\s*scale\(([^)]+)\)(?:\s*rotate\([^)]+\))?"[^>]*fill="([^"]+)"/g;

const dots = [];
let match;
let totalDots = 0;

while ((match = useRegex.exec(svg)) !== null) {
  totalDots++;
  const x = parseFloat(match[1]);
  const y = parseFloat(match[2]);
  const scale = parseFloat(match[3]);
  const color = match[4];

  // Only include visible dots (scale > threshold)
  if (scale > MIN_SCALE) {
    dots.push({ x, y, scale, color });
  }
}

console.log('Total dots in SVG:', totalDots);
console.log('Visible dots (scale >', MIN_SCALE + '):', dots.length);
console.log('Filtered out:', totalDots - dots.length, 'near-invisible dots');

// Create output data
const output = {
  viewBox: {
    width: viewBox[2],
    height: viewBox[3]
  },
  dots: dots
};

// Write JSON file
fs.writeFileSync(outputPath, JSON.stringify(output));

const inputSize = fs.statSync(inputPath).size;
const outputSize = fs.statSync(outputPath).size;

console.log('\nSaved to:', outputPath);
console.log('Size reduction:',
  (inputSize / 1024).toFixed(1) + 'KB →',
  (outputSize / 1024).toFixed(1) + 'KB',
  '(' + ((1 - outputSize / inputSize) * 100).toFixed(1) + '% smaller)'
);

// Show sample data
console.log('\nSample dots:');
console.log(JSON.stringify(dots.slice(0, 3), null, 2));
