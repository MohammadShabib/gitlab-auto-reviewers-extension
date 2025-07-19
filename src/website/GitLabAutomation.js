/**
 * GitLabAutomation - Handles GitLab UI automation
 */
class GitLabAutomation {
  constructor() {
    this.SELECTORS = {
      REVIEWER_BLOCK: '.block.reviewer',
      DROPDOWN: '.reviewers-dropdown.gl-ml-auto.gl-new-dropdown',
      DROPDOWN_BUTTON: 'button',
      SEARCH_INPUT: '.gl-listbox-search-input',
      DROPDOWN_ITEM: '.gl-new-dropdown-item',
      USERNAME_ELEMENT: '.gl-text-subtle',
      FULL_NAME_ELEMENT: '.gl-whitespace-nowrap.gl-font-bold',
      ASSIGNEE_BLOCK: '.block.assignee'
    };
  }

  async waitForElement(selector, timeout = 2000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await this.sleep(100);
    }
    throw new Error(`Element not found: ${selector}`);
  }

  async waitForReviewerBlock() {
    return new Promise((resolve, reject) => {
      const observer = new MutationObserver(() => {
        const reviewerBlock = document.querySelector(this.SELECTORS.REVIEWER_BLOCK);
        if (reviewerBlock) {
          observer.disconnect();
          resolve(reviewerBlock);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error('Reviewer block not found'));
      }, 10000);
    });
  }

  async clickReviewersDropdown() {
    try {
      const dropdown = await this.waitForElement(this.SELECTORS.DROPDOWN);
      const button = dropdown.querySelector(this.SELECTORS.DROPDOWN_BUTTON);
      if (button) {
        button.click();
        await this.sleep(200);
        return true;
      }
    } catch (error) {
      console.error('Failed to click dropdown:', error.message);
    }
    return false;
  }

  async searchForReviewer(reviewer) {
    try {
      const searchInput = await this.waitForElement(this.SELECTORS.SEARCH_INPUT);
      searchInput.value = '';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      await this.sleep(200);
      searchInput.value = reviewer;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      return true;
    } catch (error) {
      console.error('Failed to search:', error.message);
      return false;
    }
  }

  async findAndClickReviewer(reviewer) {
    const startTime = Date.now();
    while (Date.now() - startTime < 5000) {
      const listItems = document.querySelectorAll(this.SELECTORS.DROPDOWN_ITEM);
      for (const item of listItems) {

        // Search by username
        const usernameElement = item.querySelector(this.SELECTORS.USERNAME_ELEMENT);
        const username = usernameElement?.textContent.trim().replace(/^@/, '').toLowerCase();
        if (username ===  reviewer.toLowerCase()) {
          item.click();
          return true;
        }
        
        // Search by full name
        const fullNameElement = item.querySelector(this.SELECTORS.FULL_NAME_ELEMENT);
        const fullName = fullNameElement?.textContent.trim().toLowerCase();
        if (fullName === (reviewer.toLowerCase())) {
          item.click();
          return true;
        }
      }
      await this.sleep(100);
    }
    console.log('Reviewer not found:', reviewer);
    return false;
  }

  async addReviewer(reviewer) {
    try {
      if (!await this.searchForReviewer(reviewer)) return false;
      return await this.findAndClickReviewer(reviewer);
    } catch (error) {
      console.log('Error adding reviewer:', error.message);
      return false;
    }
  }

  async addReviewers(reviewers) {
    if (!reviewers.length) return;

    try {
      await this.clickReviewersDropdown();
      for (const reviewer of reviewers) {
        await this.addReviewer(reviewer);
        await this.sleep(200);
      }
      await this.clickReviewersDropdown();
      
      const assigneeBlock = document.querySelector(this.SELECTORS.ASSIGNEE_BLOCK);
      if (assigneeBlock) assigneeBlock.click();
    } catch (error) {
      console.error('Error adding reviewers:', error.message);
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 