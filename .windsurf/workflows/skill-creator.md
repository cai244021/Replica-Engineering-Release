---
description: Create new workflow files with customizable templates
---

# Skill Creator Workflow

This workflow helps you create new workflow files in the `.windsurf/workflows/` directory with proper YAML frontmatter and markdown structure.

## Steps

1. **Determine workflow name and location**
   - Ask user for the workflow name (e.g., `my-workflow`)
   - The file will be created at `.windsurf/workflows/{name}.md`

2. **Gather workflow details**
   - Ask for a short description (one sentence)
   - Ask for the trigger/slash command name (e.g., `/my-command`)
   - Ask for the specific steps to include in the workflow

3. **Create the workflow file**
   - Use the following template structure:
   ```yaml
   ---
   description: [short description]
   ---
   
   # [Workflow Title]
   
   [Detailed steps description]
   - Step 1: [description]
   - Step 2: [description]
   // turbo (mark steps that can be auto-run)
   ```

4. **Verify file creation**
   - Confirm the file was created successfully
   - Show the file path

## Example Usage

User: "Create a workflow for building the project"
Assistant: "I'll create a build-project workflow for you." → Creates `.windsurf/workflows/build-project.md`

## Notes

- Workflow files must be in `.windsurf/workflows/` directory
- File extension must be `.md`
- YAML frontmatter must include `description` field
- Steps can be marked with `// turbo` for auto-running safe commands
