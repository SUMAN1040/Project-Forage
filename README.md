# Project-Forage

A Django-based application for secure clipboard management.

## Environment Setup

To keep this project secure, sensitive information like API keys and database credentials are stored in a `.env` file. 

### Important Note on Security
- The `.env` file is **ignored** by Git and will not be pushed to GitHub.
- If you are setting up this project for the first time, you must create your own `.env` file based on the environment variables required by `settings.py`.

## Git Management

### Ignoring and Removing Files
If a folder (like `library-solidity/`) was already pushed to GitHub but needs to be removed and ignored:

1.  **Add to `.gitignore`**: Add the folder name to the `.gitignore` file.
2.  **Remove from Git Cache**: Run the following command to remove the folder from Git tracking *without* deleting the local files:
    ```bash
    git rm -r --cached library-solidity/
    ```
3.  **Commit and Push**: Stage the changes, commit, and push to GitHub:
    ```bash
    git add .gitignore
    git commit -m "Remove tracked folder and update .gitignore"
    git push origin main
    ```
