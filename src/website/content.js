/**
 * GitLab Auto Reviewers - Content Script
 */
class GitLabAutoReviewers extends UIComponent {
  constructor() {
    super();
    this.gitlabAutomation = new GitLabAutomation();
    this.isInitialized = false;
  }

  async init() {
    try {
      if (this.isInitialized) return;
      await this.loadReviewers();
      await this.gitlabAutomation.waitForReviewerBlock();
      await this.setupEventListeners();
      await this.render();
      this.isInitialized = true;
    } catch (error) {
      console.error('Initialization failed:', error.message);
    }
  }

  async setupEventListeners() {
    // No additional event listeners needed
  }

  async render() {
    this.createUI();
  }

  createCheckboxContainer() {
    const container = document.createElement('div');
    container.className = 'gitlab-auto-reviewers-container';
    
    // Header
    const header = document.createElement('div');
    header.className = 'gitlab-auto-reviewers-header';
    
    const titleContainer = document.createElement('div');
    titleContainer.className = 'gitlab-auto-reviewers-title-container';
    
    const icon = document.createElement('img');
    icon.src = chrome.runtime.getURL('icons/icon32.png');
    icon.alt = 'GitLab Reviewer Auto Add';
    icon.className = 'gitlab-auto-reviewers-icon';
    icon.width = 20;
    icon.height = 20;
    
    const title = document.createElement('h4');
    title.textContent = 'Reviewer Auto Add';
    title.className = 'gitlab-auto-reviewers-title';
    
    titleContainer.appendChild(icon);
    titleContainer.appendChild(title);
    header.appendChild(titleContainer);
    
    // Controls
    const controls = document.createElement('div');
    controls.className = 'gitlab-auto-reviewers-controls';
    
    // Add reviewer input
    const addContainer = document.createElement('div');
    addContainer.className = 'gitlab-auto-reviewers-add-container';
    
    const addInput = document.createElement('input');
    addInput.type = 'text';
    addInput.placeholder = 'Add username or full name';
    addInput.className = 'gitlab-auto-reviewers-add-input';
    
    const addBtn = document.createElement('button');
    addBtn.textContent = '+';
    addBtn.className = 'gitlab-auto-reviewers-add-btn';
    addBtn.addEventListener('click', () => this.handleAddReviewer(addInput));
    
    addInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleAddReviewer(addInput);
      }
    });
    
    addContainer.appendChild(addInput);
    addContainer.appendChild(addBtn);
    
    // Action buttons
    const actionButtonsSection = document.createElement('div');
    actionButtonsSection.className = 'gitlab-auto-reviewers-action-buttons';
    
    const addSelectedBtn = document.createElement('button');
    addSelectedBtn.textContent = 'Add Selected Reviewers';
    addSelectedBtn.className = 'gitlab-auto-reviewers-button primary';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = 'Select All';
    selectAllBtn.className = 'gitlab-auto-reviewers-button secondary';
    
    const clearAllBtn = document.createElement('button');
    clearAllBtn.textContent = 'Clear All';
    clearAllBtn.className = 'gitlab-auto-reviewers-button secondary';
    
    actionButtonsSection.appendChild(addSelectedBtn);
    actionButtonsSection.appendChild(selectAllBtn);
    actionButtonsSection.appendChild(clearAllBtn);
    
    controls.appendChild(addContainer);
    controls.appendChild(actionButtonsSection);
    header.appendChild(controls);
    container.appendChild(header);
    
    // Store references
    container._addSelectedBtn = addSelectedBtn;
    container._selectAllBtn = selectAllBtn;
    container._clearAllBtn = clearAllBtn;

    // Reviewers grid
    const checkboxGrid = document.createElement('div');
    checkboxGrid.className = 'gitlab-auto-reviewers-grid';

    for (const [reviewer, defaultChecked] of this.getSortedReviewers()) {
      const label = document.createElement('div');
      label.className = `gitlab-auto-reviewers-item ${defaultChecked ? 'selected' : ''}`;
      label.dataset.reviewer = reviewer;
      label.dataset.selected = defaultChecked;

      label.addEventListener('click', async (e) => {
        if (e.target.classList.contains('gitlab-auto-reviewers-remove-btn')) {
          return;
        }
        
        const isSelected = label.dataset.selected === 'true';
        const newState = !isSelected;
        
        label.dataset.selected = newState;
        label.classList.toggle('selected', newState);
        
        await this.toggleReviewer(reviewer, newState);
      });

      const span = document.createElement('span');
      span.textContent = reviewer;
      span.className = 'gitlab-auto-reviewers-label';
      
      const removeBtn = document.createElement('button');
      removeBtn.textContent = '×';
      removeBtn.className = 'gitlab-auto-reviewers-remove-btn';
      removeBtn.title = `Remove ${reviewer}`;
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleRemoveReviewer(reviewer);
      });

      label.appendChild(span);
      label.appendChild(removeBtn);
      checkboxGrid.appendChild(label);
    }

    container.appendChild(checkboxGrid);
    
    return container;
  }

  async handleAddReviewer(input) {
    const username = input.value.trim();
    if (!username) {
      alert('Please enter a username');
      return;
    }

    try {
      await this.addReviewer(username);
      input.value = '';
      this.createUI();
    } catch (error) {
      alert(`Failed to add reviewer: ${error.message}`);
      console.error('Add reviewer error:', error);
      console.log('Current reviewers after error:', this.reviewers);
    }
  }

  async handleRemoveReviewer(username) {
    try {
      await this.removeReviewer(username);
      this.createUI();
    } catch (error) {
      alert(`Failed to remove reviewer: ${error.message}`);
    }
  }



  createUI() {
    const reviewerBlock = document.querySelector(this.gitlabAutomation.SELECTORS.REVIEWER_BLOCK);
    if (!reviewerBlock) {
      console.error('Reviewer block not found');
      return;
    }

    // Remove existing UI
    const existingContainer = reviewerBlock.querySelector('.gitlab-auto-reviewers-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    const checkboxContainer = this.createCheckboxContainer();
    
    // Add event listeners
    const addSelectedBtn = checkboxContainer._addSelectedBtn;
    const selectAllBtn = checkboxContainer._selectAllBtn;
    const clearAllBtn = checkboxContainer._clearAllBtn;
    
    addSelectedBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      
      const selectedReviewers = this.getSelectedReviewers();
      
      addSelectedBtn.disabled = true;
      addSelectedBtn.textContent = 'Adding...';
      
      try {
        await this.gitlabAutomation.addReviewers(selectedReviewers);
        addSelectedBtn.textContent = 'Added!';
        setTimeout(() => {
          addSelectedBtn.textContent = 'Add Selected Reviewers';
          addSelectedBtn.disabled = false;
        }, 2000);
      } catch (error) {
        addSelectedBtn.textContent = 'Error - Try Again';
        addSelectedBtn.disabled = false;
      }
    });

    selectAllBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const items = checkboxContainer.querySelectorAll('.gitlab-auto-reviewers-item');
      for (const item of items) {
        const reviewer = item.dataset.reviewer;
        item.dataset.selected = 'true';
        item.classList.add('selected');
        await this.toggleReviewer(reviewer, true);
      }
    });

    clearAllBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const items = checkboxContainer.querySelectorAll('.gitlab-auto-reviewers-item');
      for (const item of items) {
        const reviewer = item.dataset.reviewer;
        item.dataset.selected = 'false';
        item.classList.remove('selected');
        await this.toggleReviewer(reviewer, false);
      }
    });

    reviewerBlock.appendChild(checkboxContainer);
  }
}

// Initialize
let globalAutoReviewers = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    globalAutoReviewers = new GitLabAutoReviewers();
    globalAutoReviewers.init();
  });
} else {
  globalAutoReviewers = new GitLabAutoReviewers();
  globalAutoReviewers.init();
}

// Handle navigation changes
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    setTimeout(() => {
      if (globalAutoReviewers) {
        globalAutoReviewers.init();
      } else {
        globalAutoReviewers = new GitLabAutoReviewers();
        globalAutoReviewers.init();
      }
    }, 1000);
  }
}).observe(document, { subtree: true, childList: true }); 