const fs = require('fs');

const files = [
  'src/components/Marketplace.tsx',
  'src/components/Inventory.tsx',
  'src/components/CartPage.tsx',
  'src/components/ManageItemModal.tsx',
  'src/components/AddItemModal.tsx',
  'src/components/AnalyticsModal.tsx',
  'src/components/ManagePlantsModal.tsx',
  'src/components/SensorDetailsModal.tsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/bg-gray-900\/50/g, 'bg-gray-50');
  content = content.replace(/bg-gray-900/g, 'bg-gray-50');
  content = content.replace(/bg-gray-800\/50/g, 'bg-white');
  content = content.replace(/bg-gray-800/g, 'bg-white');
  content = content.replace(/bg-gray-700/g, 'bg-white');
  
  content = content.replace(/border-gray-800/g, 'border-gray-200');
  content = content.replace(/border-gray-700/g, 'border-gray-200');
  content = content.replace(/border-gray-600/g, 'border-gray-300');
  
  content = content.replace(/text-gray-400/g, 'text-gray-600');
  content = content.replace(/text-gray-300/g, 'text-gray-700');
  content = content.replace(/text-gray-500/g, 'text-gray-600');
  
  // Replace text-white in standard className strings
  content = content.replace(/className="([^"]+)"/g, (match, classes) => {
    if (classes.includes('bg-emerald-') || classes.includes('bg-blue-') || classes.includes('bg-red-')) {
      return match;
    }
    let newClasses = classes.replace(/text-white/g, 'text-gray-900');
    return `className="${newClasses}"`;
  });
  
  fs.writeFileSync(file, content);
});
console.log('Theme updated!');
