// Test script to check localStorage offline data
// Run this in browser console to verify cached data

console.log('=== OFFLINE DATA CHECK ===');

// Check if data exists in localStorage
const drivers = localStorage.getItem('offline_drivers');
const materials = localStorage.getItem('offline_raw_materials');
const suppliers = localStorage.getItem('offline_suppliers');
const forms = localStorage.getItem('offline_driver_forms');

console.log('Drivers data exists:', !!drivers);
console.log('Materials data exists:', !!materials);
console.log('Suppliers data exists:', !!suppliers);
console.log('Forms data exists:', !!forms);

// Parse and display counts
if (drivers) {
  const driversData = JSON.parse(drivers);
  console.log(`Drivers count: ${driversData.length}`);
  console.log('Sample driver:', driversData[0]);
}

if (materials) {
  const materialsData = JSON.parse(materials);
  console.log(`Materials count: ${materialsData.length}`);
  console.log('Sample material:', materialsData[0]);
}

if (suppliers) {
  const suppliersData = JSON.parse(suppliers);
  console.log(`Suppliers count: ${suppliersData.length}`);
  console.log('Sample supplier:', suppliersData[0]);
}

if (forms) {
  const formsData = JSON.parse(forms);
  console.log(`Forms count: ${formsData.length}`);
  console.log('Pending forms:', formsData.filter(f => f.sync_status === 'pending').length);
  console.log('Sample form:', formsData[0]);
}

console.log('=== END CHECK ===');
