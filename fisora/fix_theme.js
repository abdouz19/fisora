const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') && !file.includes('Layout.jsx')) { // Skip Layout since we already rewrote it
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Colors
  content = content.replace(/text-white\/40/g, 'text-gray-400');
  content = content.replace(/text-white\/50/g, 'text-gray-500');
  content = content.replace(/text-white\/60/g, 'text-gray-500');
  content = content.replace(/text-white\/70/g, 'text-gray-600');
  content = content.replace(/text-white\/80/g, 'text-gray-700');
  content = content.replace(/text-white/g, 'text-gray-900');
  
  // Backgrounds
  content = content.replace(/bg-navy-950/g, 'bg-gray-100');
  content = content.replace(/bg-navy-900\/60/g, 'bg-white');
  content = content.replace(/bg-navy-900\/80/g, 'bg-white');
  content = content.replace(/bg-navy-900/g, 'bg-gray-50');
  content = content.replace(/bg-navy-800\/80/g, 'bg-gray-100');
  content = content.replace(/bg-navy-800/g, 'bg-gray-50');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-gray-200');
  content = content.replace(/border-white\/20/g, 'border-gray-300');
  content = content.replace(/border-white\/15/g, 'border-gray-200');

  // Layout specifics that were dark
  content = content.replace(/bg-brand-gradient/g, 'bg-brand-gradient shadow-sm'); // keep brand gradient but it's light now
  
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated:', file);
});
