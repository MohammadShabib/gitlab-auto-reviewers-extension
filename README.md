# GitLab Reviewer Auto Add

A Chrome extension that adds a checkbox interface to GitLab merge request pages for quickly selecting and adding reviewers.

## Features

- ✅ Checkbox interface for selecting reviewers
- 💾 Remembers your reviewer preferences 
- ➕ Add/remove reviewers through the interface
- 🔄 Works on all GitLab.com merge request pages

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder

## Screenshots

### GitLab Merge Request Interface
<img width="311" height="448" alt="GitLab MR" src="https://github.com/user-attachments/assets/592d835d-142b-4bdd-b50d-7721646cd4c0" />

### Extension Popup
<img width="294" height="274" alt="Popup" src="https://github.com/user-attachments/assets/2bd7008e-bbcc-4bc5-bc34-4ca6d8ed65a5" />

## Usage

1. Open any GitLab merge request page
2. Find the "Reviewer Auto Add" section in the right sidebar
3. Check the reviewers you want to add
4. Click "Add Selected Reviewers"

## Adding New Reviewers

- Type a username or full name in the input field and click "+"
- Use the "×" button to remove reviewers you no longer need

## Development

```bash
npm install
npm run build
```

Built with Manifest V3 and vanilla JavaScript.

---

Made by Mohammad Shabib 