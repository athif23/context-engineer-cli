# Usage Examples 📚

Here are some practical examples of how to use the Context Engineer CLI in real-world scenarios.

## Example 1: React Component Review

**Scenario**: You want an LLM to review your React component for best practices.

**Steps**:
1. Run `bun start` in your project directory
2. Search for your component files (type "component" to filter)
3. Select the main component file (e.g., `Button.tsx`)
4. Select related files (styles, tests, types)
5. Enter request: "Review this React component for accessibility, performance, and best practices"

**Example Output Structure**:
```xml
<src/components/Button.tsx>
// Your component code
</src/components/Button.tsx>

<src/components/Button.module.css>
/* Your styles */
</src/components/Button.module.css>

<request>
Review this React component for accessibility, performance, and best practices
</request>
```

## Example 2: Debugging API Integration

**Scenario**: You're having issues with an API integration and want help debugging.

**Files to include**:
- API client/service files
- Related type definitions
- Error logs or examples
- Configuration files

**Example request**: "I'm getting inconsistent responses from this API. Can you help identify potential issues in my implementation?"

## Example 3: Code Architecture Review

**Scenario**: You want feedback on your application architecture.

**Files to include**:
- Main application entry points
- Core service/utility files
- Configuration files
- Database models or schemas

**Example request**: "Please review this application architecture and suggest improvements for scalability and maintainability."

## Example 4: Using Config Files for Consistent Context

**Scenario**: You frequently work with the same set of files and want to avoid selecting them manually each time.

**Steps**:
1. Create a config file (e.g., `jarvis-context`) with your commonly used files:
   ```
   src/jarvis/brain.ts src/jarvis/components/sense.ts src/jarvis/components/awareness.ts src/jarvis/components/dialogue-manager.ts src/jarvis/components/memory.ts src/jarvis/components/task-manager.ts src/jarvis/realtime/realtime.ts src/jarvis/agents/dialogue-agent.ts src/app.tsx src/server.ts
   ```

2. Use the config file:
   ```bash
   bun context-engineer-cli/index.ts -c jarvis-context
   ```

3. Enter your request when prompted

**Benefits**:
- Consistent file selection across sessions
- Faster workflow for repeated analysis
- Easy to share contexts with team members
- Version control your context configurations

## Example 5: Testing Strategy

**Scenario**: You need help writing comprehensive tests.

**Files to include**:
- The code you want to test
- Existing test files (if any)
- Mock data or fixtures
- Configuration files

**Example request**: "Help me create comprehensive unit and integration tests for these components, including edge cases and error scenarios."

## Tips for Better Results 🎯

### File Selection Strategy
- **Start specific**: Include the main files you're asking about
- **Add context**: Include related types, interfaces, configurations
- **Include examples**: Add test files or usage examples if relevant
- **Watch token count**: Keep under 100k tokens for most LLMs

### Writing Effective Requests
- **Be specific**: "Review for performance" vs "Make this better"
- **Provide context**: Mention your tech stack, constraints, goals
- **Ask for examples**: "Show me how to improve this with code examples"
- **Set scope**: "Focus on the authentication logic" vs general review

### Token Management
- **Large files**: Consider breaking into smaller contexts
- **Multiple features**: Create separate contexts for different features
- **Iterative approach**: Start with core files, then expand based on feedback

## Common Use Cases 🔧

### Frontend Development
```
Files: components/ + styles/ + types/
Request: "Review this component library for consistency and reusability"
```

### Backend API Development
```
Files: routes/ + controllers/ + models/ + middleware/
Request: "Help optimize this API for performance and security"
```

### Full-Stack Feature
```
Files: frontend components + backend endpoints + database schemas
Request: "Review this complete feature implementation for end-to-end correctness"
```

### Bug Investigation
```
Files: failing code + related dependencies + error logs
Request: "Help diagnose why this feature is failing in production"
```

### Performance Optimization
```
Files: performance-critical code + profiling data + configurations
Request: "Suggest optimizations for this performance bottleneck"
```

## Advanced Workflow Tips 💡

### 1. Iterative Development
- Start with a basic context for initial feedback
- Create follow-up contexts with revised code + previous feedback
- Use the LLM's suggestions to guide your next iteration

### 2. Documentation Generation
- Include code files + existing docs
- Request: "Generate comprehensive documentation for this codebase"

### 3. Code Migration
- Include old code + new framework examples
- Request: "Help migrate this code from [old tech] to [new tech]"

### 4. Learning and Onboarding
- Include project files + README + configuration
- Request: "Explain how this codebase works and how to contribute to it"

Happy context engineering! 🚀