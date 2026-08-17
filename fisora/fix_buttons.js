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
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Fix primary buttons text color
  content = content.replace(/bg-accent-gradient text-gray-900/g, 'bg-brand-orange text-white');
  content = content.replace(/bg-accent-gradient/g, 'bg-brand-orange text-white');
  
  // Fix hover states on white cards
  content = content.replace(/hover:bg-white\/10/g, 'hover:bg-gray-50');
  content = content.replace(/hover:bg-white\/5/g, 'hover:bg-gray-50');

  // Fix modal backdrops
  content = content.replace(/bg-black\/70/g, 'bg-gray-900\/50');
  
  // Update glass-card hover borders
  content = content.replace(/border-brand-orange\/30/g, 'border-brand-orange');

  fs.writeFileSync(file, content, 'utf8');
});
