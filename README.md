# Context Engineer CLI 🚀

A powerful CLI tool for assembling file contexts for LLM prompts and debugging sessions. Built with Bun/Node.js and TypeScript for speed and type safety.

## Features ✨

- **Interactive File Selection**: Fuzzy-search autocomplete for intuitive file picking
- **Multi-file Support**: Select multiple files with live token counting
- **Smart Filtering**: Automatically excludes binary files and common ignore patterns
- **Token Counting**: Real-time GPT-like tokenization using OpenAI's tiktoken
- **Professional Output**: Clean XML-like format perfect for LLM contexts
- **Performance Optimized**: Built for speed with Bun runtime

## Installation 📦

### Prerequisites
- [Bun](https://bun.sh/) (recommended) or Node.js 16+

### Setup
```bash
# Clone or create the project
mkdir context-engineer-cli && cd context-engineer-cli

# Install dependencies
bun install
# or with npm: npm install
```

## Usage 🛠️

### Command Line Usage
```bash
# Get help and usage information
bun context-engineer-cli/index.ts --help

# Direct file specification (skips interactive selection)
bun context-engineer-cli/index.ts -f src/jarvis/brain.ts src/jarvis/components/sense.ts src/jarvis/components/awareness.ts

# Using a config file with predefined file list
bun context-engineer-cli/index.ts -c context

# Alternative flag syntax
bun context-engineer-cli/index.ts --files file1.ts file2.ts file3.ts
bun context-engineer-cli/index.ts --config my-config-file
```

### Interactive Usage
```bash
# Run the CLI tool interactively
bun context-engineer-cli/index.ts
# or with npm: npm run start
```

### Command Line Arguments
- `-f, --files`: Specify files directly and skip interactive file selection
  - Accepts multiple file paths separated by spaces
  - Supports both relative and absolute paths
  - Automatically validates file existence and readability
  - Skips binary files automatically
- `-c, --config`: Load files from a config file containing a space-separated list
  - Config file should contain file paths separated by spaces or newlines
  - Example config file content: `src/brain.ts src/components/sense.ts docs/readme.md`
  - Supports both relative and absolute paths in config files
  - Automatically validates all files from the config
- `-h, --help`: Display help information and usage examples

### Interactive Workflow

1. **File Discovery**: The tool scans your current directory recursively
2. **File Selection**: Use the interactive autocomplete prompt:
   - Type to search/filter files (fuzzy matching)
   - Select files one by one
   - See live token count updates
   - Use `[Done selecting files]` when finished
3. **Add Request**: Enter your prompt/request text
4. **Output**: Get a formatted `context-output.txt` file

### Config File Format

Config files should contain a space-separated list of file paths. You can use spaces, tabs, or newlines as separators:

```
# Example config file (context)
docs/jarvis_architecture.md src/jarvis/brain.ts src/jarvis/components/sense.ts src/jarvis/components/awareness.ts src/jarvis/components/dialogue-manager.ts src/jarvis/components/memory.ts src/jarvis/components/task-manager.ts src/jarvis/realtime/realtime.ts src/jarvis/realtimes/gemini.ts src/jarvis/realtimes/openrouter.ts src/jarvis/agents/dialogue-agent.ts src/jarvis/agents/agent-registry.ts src/jarvis/agents/base-agent.ts src/app.tsx src/server.ts package.json src/jarvis/types/types.ts
```

Or with newlines for better readability:
```
# Example config file with newlines
docs/jarvis_architecture.md
src/jarvis/brain.ts
src/jarvis/components/sense.ts
src/jarvis/components/awareness.ts
src/jarvis/components/dialogue-manager.ts
# ... more files
```

### Example Output Format
```xml
<src/components/Button.tsx>
import React from 'react';
// ... file content
</src/components/Button.tsx>

<src/hooks/useTheme.ts>
// ... file content  
</src/hooks/useTheme.ts>

<request>
Please review this React component code and suggest improvements for accessibility and performance.
</request>
```

## Features Deep Dive 🔍

### Smart File Filtering
Automatically excludes:
- Binary files (images, videos, executables, etc.)
- `node_modules`, `.git`, `dist`, `build` directories
- Log files, lock files, and OS-generated files

### Token Counting
- Uses OpenAI's `cl100k_base` encoding (GPT-4 compatible)
- Real-time token counting as you select files
- Warnings for large contexts (>100k tokens)
- Final token count in output summary

### Interactive Controls
- `[Done selecting files]` - Finish selection
- `[Preview current selection]` - See selected files and token count
- `[Clear all selections]` - Start over
- Fuzzy search - Type partial names to filter

## Configuration ⚙️

You can modify the configuration at the top of `index.ts`:

```typescript
// Output filename
const OUTPUT_FILE = 'context-output.txt';

// Patterns to ignore during file discovery
const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/.git/**',
  '**/dist/**',
  // ... add more patterns
];

// Tokenizer encoding (change for different models)
const TOKENIZER_ENCODING = 'cl100k_base';
```

## Development 👨‍💻

### Scripts
```bash
# Start the application
bun start

# Development mode with auto-reload
bun run dev
```

### Tech Stack
- **Runtime**: Bun (Node.js compatible)
- **Language**: TypeScript
- **CLI Framework**: Inquirer.js with autocomplete
- **File Operations**: Node.js fs/promises + glob
- **Tokenization**: js-tiktoken
- **Search**: Fuzzy matching

## Best Practices 💡

### For Large Projects
- Use specific file patterns in your search (e.g., type "component" for React components)
- Monitor token counts - most LLMs work best with <100k tokens
- Consider breaking large contexts into smaller, focused ones

### For Better LLM Results
- Be specific in your request text
- Include relevant context about what you're trying to achieve
- Group related files together (e.g., component + its styles + tests)

## Troubleshooting 🔧

### Common Issues

**"No files found"**
- Make sure you're in a directory with files
- Check if all files are being filtered out by ignore patterns

**"Binary file errors"**
- The tool automatically filters binary files
- If you need to include a specific file type, update `BINARY_EXTENSIONS`

**"High token count warnings"**
- Consider selecting fewer files
- Focus on the most relevant files for your task
- Break large requests into smaller, focused ones

### Performance Tips
- For huge repositories (10k+ files), the initial scan might take a moment
- Fuzzy search is optimized and should be fast even with many files
- Use specific search terms to quickly filter to relevant files

## License 📄

MIT License - feel free to use and modify!

## Contributing 🤝

Contributions welcome! Some ideas for improvements:
- Custom output formats
- Directory-specific ignore files
- File content preview
- Integration with popular LLM APIs
- Custom tokenizer support

---

Built with ❤️ for efficient context engineering. Happy prompting! 🎯