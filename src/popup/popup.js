/**
 * Popup Script - Simple popup functionality
 */
class PopupManager {
  constructor() {
    this.setupExternalLinks();
  }

  setupExternalLinks() {
    const githubLink = document.getElementById('githubLink');
    const issuesLink = document.getElementById('issuesLink');

    if (githubLink) {
      githubLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ 
          url: 'https://github.com/MohammadShabib/gitlab-auto-reviewers-extension'
        });
      });
    }

    if (issuesLink) {
      issuesLink.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ 
          url: 'https://github.com/MohammadShabib/gitlab-auto-reviewers-extension/issues'
        });
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
}); 