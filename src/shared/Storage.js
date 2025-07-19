/**
 * Storage - Simple Chrome storage operations
 */
class Storage {
  static async get(keys = null) {
    try {
      return await chrome.storage.sync.get(keys);
    } catch (error) {
      console.error('Storage get failed:', error.message);
      throw error;
    }
  }

  static async set(data) {
    try {
      await chrome.storage.sync.set(data);
    } catch (error) {
      console.error('Storage set failed:', error.message);
      throw error;
    }
  }

  static async remove(keys) {
    try {
      await chrome.storage.sync.remove(keys);
    } catch (error) {
      console.error('Storage remove failed:', error.message);
      throw error;
    }
  }
} 