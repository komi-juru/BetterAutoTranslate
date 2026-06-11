# BetterAutoTranslate 🌍

Real-time auto translation plugin for BetterDiscord.

## ✨ Features
* **Two-Way Translation**: Auto-translates incoming messages and your outgoing messages.
* **Google & DeepL**: Built-in free Google Translate, or use your DeepL API key for high accuracy.
* **Channel Specific**: Only runs in the channels you explicitly select.
* **Customizable**: Pick your own translated text color, hide original texts, and use an Ignore Prefix (e.g., `!`) to skip translation for bot commands.

## 🚀 Install
1. Install [BetterDiscord](https://betterdiscord.app/).
2. Download `DiscordAutoTranslate.plugin.js` and drop it into your plugins folder (`Settings > Plugins > Open Plugin Folder`).
3. Enable the plugin and click the **Gear** icon to configure your language and channels.

## ⚠️ Troubleshooting

**Translation not working?** 
AdGuard or Antivirus (HTTPS Filtering) might block the translation API. Please whitelist `translate-pa.googleapis.com` and `api-free.deepl.com` in your security software, or temporarily disable HTTPS filtering for the Discord application.

## 🔒 Privacy Notice
Messages are sent to Google/DeepL for translation. To protect your privacy, **only messages in your configured 'Target Channels' are sent.** All other chats are completely ignored.

---
*Created by [komi-juru](https://github.com/komi-juru)*
