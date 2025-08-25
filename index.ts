#!/usr/bin/env bun
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { select, input } from '@inquirer/prompts';
import FuzzySearch from 'fuzzy';
import { getEncoding } from 'js-tiktoken';

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const files: string[] = [];
  let configFile: string | undefined;
  let i = 0;
  
  while (i < args.length) {
    if (args[i] === '-f' || args[i] === '--files') {
      i++; // Skip the flag
      // Collect all files until we hit another flag or end of args
      while (i < args.length && !args[i].startsWith('-')) {
        files.push(args[i]);
        i++;
      }
    } else if (args[i] === '-c' || args[i] === '--config') {
      i++; // Skip the flag
      if (i < args.length && !args[i].startsWith('-')) {
        configFile = args[i];
        i++;
      } else {
        console.error('❌ Error: --config flag requires a config file path');
        process.exit(1);
      }
    } else {
      i++;
    }
  }
  
  return { files, configFile };
}

// Show help information
function showHelp() {
  console.log(`
🚀 Context Engineer CLI - Help
`);
  console.log('Usage:');
  console.log('  bun context-engineer-cli/index.ts [options]\n');
  console.log('Options:');
  console.log('  -f, --files <files...>    Specify files directly (skips interactive selection)');
  console.log('  -c, --config <file>       Load files from a config file (space-separated list)');
  console.log('  -h, --help               Show this help message\n');
  console.log('Examples:');
  console.log('  # Interactive mode');
  console.log('  bun context-engineer-cli/index.ts\n');
  console.log('  # Direct file specification');
  console.log('  bun context-engineer-cli/index.ts -f src/brain.ts src/sense.ts\n');
  console.log('  # Using a config file');
  console.log('  bun context-engineer-cli/index.ts -c context\n');
  console.log('  # Multiple files with absolute paths');
  console.log('  bun context-engineer-cli/index.ts --files /path/to/file1.ts /path/to/file2.ts\n');
}

// Read and parse config file
async function readConfigFile(configPath: string): Promise<string[]> {
  try {
    const fullPath = path.resolve(configPath);
    const content = await fs.readFile(fullPath, 'utf-8');
    
    // Parse space-separated files, handling line breaks and multiple spaces
    const files = content
      .trim()
      .split(/\s+/)
      .filter(file => file.length > 0);
    
    console.log(`📁 Loaded ${files.length} files from config: ${configPath}`);
    return files;
  } catch (error) {
    console.error(`❌ Error reading config file '${configPath}':`, error);
    process.exit(1);
  }
}

// Validate that files exist and are readable
async function validateFiles(files: string[]): Promise<string[]> {
  const validFiles: string[] = [];
  
  for (const file of files) {
    try {
      const fullPath = path.resolve(file);
      await fs.access(fullPath, fs.constants.F_OK | fs.constants.R_OK);
      
      // Check if it's a binary file
      const ext = path.extname(file).toLowerCase();
      if (BINARY_EXTENSIONS.includes(ext)) {
        console.log(`⚠️  Skipping binary file: ${file}`);
        continue;
      }
      
      validFiles.push(file);
    } catch (error) {
      console.error(`❌ File not found or not readable: ${file}`);
    }
  }
  
  return validFiles;
}

// Config
const OUTPUT_FILE = 'context-output.txt';
const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
  '**/*.log',
  '**/*.lock',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/.DS_Store',
  '**/Thumbs.db'
];
const TOKENIZER_ENCODING = 'cl100k_base'; // For GPT-4-like models

// Binary file extensions to skip
const BINARY_EXTENSIONS = [
  '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
  '.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm',
  '.mp3', '.wav', '.flac', '.aac', '.ogg',
  '.zip', '.rar', '.7z', '.tar', '.gz',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx',
  '.exe', '.dll', '.so', '.dylib'
];

