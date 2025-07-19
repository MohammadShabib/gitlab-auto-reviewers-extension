/**
 * ReviewerService - Manages reviewer data and operations
 */
class ReviewerService {
  static async load() {
    try {
      const result = await Storage.get(['reviewers']);
      return result.reviewers || {};
    } catch (error) {
      console.error('Failed to load reviewers:', error.message);
      return {};
    }
  }

  static async save(reviewers) {
    try {
      await Storage.set({ reviewers });
    } catch (error) {
      console.error('Failed to save reviewers:', error.message);
      throw error;
    }
  }

  static async clear() {
    try {
      await Storage.set({ reviewers: {} });
      return {};
    } catch (error) {
      console.error('Failed to clear reviewers:', error.message);
      throw error;
    }
  }



  static addReviewer(reviewers, username, selected = true) {
    if (!username || username.length < 2) {
      throw new Error('Invalid username');
    }
    
    // Normalize username for case-insensitive comparison
    const normalizedUsername = username.trim();
    const lowerUsername = normalizedUsername.toLowerCase();
    const existingUsernames = Object.keys(reviewers);
    
    // Check for case-insensitive match
    for (const existing of existingUsernames) {
      if (existing.toLowerCase() === lowerUsername) {
        throw new Error('Reviewer already exists');
      }
    }
    
    return { ...reviewers, [normalizedUsername]: selected };
  }

  static removeReviewer(reviewers, username) {
    if (!reviewers.hasOwnProperty(username)) {
      throw new Error('Reviewer does not exist');
    }
    const updated = { ...reviewers };
    delete updated[username];
    return updated;
  }

  static toggleReviewer(reviewers, username, selected) {
    if (!reviewers.hasOwnProperty(username)) {
      throw new Error('Reviewer does not exist');
    }
    return { ...reviewers, [username]: selected };
  }

  static getSelected(reviewers) {
    return Object.entries(reviewers)
      .filter(([, selected]) => selected)
      .map(([username]) => username);
  }

  static getSorted(reviewers) {
    return Object.entries(reviewers)
      .sort(([a], [b]) => a.localeCompare(b));
  }
} 