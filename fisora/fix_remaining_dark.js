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

  content = content.replace(/bg-white\/5/g, 'bg-gray-50');
  content = content.replace(/border-white\/5/g, 'border-gray-100');
  content = content.replace(/bg-white\/10/g, 'bg-gray-100');
  content = content.replace(/bg-gray-100\/80/g, 'bg-gray-50');
  content = content.replace(/text-gray-900\/30/g, 'text-gray-400');
  
  content = content.replace(/bg-gradient-to-br from-blue-600 to-indigo-900 border border-gray-200/g, 'bg-blue-50 border border-blue-100 text-blue-600');
  content = content.replace(/shadow-glow-orange/g, 'shadow-sm');
  
  // Clean up any remaining navy colors
  content = content.replace(/bg-navy-950/g, 'bg-gray-50');
  content = content.replace(/bg-navy-900/g, 'bg-white');
  content = content.replace(/bg-navy-800/g, 'bg-gray-50');
  
  // Dashboard graph backgrounds
  content = content.replace(/from-emerald-500\/20 to-teal-500\/10 border-emerald-500\/30 text-emerald-400/g, 'bg-white border-gray-200 text-gray-900');
  content = content.replace(/from-rose-500\/20 to-red-500\/10 border-rose-500\/30 text-rose-400/g, 'bg-white border-gray-200 text-gray-900');
  content = content.replace(/from-blue-500\/20 to-indigo-500\/10 border-blue-500\/30 text-blue-400/g, 'bg-white border-gray-200 text-gray-900');
  content = content.replace(/from-brand-orange\/30 to-brand-amber\/10 border-brand-orange\/40 text-brand-gold/g, 'bg-white border-gray-200 text-gray-900');
  
  content = content.replace(/bg-brand-orange\/20/g, 'bg-orange-50');
  content = content.replace(/text-brand-gold/g, 'text-gray-900');

  // Fix form inputs in modals that might be using glass-input
  content = content.replace(/glass-input/g, 'bg-white border-gray-200 shadow-sm text-gray-900 focus:ring-brand-orange');

  fs.writeFileSync(file, content, 'utf8');
});