// Interactive file selection function
async function selectFilesInteractively(files: string[]): Promise<string[]> {
  const selectedFiles: string[] = [];
  let totalTokens = 0;
  const tokenizer = getEncoding(TOKENIZER_ENCODING);
  let searchTerm = '';

  while (true) {
    const remainingFiles = files.filter(f => !selectedFiles.includes(f));
    
    if (remainingFiles.length === 0) {
      console.log('📝 All files have been selected.');
      break;
    }

    // Filter files based on search term
    let filteredFiles = remainingFiles;
    if (searchTerm) {
      const searchResults = FuzzySearch.filter(searchTerm, remainingFiles);
      filteredFiles = searchResults.map(r => r.string);
    }

    // Create choices with control options and file list
    const controlOptions = [
      { name: '✅ Done selecting files', value: '[Done selecting files]' }
    ];
    
    if (selectedFiles.length > 0) {
      controlOptions.push({ name: '👀 Preview current selection', value: '[Preview current selection]' });
      controlOptions.push({ name: '🗑️  Clear all selections', value: '[Clear all selections]' });
    }
    
    controlOptions.push({ name: '🔍 Search/filter files', value: '[Search files]' });
    
    if (searchTerm) {
      controlOptions.push({ name: `❌ Clear search ("${searchTerm}")`, value: '[Clear search]' });
    }
    
    const fileChoices = filteredFiles.slice(0, 20).map(file => ({
      name: file,
      value: file
    }));
    
    const choices = [...controlOptions, ...fileChoices];
    
    const displayMessage = searchTerm 
      ? `Select a file to add (${selectedFiles.length} selected, ~${totalTokens} tokens, filtered by "${searchTerm}"):` 
      : `Select a file to add (${selectedFiles.length} selected, ~${totalTokens} tokens):`;
    
    const file = await select({
      message: displayMessage,
      choices,
      pageSize: 15
    });

    if (file === '[Search files]') {
      searchTerm = await input({
        message: '🔍 Enter search term to filter files:',
      });
      console.log(`🔍 Filtering files by "${searchTerm}"...\n`);
      continue;
    }

    if (file === '[Clear search]') {
      searchTerm = '';
      console.log('❌ Search cleared.\n');
      continue;
    }

    if (file === '[Done selecting files]') {
      break;
    }

    if (file === '[Preview current selection]') {
      console.log('\n📋 Current selection:');
      selectedFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
      console.log(`📊 Total tokens: ~${totalTokens}\n`);
      continue;
    }

    if (file === '[Clear all selections]') {
      selectedFiles.length = 0;
      totalTokens = 0;
      console.log('🗑️  All selections cleared.\n');
      continue;
    }

    if (selectedFiles.includes(file)) {
      console.log(`⚠️  File ${file} already selected.\n`);
      continue;
    }

    // Read file content and calculate tokens
    try {
      const fullPath = path.join(process.cwd(), file);
      const content = await fs.readFile(fullPath, 'utf-8');
      const wrappedContent = `<${file}>\n${content}\n</${file}>`;
      const tokens = tokenizer.encode(wrappedContent).length;

      selectedFiles.push(file);
      totalTokens += tokens;
      console.log(`✅ Added ${file} (${tokens} tokens). Total: ~${totalTokens} tokens.\n`);
      
      // Warn about large token counts
      if (totalTokens > 100000) {
        console.log('⚠️  Warning: Token count is quite high (>100k). Consider reducing selection for better LLM performance.\n');
      }
    } catch (error) {
      console.error(`❌ Error reading file ${file}:`, error);
      continue;
    }
  }

  return selectedFiles;
}

