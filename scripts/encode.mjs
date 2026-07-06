// Encodes text to base64 for Bugbound hints/solutions.
// Usage: npm run encode -- "your hint text here"
const text = process.argv.slice(2).join(' ').trim();

if (!text) {
  console.error('Usage: npm run encode -- "text to encode"');
  process.exit(1);
}

console.log(Buffer.from(text, 'utf8').toString('base64'));
