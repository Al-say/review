---
name: remove-conflict-files
description: "Remove temporary merge conflict artifact files, stage remaining cleanup changes, and commit to GitHub."
user-invocable: true
---

# Remove Conflict Files and Commit to GitHub

Use this skill when you need to clean up merge conflict artifact files left in the repository and make a clean Git commit for the recovery.

## Workflow

1. Identify conflict artifact files in the workspace.
   - Common patterns include filenames containing `冲突文件`, `conflict`, or merge tool suffixes.
   - Also inspect `git status` for untracked or deleted files created during merge recovery.
2. Verify that the conflict artifact files are safe to delete.
   - Do not delete files that are real source files being actively resolved.
   - If any file contains unfinished merge markers (`<<<<<<<`, `=======`, `>>>>>>>`), inspect and resolve it instead of deleting it blindly.
3. Delete the confirmed conflict artifact files.
4. Stage the cleanup changes with `git add` or `git rm` as appropriate.
5. Create a commit describing the cleanup, such as `Remove merge conflict artifact files and clean workspace`.
6. Optionally push the commit to the GitHub remote.

## Quality Checks

- No remaining artifact files with merge conflict suffixes remain in the repository.
- The working tree is clean after staging and committing.
- The commit message clearly explains that this change is a cleanup of merge conflict artifacts.
- If you pushed, confirm the branch is updated on GitHub.

## Use when

- the repository contains temporary conflict files from a merge or rebase
- the goal is to remove those artifacts and submit a clean recovery commit
- you want a reusable workflow for conflict cleanup tasks
