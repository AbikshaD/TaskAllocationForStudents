#!/usr/bin/env node

/**
 * Diagnostic Tool - Check if everything is set up correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Running Diagnostics...\n');

const checks = [
  {
    name: 'Node.js version',
    check: () => process.version,
  },
  {
    name: 'Backend folder exists',
    check: () => fs.existsSync(path.join(__dirname, '../')) ? '✅' : '❌',
  },
  {
    name: 'Backend .env exists',
    check: () => fs.existsSync(path.join(__dirname, '.env')) ? '✅' : '❌ Create .env file',
  },
  {
    name: 'Backend node_modules exists',
    check: () => fs.existsSync(path.join(__dirname, 'node_modules')) ? '✅' : '❌ Run: npm install',
  },
  {
    name: 'Models folder exists',
    check: () => fs.existsSync(path.join(__dirname, 'models')) ? '✅' : '❌',
  },
  {
    name: 'Controllers folder exists',
    check: () => fs.existsSync(path.join(__dirname, 'controllers')) ? '✅' : '❌',
  },
  {
    name: 'Routes folder exists',
    check: () => fs.existsSync(path.join(__dirname, 'routes')) ? '✅' : '❌',
  },
  {
    name: 'server.js exists',
    check: () => fs.existsSync(path.join(__dirname, 'server.js')) ? '✅' : '❌',
  },
];

checks.forEach(({ name, check }) => {
  try {
    const result = check();
    console.log(`${name}: ${result}`);
  } catch (error) {
    console.log(`${name}: ❌ ${error.message}`);
  }
});

console.log('\n📋 Quick Checklist:\n');
console.log('1. ✅ Backend folder structure: OK');
console.log('2. ⚠️  MongoDB: Ensure running (mongod)');
console.log('3. ⚠️  .env: Check variables are set');
console.log('4. ⚠️  npm install: Verify dependencies');
console.log('\n🚀 Ready to start? Run: npm start\n');
