/**
 * Background Service Worker - Simple extension lifecycle management
 */
importScripts(
  'src/shared/Storage.js',
  'src/shared/ReviewerService.js'
);

class BackgroundManager {
  constructor() {
    this.init();
  }

  init() {
    this.setupInstallHandler();
    this.setupMessageHandler();
  }

  setupInstallHandler() {
    chrome.runtime.onInstalled.addListener(async (details) => {
      try {
        if (details.reason === 'install') {
          await this.handleFirstInstall();
        }
      } catch (error) {
        console.error('Installation failed:', error.message);
      }
    });
  }

  async handleFirstInstall() {
    try {
      await ReviewerService.save({});
      await Storage.set({
        version: chrome.runtime.getManifest().version,
        installDate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save default settings:', error.message);
    }
  }

  setupMessageHandler() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      try {
        switch (message.action) {
          case 'getSettings':
            this.getSettings().then(sendResponse);
            return true;
            
          case 'saveSettings':
            this.saveSettings(message.data).then(sendResponse);
            return true;
            
          default:
            console.warn('Unknown message action:', message.action);
        }
      } catch (error) {
        console.error('Message handler error:', error.message);
        sendResponse({ error: error.message });
      }
    });
  }

  async getSettings() {
    try {
      const reviewers = await ReviewerService.load();
      return { success: true, data: { reviewers } };
    } catch (error) {
      console.error('Failed to get settings:', error.message);
      return { success: false, error: error.message };
    }
  }

  async saveSettings(data) {
    try {
      if (data.reviewers) {
        await ReviewerService.save(data.reviewers);
      } else {
        await Storage.set(data);
      }
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error.message);
      return { success: false, error: error.message };
    }
  }
}

new BackgroundManager(); 