async function main() {
  // Check for help flag first
  const args = process.argv.slice(2);
  if (args.includes('-h') || args.includes('--help')) {
    showHelp();
    process.exit(0);
  }

  console.log('\n🚀 Welcome to Context Engineer CLI!');
  console.log(`📁 Starting in: ${process.cwd()}\n`);

  try {
    // Parse command line arguments
    const { files: cmdFiles, configFile } = parseArgs();
    let selectedFiles: string[] = [];
    
    if (configFile) {
      // Use files from config file
      console.log('📁 Using files from config file...');
      const configFiles = await readConfigFile(configFile);
      selectedFiles = await validateFiles(configFiles);
      
      if (selectedFiles.length === 0) {
        console.error('❌ No valid files found from config file.');
        process.exit(1);
      }
      
      console.log(`✅ Found ${selectedFiles.length} valid files from config.\n`);
    } else if (cmdFiles.length > 0) {
      // Use files from command line
      console.log('📂 Using files from command line arguments...');
      selectedFiles = await validateFiles(cmdFiles);
      
      if (selectedFiles.length === 0) {
        console.error('❌ No valid files found from command line arguments.');
        process.exit(1);
      }
      
      console.log(`✅ Found ${selectedFiles.length} valid files from arguments.\n`);
    } else {
      // Interactive file selection (existing logic)
      console.log('🔍 Discovering files...');
      const allFiles = await glob('**/*', { 
        cwd: process.cwd(), 
        nodir: true, 
        ignore: IGNORED_PATTERNS 
      });

      // Filter out binary files
      const files = allFiles.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return !BINARY_EXTENSIONS.includes(ext);
      });

      if (files.length === 0) {
        console.error('❌ No suitable files found in this directory.');
        process.exit(1);
      }
      
      console.log(`✅ Found ${files.length} files (${allFiles.length - files.length} binary files excluded).\n`);

      // Interactive file selection logic
      selectedFiles = await selectFilesInteractively(files);
    }

    if (selectedFiles.length === 0) {
      console.log('ℹ️  No files selected. Exiting.');
      process.exit(0);
    }

    // Calculate tokens for selected files
    const tokenizer = getEncoding(TOKENIZER_ENCODING);
    let totalTokens = 0;
    
    for (const file of selectedFiles) {
      try {
        const fullPath = path.resolve(file);
        const content = await fs.readFile(fullPath, 'utf-8');
        const wrappedContent = `<${file}>\n${content}\n</${file}>`;
        const tokens = tokenizer.encode(wrappedContent).length;
        totalTokens += tokens;
      } catch (error) {
        console.error(`❌ Error reading file ${file}:`, error);
        process.exit(1);
      }
    }

    console.log(`📊 Total tokens from selected files: ~${totalTokens}`);
    if (totalTokens > 100000) {
      console.log('⚠️  Warning: Token count is quite high (>100k). Consider reducing selection for better LLM performance.');
    }
    console.log();

    // Step 3: Prompt for request text
    const request = await input({
      message: '💬 Enter the request text:',
      validate: (input: string) => input.trim() ? true : 'Request cannot be empty.',
    });

    // Step 4: Build output
    console.log('\n📝 Building context output...');
    let output = '';
    
    for (const file of selectedFiles) {
      const fullPath = path.resolve(file);
      const content = await fs.readFile(fullPath, 'utf-8');
      output += `<${file}>\n${content}\n</${file}>\n\n`;
    }
    
    output += `<request>\n${request.trim()}\n</request>`;

    // Calculate final token count
    const requestTokens = tokenizer.encode(`<request>\n${request.trim()}\n</request>`).length;
    const finalTokenCount = totalTokens + requestTokens;

    // Step 5: Write to file
    await fs.writeFile(OUTPUT_FILE, output);
    
    console.log('✅ Context engineering complete!');
    console.log(`📄 Output written to: ${OUTPUT_FILE}`);
    console.log(`📊 Final token count: ~${finalTokenCount} tokens`);
    console.log(`📁 Selected files: ${selectedFiles.length}`);
    
    // Show file list
    console.log('\n📋 Files included:');
    selectedFiles.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    
    console.log(`\n🎉 Ready to use with your LLM! Context saved to ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Context engineering cancelled. Goodbye!');
  process.exit(0);
});

main().catch((err) => {
  console.error('💥 Unexpected error:', err);
  process.exit(1);
});