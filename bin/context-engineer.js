#!/usr/bin/env node

// Import and run the main application
import('../dist/index.js').catch(error => {
  console.error('Error loading context-engineer:', error);
  process.exit(1);
});