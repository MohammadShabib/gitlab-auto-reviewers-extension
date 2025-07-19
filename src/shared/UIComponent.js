/**
 * UIComponent - Base class for UI components
 */
class UIComponent {
  constructor() {
    this.reviewers = {};
  }

  async init() {
    try {
      await this.loadReviewers();
      await this.setupEventListeners();
      await this.render();
    } catch (error) {
      console.error('UI initialization failed:', error.message);
    }
  }

  async loadReviewers() {
    try {
      this.reviewers = await ReviewerService.load();
    } catch (error) {
      console.error('Failed to load reviewers:', error.message);
      this.reviewers = {};
    }
  }

  async saveReviewers() {
    try {
      await ReviewerService.save(this.reviewers);
    } catch (error) {
      console.error('Failed to save reviewers:', error.message);
      throw error;
    }
  }

  async addReviewer(username) {
    const updatedReviewers = ReviewerService.addReviewer(this.reviewers, username);
    await ReviewerService.save(updatedReviewers);
    this.reviewers = updatedReviewers;
  }

  async removeReviewer(username) {
    this.reviewers = ReviewerService.removeReviewer(this.reviewers, username);
    await this.saveReviewers();
  }

  async toggleReviewer(username, selected) {
    this.reviewers = ReviewerService.toggleReviewer(this.reviewers, username, selected);
    await this.saveReviewers();
  }



  getSortedReviewers() {
    return ReviewerService.getSorted(this.reviewers);
  }

  getSelectedReviewers() {
    return ReviewerService.getSelected(this.reviewers);
  }

  // Abstract methods - to be implemented by subclasses
  async setupEventListeners() {
    throw new Error('setupEventListeners must be implemented');
  }

  async render() {
    throw new Error('render must be implemented');
  }
} 