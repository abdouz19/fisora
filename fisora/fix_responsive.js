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

  // Modal grids from grid-cols-2 to grid-cols-1 sm:grid-cols-2
  content = content.replace(/className="grid grid-cols-2 gap-4"/g, 'className="grid grid-cols-1 sm:grid-cols-2 gap-4"');

  // Fix remaining dark artifacts
  content = content.replace(/bg-navy-850/g, 'bg-orange-50/50');
  content = content.replace(/text-navy-950/g, 'text-gray-900');
  
  // Dashboard Hero padding
  content = content.replace(/p-6 sm:p-8/g, 'p-4 sm:p-8');

  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed:', file);
});
