/**
 * @name BetterAutoTranslate
 * @author komi-juru
 * @authorLink https://github.com/komi-juru
 * @version 1.0.0
 * @description Provides real-time automatic message translation for specific channels.
 */
module.exports = (() => {
    // === CONFIGURATION ===
    const CONFIG = {
        PLUGIN_NAME: "BetterAutoTranslate",
        TRANSLATION_CLASS: "bd-auto-translate-text",
        SEPARATOR_CLASS: "bd-auto-translate-separator",
        STYLE_ID: "bd-auto-translate-style",
        CLEANING_REGEX: /https?:\/\/\S+|```[\s\S]*?```|`[^`]*`|<a?:\w+:\d+>|\|\|[\s\S]*?\|\||<[^>]+>/g,
        MAX_CACHE_SIZE: 10000,
        CACHE_SAVE_DELAY: 60000,
        CONCURRENCY_LIMIT: 5,
        ERROR_BLACKLIST_TIMEOUT: 60000,
        MAX_ERROR_BLACKLIST: 500,
        TEXT_CHUNK_LIMIT: 1500,
        SCAN_DELAY: 100,
        LANGUAGES: [
            { code: "auto", name: "Auto Detect" },
            { code: "en", name: "English" },
            { code: "ko", name: "Korean" },
            { code: "ja", name: "Japanese" },
            { code: "zh-CN", name: "Chinese (Simplified)" },
            { code: "zh-TW", name: "Chinese (Traditional)" },
            { code: "es", name: "Spanish" },
            { code: "fr", name: "French" },
            { code: "de", name: "German" },
            { code: "ru", name: "Russian" },
            { code: "pt", name: "Portuguese" },
            { code: "it", name: "Italian" },
            { code: "id", name: "Indonesian" },
            { code: "vi", name: "Vietnamese" },
            { code: "th", name: "Thai" },
            { code: "ar", name: "Arabic" },
            { code: "tr", name: "Turkish" },
            { code: "nl", name: "Dutch" },
            { code: "pl", name: "Polish" },
            { code: "hi", name: "Hindi" }
        ],
        DEFAULT_SETTINGS: {
            targetLang: "en", 
            translationEngine: "google",
            deeplApiKey: "",
            showSeparator: true,
            hideOriginal: false,
            translateOutgoing: true,
            ignorePrefix: "!",
            translationColor: "#9aff99",
            channels: [] 
        }
    };

    // === ICONS ===
    const ICONS = {
        globe: `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2s.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2s.07-1.34.16-2h4.68c.09.66.16 1.32.16 2s-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2s-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/></svg>`,
        googlePath: `<path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path>`,
        deeplPath: `<defs><style>.a{fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;}</style></defs><path class="a" d="M37.4956,11.9717,25.0341,4.7771a2.0679,2.0679,0,0,0-2.0682,0L10.5044,11.9717A2.0685,2.0685,0,0,0,9.47,13.7629v14.539a2.0682,2.0682,0,0,0,.8407,1.6645l18.0728,13.33a1.0342,1.0342,0,0,0,1.648-.8323V34.85a1.0343,1.0343,0,0,1,.5171-.8956l6.9468-4.0106A2.0683,2.0683,0,0,0,38.53,28.1522V13.7629A2.0685,2.0685,0,0,0,37.4956,11.9717Z"/><circle class="a" cx="31.3748" cy="21.5382" r="3.0932"/><circle class="a" cx="19.002" cy="15.3518" r="3.0932"/><circle class="a" cx="19.002" cy="27.7246" r="3.0932"/><line class="a" x1="21.7663" y1="26.3424" x2="26.0609" y2="24.1951"/><line class="a" x1="21.7663" y1="16.7339" x2="28.6097" y2="20.1557"/>`,
        offPath: `<path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path>`
    };

    // === I18N ===
    const getLocale = () => {
        try {
            const LocaleStore = BdApi.Webpack.getStore("LocaleStore");
            if (LocaleStore && LocaleStore.locale) return LocaleStore.locale;
        } catch (e) {}
        return document.documentElement.lang || "en-US";
    };

    const I18N = {
        en: {
            pluginDesc: "Real-time message translation",
            dmGroup: "DM/Group",
            unknownChannel: "Unknown Channel",
            currentDm: "Current / DM",
            targetLang: "Target Language",
            targetLangDesc: "Messages will be translated into this language.",
            translation: "Translation",
            translationDesc: "Configure how translations are processed.",
            googleFree: "Google Translate (Free)",
            deeplKey: "DeepL API (Requires Key)",
            deeplPlaceholder: "DeepL API Key (ends with :fx for Free Tier)",
            hide: "HIDE",
            show: "SHOW",
            translateOutgoing: "Translate Outgoing Messages",
            translateOutgoingDesc: "Automatically translate your messages in active channels",
            ignorePrefix: "Ignore Prefix",
            ignorePrefixDesc: "Messages starting with this will not be translated",
            slashNotAllowed: "Slash (/) is not allowed to prevent Discord command conflicts.",
            channels: "Channels",
            channelsDesc: "Add channels and set the source language for each.",
            addBtn: "+ Add",
            noChannels: "No channels added yet",
            enterChannelId: "Please enter a Channel ID.",
            channelAlreadyAdded: "Channel already added.",
            invalidId: "Please select a channel from the list or enter a valid numeric ID.",
            enterValidId: "Please enter a valid numeric ID.",
            save: "\u2713 Save",
            cancel: "Cancel",
            edit: "Edit",
            delete: "Delete",
            added: "Added",
            updatedTo: "Updated to",
            appearance: "Appearance",
            translationColor: "Translation Color",
            translationColorDesc: "Customize the translated text color",
            reset: "Reset",
            showSeparator: "Show Separator Line",
            showSeparatorDesc: "Display a dashed line above translations",
            hideOriginal: "Hide Original Message",
            hideOriginalDesc: "Show only the translated text",
            cacheCleared: "Translation cache cleared.",
            clearCache: "Clear Cache",
            outgoingFailed: "Outgoing translation failed. Sent original text.",
            translationMenu: "Translation Menu",
            searchChannel: "\uD83D\uDD0D Search channel name or paste ID...",
            select: "Select..."
        },
        ko: {
            pluginDesc: "\uC2E4\uC2DC\uAC04 \uBA54\uC2DC\uC9C0 \uBC88\uC5ED",
            dmGroup: "DM/\uADF8\uB8F9",
            unknownChannel: "\uC54C \uC218 \uC5C6\uB294 \uCC44\uB110",
            currentDm: "\uD604\uC7AC / DM",
            targetLang: "\uBC88\uC5ED \uC5B8\uC5B4",
            targetLangDesc: "\uBA54\uC2DC\uC9C0\uAC00 \uC774 \uC5B8\uC5B4\uB85C \uBC88\uC5ED\uB429\uB2C8\uB2E4.",
            translation: "\uBC88\uC5ED \uC124\uC815",
            translationDesc: "\uBC88\uC5ED \uCC98\uB9AC \uBC29\uC2DD\uC744 \uC124\uC815\uD569\uB2C8\uB2E4.",
            googleFree: "Google \uBC88\uC5ED (\uBB34\uB8CC)",
            deeplKey: "DeepL API (\uD0A4 \uD544\uC694)",
            deeplPlaceholder: "DeepL API \uD0A4 (\uBB34\uB8CC \uD50C\uB79C\uC740 :fx\uB85C \uB05D\uB0A8)",
            hide: "\uC228\uAE30\uAE30",
            show: "\uBCF4\uAE30",
            translateOutgoing: "\uBCF4\uB0B4\uB294 \uBA54\uC2DC\uC9C0 \uBC88\uC5ED",
            translateOutgoingDesc: "\uD65C\uC131\uD654\uB41C \uCC44\uB110\uC5D0\uC11C \uB0B4 \uBA54\uC2DC\uC9C0\uB97C \uC790\uB3D9\uC73C\uB85C \uBC88\uC5ED\uD569\uB2C8\uB2E4",
            ignorePrefix: "\uBB34\uC2DC \uC811\uB450\uC0AC",
            ignorePrefixDesc: "\uC774 \uBB38\uC790\uB85C \uC2DC\uC791\uD558\uB294 \uBA54\uC2DC\uC9C0\uB294 \uBC88\uC5ED\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4",
            slashNotAllowed: "\uC2AC\uB798\uC2DC(/)\uB294 \uB514\uC2A4\uCF54\uB4DC \uBA85\uB839\uC5B4\uC640 \uCDA9\uB3CC\uD558\uBBC0\uB85C \uC0AC\uC6A9\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4.",
            channels: "\uCC44\uB110",
            channelsDesc: "\uCC44\uB110\uC744 \uCD94\uAC00\uD558\uACE0 \uAC01 \uCC44\uB110\uC758 \uC18C\uC2A4 \uC5B8\uC5B4\uB97C \uC124\uC815\uD569\uB2C8\uB2E4.",
            addBtn: "+ \uCD94\uAC00",
            noChannels: "\uCD94\uAC00\uB41C \uCC44\uB110\uC774 \uC5C6\uC2B5\uB2C8\uB2E4",
            enterChannelId: "\uCC44\uB110 ID\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.",
            channelAlreadyAdded: "\uC774\uBBF8 \uCD94\uAC00\uB41C \uCC44\uB110\uC785\uB2C8\uB2E4.",
            invalidId: "\uBAA9\uB85D\uC5D0\uC11C \uCC44\uB110\uC744 \uC120\uD0DD\uD558\uAC70\uB098 \uC720\uD6A8\uD55C \uC22B\uC790 ID\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.",
            enterValidId: "\uC720\uD6A8\uD55C \uC22B\uC790 ID\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694.",
            save: "\u2713 \uC800\uC7A5",
            cancel: "\uCDE8\uC18C",
            edit: "\uD3B8\uC9D1",
            delete: "\uC0AD\uC81C",
            added: "\uCD94\uAC00\uB428",
            updatedTo: "\uBCC0\uACBD\uB428:",
            appearance: "\uC678\uAD00",
            translationColor: "\uBC88\uC5ED \uD14D\uC2A4\uD2B8 \uC0C9\uC0C1",
            translationColorDesc: "\uBC88\uC5ED\uB41C \uD14D\uC2A4\uD2B8\uC758 \uC0C9\uC0C1\uC744 \uBCC0\uACBD\uD569\uB2C8\uB2E4",
            reset: "\uCD08\uAE30\uD654",
            showSeparator: "\uAD6C\uBD84\uC120 \uD45C\uC2DC",
            showSeparatorDesc: "\uBC88\uC5ED \uC704\uC5D0 \uC810\uC120\uC744 \uD45C\uC2DC\uD569\uB2C8\uB2E4",
            hideOriginal: "\uC6D0\uBCF8 \uBA54\uC2DC\uC9C0 \uC228\uAE30\uAE30",
            hideOriginalDesc: "\uBC88\uC5ED\uB41C \uD14D\uC2A4\uD2B8\uB9CC \uD45C\uC2DC\uD569\uB2C8\uB2E4",
            cacheCleared: "\uBC88\uC5ED \uCE90\uC2DC\uAC00 \uC0AD\uC81C\uB418\uC5C8\uC2B5\uB2C8\uB2E4.",
            clearCache: "\uCE90\uC2DC \uC0AD\uC81C",
            outgoingFailed: "\uBC1C\uC2E0 \uBC88\uC5ED\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4. \uC6D0\uBCF8 \uD14D\uC2A4\uD2B8\uB85C \uC804\uC1A1\uD569\uB2C8\uB2E4.",
            translationMenu: "\uBC88\uC5ED \uBA54\uB274",
            searchChannel: "\uD83D\uDD0D \uCC44\uB110 \uC774\uB984 \uAC80\uC0C9 \uB610\uB294 ID \uC785\uB825...",
            select: "\uC120\uD0DD..."
        }
    };

    const t = (key) => {
        const locale = getLocale();
        const lang = locale.startsWith("ko") ? "ko" : "en";
        return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
    };

    // === UTILITIES ===
    const Utils = {
        _channelStore: undefined,
        _channelIdStore: undefined,
        hashString: (str) => {
            let hash = 5381;
            for (let i = 0; i < str.length; i++) {
                hash = (hash * 33) ^ str.charCodeAt(i);
            }
            return str.length + "_" + (hash >>> 0).toString(16);
        },
        getCurrentChannelId: () => {
            if (Utils._channelIdStore === undefined) {
                try {
                    if (global.BdApi && BdApi.Webpack) {
                        const m = BdApi.Webpack.getModule(m => m && m.getChannelId && m.getVoiceChannelId);
                        Utils._channelIdStore = m || null;
                    } else {
                        Utils._channelIdStore = null;
                    }
                } catch (e) {
                    Utils._channelIdStore = null;
                }
            }
            
            if (Utils._channelIdStore) {
                const channelId = Utils._channelIdStore.getChannelId();
                if (channelId) return channelId;
            }

            const parts = window.location.pathname.split("/");
            if (parts.length >= 4 && parts[1] === "channels") {
                return parts[3];
            }
            return null;
        },
        getChannelName: (id) => {
            if (Utils._channelStore === undefined) {
                try {
                    if (global.BdApi && BdApi.Webpack) {
                        const s = BdApi.Webpack.getStore("ChannelStore");
                        Utils._channelStore = s || null;
                    } else {
                        Utils._channelStore = null;
                    }
                } catch (e) {
                    Utils._channelStore = null;
                }
            }
            
            if (Utils._channelStore) {
                const channel = Utils._channelStore.getChannel(id);
                if (channel) {
                    if (channel.name) return `#${channel.name}`;
                    if (channel.type === 1 || channel.type === 3) return t('dmGroup');
                }
            }
            return t('unknownChannel');
        },
        searchChannels: (query) => {
            if (!query) return [];
            query = query.toLowerCase();
            const results = [];
            
            try {
                const GuildStore = global.BdApi && BdApi.Webpack ? BdApi.Webpack.getStore("GuildStore") : null;
                const ChannelStore = global.BdApi && BdApi.Webpack ? BdApi.Webpack.getStore("ChannelStore") : null;
                
                if (!GuildStore || !ChannelStore) return [];

                const guilds = GuildStore.getGuilds();
                
                for (const guildId in guilds) {
                    const guild = guilds[guildId];
                    const channels = ChannelStore.getMutableGuildChannelsForGuild ? ChannelStore.getMutableGuildChannelsForGuild(guildId) : null;
                    if (channels) {
                        for (const channelId in channels) {
                            const channel = channels[channelId];
                            if (channel.type === 0 && channel.name && channel.name.toLowerCase().includes(query)) {
                                results.push({
                                    id: channel.id,
                                    name: `#${channel.name}`,
                                    guildName: guild.name
                                });
                            }
                        }
                    }
                }
                
                const currentId = Utils.getCurrentChannelId();
                if (currentId) {
                    const currentChannel = ChannelStore.getChannel(currentId);
                    if (currentChannel && currentChannel.name && currentChannel.name.toLowerCase().includes(query) && !results.find(c => c.id === currentId)) {
                        results.push({
                            id: currentChannel.id,
                            name: currentChannel.type === 1 || currentChannel.type === 3 ? t('dmGroup') : `#${currentChannel.name}`,
                            guildName: t('currentDm')
                        });
                    }
                }
            } catch (e) {
                console.error("AutoTranslate searchChannels error:", e);
            }
            
            return results.slice(0, 15);
        }
    };

    // === MODULES ===
    class CacheManager {
        constructor() {
            this.cache = new Map();
            this.isDirty = false;
            this.timer = null;
        }

        load() {
            try {
                const saved = BdApi.Data.load(CONFIG.PLUGIN_NAME, "cache");
                if (saved && Array.isArray(saved)) {
                    this.cache = new Map(saved);
                }
            } catch (e) {}
        }

        save() {
            if (!this.isDirty) return;
            if (this.timer) clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.forceSave();
            }, CONFIG.CACHE_SAVE_DELAY);
        }

        forceSave() {
            try { 
                BdApi.Data.save(CONFIG.PLUGIN_NAME, "cache", Array.from(this.cache.entries())); 
                this.isDirty = false;
            } catch (e) {}
        }

        get(key) {
            if (this.cache.has(key)) {
                const value = this.cache.get(key);
                this.cache.delete(key);
                this.cache.set(key, value);
                return value;
            }
            return null;
        }

        set(key, value) {
            if (this.cache.size >= CONFIG.MAX_CACHE_SIZE) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }
            this.cache.set(key, value);
            this.isDirty = true;
            this.save();
        }

        clear() {
            this.cache.clear();
            this.isDirty = true;
            this.save();
        }

        getSize() {
            return this.cache.size;
        }

        stop() {
            if (this.timer && this.isDirty) {
                clearTimeout(this.timer);
                this.timer = null;
                this.forceSave();
            }
        }
    }

    class TranslationEngine {
        constructor(cacheManager, settingsManager) {
            this.cacheManager = cacheManager;
            this.settingsManager = settingsManager;
            this.errorBlacklist = new Map();
            this.abortController = new AbortController();
        }

        stop() {
            this.abortController.abort();
            this.abortController = new AbortController();
        }

        resetAbortController() {
            this.abortController.abort();
            this.abortController = new AbortController();
        }

        async translateWithGooglePa(text, sourceLang, targetLang) {
            const url = new URL("https://translate-pa.googleapis.com/v1/translate");
            url.searchParams.set("params.client", "gtx");
            url.searchParams.set("dataTypes", "TRANSLATION");
            url.searchParams.set("key", "AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA");
            url.searchParams.set("query.sourceLanguage", sourceLang === "auto" ? "auto" : sourceLang);
            url.searchParams.set("query.targetLanguage", targetLang);
            url.searchParams.set("query.text", text);

            const response = await fetch(url.toString(), { 
                method: "GET", 
                headers: { "Accept": "application/json" },
                signal: this.abortController.signal
            });

            if (!response.ok) throw new Error(`Google PA API error: ${response.status}`);
            
            const data = await response.json();
            if (data && data.translation) {
                return data.translation;
            }
            throw new Error("Invalid response format from Google PA");
        }

        async translateWithDeepL(text, sourceLang, targetLang) {
            const apiKey = this.settingsManager.settings.deeplApiKey;
            if (!apiKey) throw new Error("DeepL API Key is missing. Please configure it in the settings.");
            
            const isFree = apiKey.endsWith(":fx");
            const endpoint = isFree ? "https://api-free.deepl.com/v2/translate" : "https://api.deepl.com/v2/translate";
            
            let deepLTarget = targetLang.toUpperCase();
            if (deepLTarget === "EN") deepLTarget = "EN-US";
            if (deepLTarget === "ZH-CN" || deepLTarget === "ZH-TW") deepLTarget = "ZH";
            
            const body = new URLSearchParams();
            body.append("text", text);
            body.append("target_lang", deepLTarget);
            if (sourceLang !== "auto") {
                let deepLSource = sourceLang.toUpperCase();
                if (deepLSource === "ZH-CN" || deepLSource === "ZH-TW") deepLSource = "ZH";
                body.append("source_lang", deepLSource);
            }

            const fetchFn = (typeof BdApi !== "undefined" && BdApi.Net && BdApi.Net.fetch) ? BdApi.Net.fetch : fetch;
            const response = await fetchFn(endpoint, {
                method: "POST",
                headers: {
                    "Authorization": "DeepL-Auth-Key " + apiKey,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: body.toString(),
                signal: this.abortController.signal
            });

            if (!response.ok) throw new Error(`DeepL API error: ${response.status}`);
            
            const data = await response.json();
            if (data && data.translations && data.translations.length > 0) {
                return data.translations[0].text;
            }
            throw new Error("Invalid response format from DeepL");
        }

        async translate(text, sourceLang, targetLang) {
            const engine = this.settingsManager.settings.translationEngine;
            if (engine === "deepl") {
                return await this.translateWithDeepL(text, sourceLang, targetLang);
            }
            return await this.translateWithGooglePa(text, sourceLang, targetLang);
        }

        async chunkTextAndTranslate(text, sourceLang, targetLang) {
            if (text.length <= CONFIG.TEXT_CHUNK_LIMIT) {
                return await this.translate(text, sourceLang, targetLang);
            }
            
            const chunks = [];
            let currentChunk = "";
            const lines = text.split('\n');
            
            for (const line of lines) {
                if (currentChunk.length + line.length > CONFIG.TEXT_CHUNK_LIMIT) {
                    if (currentChunk) chunks.push(currentChunk);
                    currentChunk = line;
                } else {
                    currentChunk += (currentChunk ? '\n' : '') + line;
                }
            }
            if (currentChunk) chunks.push(currentChunk);

            let translatedText = "";
            for (const chunk of chunks) {
                const translatedChunk = await this.translate(chunk, sourceLang, targetLang);
                translatedText += (translatedText ? '\n' : '') + translatedChunk;
            }
            return translatedText;
        }
    }

    class UIManager {
        constructor(plugin, settingsManager, cacheManager) {
            this.plugin = plugin;
            this.settingsManager = settingsManager;
            this.cacheManager = cacheManager;
            this.lastErrorToast = 0;
        }

        injectStyle() {
            const css = `
                :root {
                    --bd-auto-translate-color: ${this.settingsManager.settings.translationColor || "#9aff99"};
                }
                .${CONFIG.SEPARATOR_CLASS} {
                    border-top: 1px dashed rgba(255, 255, 255, 0.15);
                    height: 1px;
                    margin: 6px 0 4px 0;
                    width: 100%;
                }
                .${CONFIG.TRANSLATION_CLASS} {
                    color: var(--bd-auto-translate-color);
                    font-size: 0.95em;
                    margin-top: 2px;
                    opacity: 0.96;
                    white-space: pre-wrap;
                    line-height: 1.375rem;
                }
                
                /* Header Button Styles */
                #bd-translate-header-btn {
                    color: var(--interactive-normal);
                }

                  .bd-translate-dropdown {
                    opacity: 0;
                    pointer-events: none;
                    transform: translateX(-50%) translateY(-6px);
                    transition: opacity 0.15s ease, transform 0.15s ease;
                }
                .bd-translate-dropdown.open {
                    opacity: 1;
                    pointer-events: auto;
                    transform: translateX(-50%) translateY(0);
                }
                  .bd-translate-item { 
                      transition: background 0.1s, color 0.1s; 
                      font-weight: 500; 
                      background: transparent; 
                      color: var(--interactive-normal);
                  }
                  .bd-translate-item:hover { 
                      background: var(--background-modifier-hover) !important; 
                      color: var(--interactive-hover);
                  }
                  .bd-translate-item[data-active="true"] { 
                      background: var(--background-modifier-selected) !important; 
                      font-weight: 700 !important; 
                  }
                  #bd-translate-menu-google:hover { color: var(--brand-experiment, #5865F2) !important; }
                  #bd-translate-menu-deepl:hover { color: var(--text-positive, #43b581) !important; }
                  #bd-translate-menu-off:hover { color: var(--text-danger) !important; }
            `;

            if (global.BdApi && BdApi.DOM && BdApi.DOM.addStyle) {
                BdApi.DOM.addStyle(CONFIG.STYLE_ID, css);
            } else {
                let style = document.getElementById(CONFIG.STYLE_ID);
                if (!style) {
                    style = document.createElement("style");
                    style.id = CONFIG.STYLE_ID;
                    document.head.appendChild(style);
                }
                if (style.textContent !== css) {
                    style.textContent = css;
                }
            }
        }

        removeStyle() {
            if (global.BdApi && BdApi.DOM && BdApi.DOM.removeStyle) {
                BdApi.DOM.removeStyle(CONFIG.STYLE_ID);
            }
            const styleEl = document.getElementById(CONFIG.STYLE_ID);
            if (styleEl) styleEl.remove();
        }

        showToast(content, type = "info") {
            try { BdApi.UI.showToast(content, { type }); } catch (e) {}
        }

        showErrorToast(msg) {
            if (!this.lastErrorToast || Date.now() - this.lastErrorToast > 3000) {
                this.showToast(msg, "error");
                this.lastErrorToast = Date.now();
            }
        }

        getSettingsPanel() {
            const ce = BdApi.React.createElement;
            const { useState, useEffect, useRef } = BdApi.React;

            const ToggleSwitch = ({ checked, onChange }) => {
                return ce("div", {
                    onClick: () => onChange(!checked),
                    style: {
                        width: "44px", height: "24px", borderRadius: "12px", cursor: "pointer",
                        background: checked ? "#5865F2" : (document.documentElement.classList.contains("theme-light") ? "#80848e" : "#4e5058"),
                        position: "relative", transition: "background 0.2s ease", flexShrink: 0
                    }
                },
                    ce("div", {
                        style: {
                            width: "18px", height: "18px", borderRadius: "50%", background: "#ffffff",
                            position: "absolute", top: "3px",
                            left: checked ? "23px" : "3px",
                            transition: "left 0.2s ease",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.3)"
                        }
                    })
                );
            };

            const ChromeStyleColorPicker = ({ value, onChange }) => {
                const [isOpen, setIsOpen] = useState(false);
                const [hexValue, setHexValue] = useState(value);
                const popoverRef = useRef(null);

                const presets = [
                    "#FFFFFF", "#B9BBBE", "#72767D", "#4F545C", "#202225", "#000000",
                    "#9AFF99", "#43B581", "#2D7D46", "#8DB1F5", "#5865F2", "#4752c4",
                    "#FEE75C", "#F5C277", "#E57373", "#EB459E", "#A652BB", "#9B59B6"
                ];

                useEffect(() => {
                    if (!isOpen) return;
                    const handleClick = (e) => {
                        if (popoverRef.current && !popoverRef.current.contains(e.target)) setIsOpen(false);
                    };
                    document.addEventListener("mousedown", handleClick);
                    return () => document.removeEventListener("mousedown", handleClick);
                }, [isOpen]);

                useEffect(() => { setHexValue(value); }, [value]);

                return ce("div", { style: { position: "relative", display: "inline-block" } },
                    ce("div", {
                        onClick: () => {
                            if (!isOpen) setHexValue(value);
                            setIsOpen(!isOpen);
                        },
                        style: {
                            width: "36px", height: "36px", background: value,
                            border: "3px solid rgba(255,255,255,0.1)", borderRadius: "8px",
                            cursor: "pointer", transition: "border-color 0.2s, transform 0.15s",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                        },
                        onMouseOver: (e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "scale(1.05)"; },
                        onMouseOut: (e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.transform = "scale(1)"; }
                    }),
                    isOpen && ce("div", {
                        ref: popoverRef,
                        style: {
                            position: "absolute", top: "100%", right: "0", marginTop: "8px",
                            background: document.documentElement.classList.contains("theme-light") ? "#ffffff" : "#313338", border: "1px solid var(--border-strong)",
                            borderRadius: "8px", padding: "12px", zIndex: 9999,
                            display: "flex", flexDirection: "column", gap: "10px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.6)", width: "max-content"
                        }
                    },
                        ce("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, 28px)", gap: "6px" } },
                            presets.map(c => ce("div", {
                                key: c,
                                onClick: () => { 
                                    setHexValue(c); 
                                    onChange(c);
                                    setIsOpen(false);
                                },
                                style: {
                                    width: "28px", height: "28px", background: c, borderRadius: "6px",
                                    border: hexValue.toLowerCase() === c.toLowerCase() ? "2px solid var(--header-primary)" : "2px solid transparent",
                                    cursor: "pointer", boxSizing: "border-box", transition: "transform 0.15s, border-color 0.15s"
                                },
                                onMouseOver: (e) => e.currentTarget.style.transform = "scale(1.15)",
                                onMouseOut: (e) => e.currentTarget.style.transform = "scale(1)",
                                title: c
                            }))
                        ),
                        ce("div", { style: { display: "flex", gap: "8px", alignItems: "center" } },
                            ce("div", { 
                                style: { 
                                    position: "relative", width: "24px", height: "24px", 
                                    borderRadius: "4px", overflow: "hidden", border: "1px solid var(--border-strong)", flexShrink: 0 
                                },
                                title: "Custom Color Picker"
                            },
                                ce("input", {
                                    type: "color",
                                    value: (hexValue.startsWith("#") && hexValue.length === 7) ? hexValue : "#ffffff",
                                    onChange: (e) => setHexValue(e.target.value),
                                    style: {
                                        position: "absolute", top: "-5px", left: "-5px", width: "34px", height: "34px", cursor: "pointer", border: "none", padding: 0
                                    }
                                })
                            ),
                            ce("input", {
                                type: "text", value: hexValue,
                                onChange: (e) => setHexValue(e.target.value),
                                style: {
                                    background: "var(--background-tertiary)", color: "var(--header-primary)",
                                    border: "1px solid var(--border-strong)", padding: "6px 8px",
                                    fontSize: "13px", fontFamily: "'Consolas', 'Monaco', monospace",
                                    outline: "none", borderRadius: "6px", flex: 1, boxSizing: "border-box"
                                }
                            }),
                            ce("button", {
                                onClick: () => {
                                    let val = hexValue;
                                    if (!val.startsWith("#")) val = "#" + val;
                                    if (/^#[0-9A-Fa-f]{3,6}$/.test(val)) { onChange(val); setIsOpen(false); }
                                },
                                style: {
                                    background: "#5865F2", color: "#ffffff", border: "none",
                                    padding: "6px 14px", fontSize: "12px", borderRadius: "6px",
                                    cursor: "pointer", fontWeight: "600", transition: "background 0.15s"
                                },
                                onMouseOver: (e) => e.currentTarget.style.background = "#4752c4",
                                onMouseOut: (e) => e.currentTarget.style.background = "#5865F2"
                            }, "Apply")
                        )
                    )
                );
            };

            const ChannelSearchDropdown = ({ value, onChange, onEnter }) => {
                const [query, setQuery] = useState(value);
                const [results, setResults] = useState([]);
                const [isOpen, setIsOpen] = useState(false);
                const wrapperRef = useRef(null);

                useEffect(() => { setQuery(value); }, [value]);

                useEffect(() => {
                    const handleClick = (e) => {
                        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
                    };
                    document.addEventListener("mousedown", handleClick);
                    return () => document.removeEventListener("mousedown", handleClick);
                }, []);

                const handleSearch = (e) => {
                    const val = e.target.value;
                    setQuery(val);
                    onChange(val);
                    if (val.trim().length >= 1) {
                        const res = Utils.searchChannels(val);
                        setResults(res);
                        setIsOpen(res.length > 0);
                    } else {
                        setIsOpen(false);
                    }
                };

                return ce("div", { ref: wrapperRef, style: { position: "relative", flex: 1 } },
                    ce("input", {
                        type: "text",
                        placeholder: t('searchChannel'),
                        value: query,
                        onChange: handleSearch,
                        onKeyDown: (e) => { if (e.key === "Enter") { setIsOpen(false); onEnter(); } },
                        style: {
                            boxSizing: "border-box", padding: "10px 14px", borderRadius: "8px",
                            background: "var(--input-background)", color: "var(--text-normal, #dbdee1)",
                            border: "1px solid var(--border-subtle)", fontSize: "14px",
                            outline: "none", width: "100%", transition: "border-color 0.2s"
                        },
                        onFocus: (e) => { e.currentTarget.style.borderColor = "rgba(88,101,242,0.5)"; },
                        onBlur: (e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }
                    }),
                    isOpen && ce("div", {
                        style: {
                            position: "absolute", top: "100%", left: 0, width: "100%",
                            background: document.documentElement.classList.contains("theme-light") ? "#ffffff" : "#313338", border: "1px solid var(--border-subtle)",
                            borderRadius: "8px", marginTop: "4px", zIndex: 100,
                            maxHeight: "350px", overflowY: "auto",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                        }
                    },
                        results.map(res => ce("div", {
                            key: res.id,
                            onClick: () => { setQuery(res.id); onChange(res.id); setIsOpen(false); },
                            style: {
                                padding: "10px 14px", cursor: "pointer",
                                borderBottom: "1px solid var(--border-subtle)",
                                display: "flex", justifyContent: "space-between", alignItems: "center",
                                transition: "background 0.1s"
                            },
                            onMouseOver: (e) => e.currentTarget.style.background = "var(--background-message-hover)",
                            onMouseOut: (e) => e.currentTarget.style.background = "transparent"
                        },
                            ce("span", { style: { color: "var(--header-primary)", fontSize: "14px", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 } }, res.name),
                            ce("span", { style: { color: "var(--text-muted)", fontSize: "12px", marginLeft: "12px", flexShrink: 0 } }, res.guildName)
                        ))
                    )
                );
            };

            const CustomSelectDropdown = ({ value, options, onChange, style }) => {
                const [isOpen, setIsOpen] = useState(false);
                const wrapperRef = useRef(null);

                useEffect(() => {
                    const handleClick = (e) => {
                        if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
                    };
                    document.addEventListener("mousedown", handleClick);
                    return () => document.removeEventListener("mousedown", handleClick);
                }, []);

                const selectedOption = options.find(o => o.value === value);

                return ce("div", { ref: wrapperRef, style: Object.assign({ position: "relative" }, style) },
                    ce("div", {
                        onClick: () => setIsOpen(!isOpen),
                        style: {
                            boxSizing: "border-box", padding: "10px 14px", borderRadius: "8px",
                            background: "var(--input-background)", color: "var(--text-normal, #dbdee1)",
                            border: "1px solid var(--border-subtle)", fontSize: "14px",
                            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                            transition: "border-color 0.2s, background 0.2s",
                            height: "100%", minHeight: "42px"
                        },
                        onMouseOver: (e) => { e.currentTarget.style.borderColor = "rgba(88,101,242,0.5)"; e.currentTarget.style.background = "var(--background-modifier-selected)"; },
                        onMouseOut: (e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "var(--input-background)"; }
                    },
                        ce("span", null, selectedOption ? selectedOption.label : t('select')),
                        ce("span", { style: { fontSize: "10px", opacity: 0.6, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" } }, "▼")
                    ),
                    isOpen && ce("div", {
                        style: {
                            position: "absolute", top: "100%", left: 0, width: "100%",
                            background: document.documentElement.classList.contains("theme-light") ? "#ffffff" : "#313338", border: "1px solid var(--border-subtle)",
                            borderRadius: "8px", marginTop: "4px", zIndex: 100,
                            maxHeight: "350px", overflowY: "auto",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
                        }
                    },
                        options.map(opt => ce("div", {
                            key: opt.value,
                            onClick: () => { onChange(opt.value); setIsOpen(false); },
                            style: {
                                padding: "10px 14px", cursor: "pointer",
                                borderBottom: "1px solid var(--border-subtle)",
                                color: opt.value === value ? "var(--header-primary)" : "var(--text-normal)",
                                background: opt.value === value ? "var(--background-modifier-selected)" : "transparent",
                                transition: "background 0.1s"
                            },
                            onMouseOver: (e) => { if (opt.value !== value) e.currentTarget.style.background = "var(--background-message-hover)"; },
                            onMouseOut: (e) => { if (opt.value !== value) e.currentTarget.style.background = "transparent"; }
                        }, opt.label))
                    )
                );
            };

            const SectionHeader = ({ icon, title, subtitle }) => {
                return ce("div", { style: { marginBottom: "16px" } },
                    ce("div", { style: { display: "flex", alignItems: "center", gap: "8px", marginBottom: subtitle ? "4px" : "0" } },
                        ce("span", { style: { fontSize: "18px", lineHeight: "1" } }, icon),
                        ce("h3", { style: { color: "var(--header-primary)", margin: 0, fontSize: "15px", fontWeight: "600", letterSpacing: "0.02em", textTransform: "uppercase" } }, title)
                    ),
                    subtitle ? ce("p", { style: { color: "var(--text-muted)", fontSize: "13px", margin: 0, lineHeight: "1.4" } }, subtitle) : null
                );
            };

            const SectionDivider = () => {
                return ce("div", { style: { height: "1px", background: "var(--background-modifier-active)", margin: "24px 0" } });
            };

            const SettingsPanel = () => {
                const [targetLang, setTargetLang] = useState(this.settingsManager.settings.targetLang);
                const [translationEngine, setTranslationEngine] = useState(this.settingsManager.settings.translationEngine || "google");
                const [deeplApiKey, setDeeplApiKey] = useState(this.settingsManager.settings.deeplApiKey || "");
                const [showApiKey, setShowApiKey] = useState(false);
                const [channels, setChannels] = useState(this.settingsManager.settings.channels || []);
                const [showSeparator, setShowSeparator] = useState(this.settingsManager.settings.showSeparator);
                const [hideOriginal, setHideOriginal] = useState(this.settingsManager.settings.hideOriginal);
                const [translateOutgoing, setTranslateOutgoing] = useState(this.settingsManager.settings.translateOutgoing ?? true);
                const [ignorePrefix, setIgnorePrefix] = useState(this.settingsManager.settings.ignorePrefix || "!");
                const [translationColor, setTranslationColor] = useState(this.settingsManager.settings.translationColor || "#9aff99");
                const timerRef = useRef(null);
                const [inputLang, setInputLang] = useState("auto"); 
                const [editingChannel, setEditingChannel] = useState(null);
                const inputRef = useRef(null);
                const [inputValue, setInputValue] = useState("");
                const [cacheSize, setCacheSize] = useState(this.cacheManager.getSize());

                const updateStateAndSave = (newState, needsRescan = false, onlyStyleUpdate = false) => {
                    this.settingsManager.update(newState);
                    if (newState.translationColor) {
                        document.documentElement.style.setProperty('--bd-auto-translate-color', newState.translationColor);
                        this.injectStyle();
                    }
                    if (onlyStyleUpdate) {
                        return;
                    }
                    if (needsRescan) {
                        setTimeout(() => {
                            document.querySelectorAll('.bd-auto-translate-container').forEach(el => el.remove());
                            document.querySelectorAll('.bd-auto-translate-text').forEach(el => el.remove());
                            document.querySelectorAll('.bd-auto-translate-separator').forEach(el => el.remove());
                            document.querySelectorAll('[data-translated]').forEach(el => el.removeAttribute('data-translated'));
                            if (this.plugin && this.plugin.processDOMNode) {
                                document.querySelectorAll('[id^="message-content-"]').forEach(msg => this.plugin.processDOMNode(msg));
                            }
                        }, 200);
                    }
                };

                const handleAddChannel = () => {
                    const id = inputValue.trim();
                    if (!id) return this.showToast(t('enterChannelId'), "error");
                    if (channels.some(c => c.id === id)) return this.showToast(t('channelAlreadyAdded'), "error");
                    if (!/^\d+$/.test(id)) return this.showToast(t('invalidId'), "error");
                    const newChannels = [].concat(channels, [{ id: id, lang: inputLang }]);
                    setChannels(newChannels); 
                    updateStateAndSave({ channels: newChannels }, true); 
                    setInputValue("");
                    const channelName = Utils.getChannelName(id);
                    this.showToast(t('added') + " " + channelName + " (" + id + ")", "success");
                };

                const selectStyle = {
                    boxSizing: "border-box", padding: "10px 36px 10px 12px", borderRadius: "8px",
                    background: "var(--input-background)", color: "var(--text-normal, #dbdee1)",
                    border: "1px solid var(--border-subtle)", fontSize: "14px", outline: "none",
                    cursor: "pointer", appearance: "none", WebkitAppearance: "none",
                    backgroundImage: "url(\"data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2380848e'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e\")",
                    backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center", backgroundSize: "20px",
                    transition: "border-color 0.2s"
                };

                return ce("div", { style: { padding: "4px 0", fontFamily: "var(--font-primary, 'gg sans', 'Noto Sans', sans-serif)" } },

                    ce("div", {
                        style: {
                            background: "linear-gradient(135deg, rgba(88,101,242,0.15) 0%, rgba(67,181,129,0.10) 100%)",
                            borderRadius: "12px", padding: "20px 24px", marginBottom: "28px",
                            border: "1px solid rgba(88,101,242,0.15)",
                            position: "relative", overflow: "hidden"
                        }
                    },
                        ce("div", { style: {
                            position: "absolute", top: "-20px", right: "-20px", width: "120px", height: "120px",
                            background: "radial-gradient(circle, rgba(88,101,242,0.12) 0%, transparent 70%)",
                            borderRadius: "50%", pointerEvents: "none"
                        } }),
                        ce("div", { style: { display: "flex", alignItems: "center", gap: "14px" } },
                            ce("div", { style: {
                                width: "44px", height: "44px", borderRadius: "12px",
                                background: "linear-gradient(135deg, #5865F2 0%, #43B581 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "22px", flexShrink: 0,
                                boxShadow: "0 4px 12px rgba(88,101,242,0.3)"
                            } }, "\uD83C\uDF10"),
                            ce("div", null,
                                ce("h2", { style: { color: "var(--header-primary)", margin: "0 0 2px 0", fontSize: "18px", fontWeight: "700", letterSpacing: "-0.01em" } }, "BetterAutoTranslate"),
                                ce("span", { style: { color: "var(--text-muted)", fontSize: "12px", fontWeight: "500" } }, "v1.0.0 \u2022 " + t('pluginDesc'))
                            )
                        )
                    ),

                    ce(SectionHeader, { icon: "\uD83C\uDFAF", title: t('targetLang'), subtitle: t('targetLangDesc') }),
                    ce(CustomSelectDropdown, {
                        value: targetLang,
                        onChange: (val) => { setTargetLang(val); updateStateAndSave({ targetLang: val }, true); },
                        options: CONFIG.LANGUAGES.filter((l) => { return l.code !== "auto"; }).map((l) => { return { value: l.code, label: l.name }; }),
                        style: { width: "100%", zIndex: 30 }
                    }),
                    
                    ce(SectionDivider),
                    
                    ce(SectionHeader, { icon: "⚙️", title: t('translation'), subtitle: t('translationDesc') }),
                    ce("div", { style: { display: "flex", gap: "10px", marginBottom: "16px", flexDirection: "column" } },
                        ce(CustomSelectDropdown, {
                            value: translationEngine,
                            onChange: (val) => { setTranslationEngine(val); updateStateAndSave({ translationEngine: val }, true); },
                            options: [
                                { value: "google", label: t('googleFree') },
                                { value: "deepl", label: t('deeplKey') }
                            ]
                        }),
                        translationEngine === "deepl" && ce("div", { style: { position: "relative", display: "flex", alignItems: "center" } },
                            ce("input", {
                                type: showApiKey ? "text" : "password",
                                placeholder: t('deeplPlaceholder'),
                                value: deeplApiKey,
                                onChange: (e) => { setDeeplApiKey(e.target.value); updateStateAndSave({ deeplApiKey: e.target.value }, true); },
                                style: {
                                    boxSizing: "border-box", padding: "10px 48px 10px 14px", borderRadius: "8px",
                                    background: "var(--input-background)", color: "var(--text-normal, #dbdee1)",
                                    border: "1px solid var(--border-subtle)", fontSize: "14px", outline: "none", width: "100%",
                                    transition: "border-color 0.2s"
                                },
                                onFocus: (e) => { e.currentTarget.style.borderColor = "rgba(88,101,242,0.5)"; },
                                onBlur: (e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }
                            }),
                            ce("div", {
                                onClick: () => setShowApiKey(!showApiKey),
                                style: {
                                    position: "absolute", right: "12px", cursor: "pointer",
                                    color: "var(--text-muted)", fontSize: "11px", fontWeight: "bold",
                                    userSelect: "none", padding: "4px", transition: "color 0.2s"
                                },
                                onMouseOver: (e) => e.currentTarget.style.color = "var(--text-normal)",
                                onMouseOut: (e) => e.currentTarget.style.color = "var(--text-muted)"
                            }, showApiKey ? t('hide') : t('show'))
                        ),
                        ce("div", {
                            style: {
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px", borderRadius: "8px",
                                background: "var(--background-modifier-hover)", transition: "background 0.15s",
                                cursor: "pointer"
                            },
                            onClick: () => { setTranslateOutgoing(!translateOutgoing); updateStateAndSave({ translateOutgoing: !translateOutgoing }, false, true); },
                            onMouseOver: (e) => e.currentTarget.style.background = "var(--background-modifier-selected)",
                            onMouseOut: (e) => e.currentTarget.style.background = "var(--background-modifier-hover)"
                        },
                            ce("div", null,
                                ce("div", { style: { color: "var(--text-normal)", fontSize: "14px", fontWeight: "500" } }, t('translateOutgoing')),
                                ce("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" } }, t('translateOutgoingDesc'))
                            ),
                            ce(ToggleSwitch, { checked: translateOutgoing, onChange: function(val) { setTranslateOutgoing(val); updateStateAndSave({ translateOutgoing: val }, false, true); } })
                        ),
                        ce("div", {
                            style: {
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px", borderRadius: "8px",
                                background: "var(--background-modifier-hover)", transition: "background 0.15s"
                            }
                        },
                            ce("div", null,
                                ce("div", { style: { color: "var(--text-normal)", fontSize: "14px", fontWeight: "500" } }, t('ignorePrefix')),
                                ce("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" } }, t('ignorePrefixDesc'))
                            ),
                            ce("input", {
                                type: "text",
                                maxLength: 1,
                                value: ignorePrefix,
                                onChange: (e) => { 
                                    if (e.target.value.includes("/")) return BdApi.UI.showToast(t('slashNotAllowed'), { type: "error" });
                                    setIgnorePrefix(e.target.value); 
                                    updateStateAndSave({ ignorePrefix: e.target.value }, true); 
                                },
                                style: {
                                    boxSizing: "border-box", padding: "8px 12px", borderRadius: "8px",
                                    background: "var(--input-background)", color: "var(--text-normal, #dbdee1)",
                                    border: "1px solid var(--border-subtle)", fontSize: "14px", outline: "none", width: "80px", textAlign: "center",
                                    transition: "border-color 0.2s"
                                },
                                onFocus: (e) => { e.currentTarget.style.borderColor = "rgba(88,101,242,0.5)"; },
                                onBlur: (e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; }
                            })
                        )
                    ),

                    ce(SectionDivider),

                    ce(SectionHeader, { icon: "\uD83D\uDCE2", title: t('channels'), subtitle: t('channelsDesc') }),

                    ce("div", { style: { display: "flex", gap: "8px", marginBottom: "16px", zIndex: 10 } },
                        ce(ChannelSearchDropdown, { value: inputValue, onChange: setInputValue, onEnter: handleAddChannel }),
                        ce(CustomSelectDropdown, {
                            value: inputLang,
                            onChange: (val) => setInputLang(val),
                            options: CONFIG.LANGUAGES.map((l) => { return { value: l.code, label: l.name.split(" ")[0] }; }),
                            style: { minWidth: "140px", width: "auto", flexShrink: 0, zIndex: 20 }
                        }),
                        ce("button", {
                            onClick: handleAddChannel,
                            style: {
                                padding: "10px 20px", background: "#5865F2", color: "#ffffff",
                                border: "none", borderRadius: "8px", cursor: "pointer",
                                fontWeight: "600", fontSize: "14px", transition: "background 0.15s, transform 0.1s",
                                whiteSpace: "nowrap", flexShrink: 0
                            },
                            onMouseOver: (e) => { e.currentTarget.style.background = "#4752c4"; e.currentTarget.style.transform = "translateY(-1px)"; },
                            onMouseOut: (e) => { e.currentTarget.style.background = "#5865F2"; e.currentTarget.style.transform = "translateY(0)"; }
                        }, t('addBtn'))
                    ),
                    
                    ce("div", {
                        style: {
                            display: "flex", flexDirection: "column", gap: "4px",
                            background: "var(--background-secondary)", borderRadius: "10px",
                            padding: channels.length === 0 ? "0" : "6px",
                            border: "1px solid var(--border-subtle)"
                        }
                    },
                        channels.length === 0 
                        ? ce("div", { style: { color: "var(--text-muted)", textAlign: "center", padding: "28px 16px", fontSize: "14px" } },
                            ce("div", { style: { fontSize: "28px", marginBottom: "8px", opacity: "0.5" } }, "\uD83D\uDCED"),
                            t('noChannels')
                          ) 
                        : channels.map((ch) => {
                            if (editingChannel && editingChannel.id === ch.id) {
                                return ce("div", {
                                    key: ch.id,
                                    style: {
                                        display: "flex", gap: "8px", alignItems: "center",
                                        padding: "10px 12px", background: "var(--background-secondary)",
                                        borderRadius: "8px",
                                        border: "1px solid rgba(88,101,242,0.2)"
                                    }
                                },
                                    ce("input", {
                                        value: editingChannel.newId,
                                        onChange: (e) => setEditingChannel({ id: editingChannel.id, newId: e.target.value, newLang: editingChannel.newLang }),
                                        style: {
                                            boxSizing: "border-box", padding: "8px 10px", borderRadius: "6px",
                                            background: "var(--background-tertiary)", color: "var(--text-normal)",
                                            border: "1px solid var(--border-strong)", fontSize: "13px",
                                            outline: "none", flex: 1
                                        }
                                    }),
                                    ce(CustomSelectDropdown, {
                                        value: editingChannel.newLang,
                                        onChange: (val) => setEditingChannel({ id: editingChannel.id, newId: editingChannel.newId, newLang: val }),
                                        options: CONFIG.LANGUAGES.map((l) => { return { value: l.code, label: l.name.split(" ")[0] }; }),
                                        style: { minWidth: "160px", width: "auto", fontSize: "13px" }
                                    }),
                                    ce("button", {
                                        onClick: () => {
                                            if (!/^\d+$/.test(editingChannel.newId)) return this.showToast(t('enterValidId'), "error");
                                            if (editingChannel.newId !== ch.id && channels.some((c) => { return c.id === editingChannel.newId; })) return this.showToast(t('channelAlreadyAdded'), "error");
                                            const newChannels = channels.map((c) => { return c.id === ch.id ? { id: editingChannel.newId, lang: editingChannel.newLang } : c; });
                                            setChannels(newChannels);
                                            updateStateAndSave({ channels: newChannels }, true);
                                            setEditingChannel(null);
                                            this.showToast(t('updatedTo') + " " + Utils.getChannelName(editingChannel.newId), "success");
                                        },
                                        style: {
                                            padding: "7px 14px", background: "#43b581", color: "var(--header-primary)",
                                            border: "none", borderRadius: "6px", cursor: "pointer",
                                            fontSize: "12px", fontWeight: "600", transition: "background 0.15s"
                                        },
                                        onMouseOver: (e) => e.currentTarget.style.background = "#3ca374",
                                        onMouseOut: (e) => e.currentTarget.style.background = "#43b581"
                                    }, t('save')),
                                    ce("button", {
                                        onClick: () => setEditingChannel(null),
                                        style: {
                                            padding: "7px 14px", background: "transparent", color: "var(--interactive-normal)",
                                            border: "1px solid var(--border-strong)", borderRadius: "6px",
                                            cursor: "pointer", fontSize: "12px", fontWeight: "500", transition: "0.15s"
                                        },
                                        onMouseOver: (e) => { e.currentTarget.style.background = "var(--background-modifier-hover)"; },
                                        onMouseOut: (e) => { e.currentTarget.style.background = "transparent"; }
                                    }, t('cancel'))
                                );
                            }

                            const langObj = CONFIG.LANGUAGES.find((l) => { return l.code === ch.lang; });
                            const langName = langObj ? langObj.name.split(" ")[0] : ch.lang;

                            return ce("div", {
                                key: ch.id,
                                style: {
                                    display: "grid", gridTemplateColumns: "minmax(0, 1fr) 110px 90px 60px 120px",
                                    alignItems: "center", padding: "10px 14px",
                                    background: "var(--background-modifier-hover)",
                                    borderRadius: "8px", gap: "12px",
                                    transition: "background 0.15s", cursor: "default"
                                },
                                onMouseOver: (e) => e.currentTarget.style.background = "var(--background-modifier-selected)",
                                onMouseOut: (e) => e.currentTarget.style.background = "var(--background-modifier-hover)"
                            },
                                ce("div", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } },
                                    ce("span", { style: { color: "var(--header-primary)", fontSize: "14px", fontWeight: "600" }, title: Utils.getChannelName(ch.id) }, Utils.getChannelName(ch.id))
                                ),
                                ce("span", { style: { color: "#6d6f78", fontSize: "11px", fontFamily: "'Consolas','Monaco',monospace", whiteSpace: "nowrap", textAlign: "right" } }, ch.id),
                                ce("span", {
                                    style: {
                                        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "4px",
                                        padding: "3px 10px", borderRadius: "12px", fontSize: "12px",
                                        fontWeight: "600", whiteSpace: "nowrap", justifySelf: "center",
                                        background: ch.lang === "auto" ? "rgba(254,231,92,0.12)" : "rgba(67,181,129,0.12)",
                                        color: ch.lang === "auto" ? "#FEE75C" : "#43B581"
                                    }
                                }, langName),
                                ce("div", { style: { display: "flex", justifyContent: "center" } },
                                    ce(ToggleSwitch, { 
                                        checked: ch.enabled !== false, 
                                        onChange: (val) => {
                                            const newChannels = channels.map((c) => { return c.id === ch.id ? Object.assign({}, c, { enabled: val }) : c; });
                                            setChannels(newChannels);
                                            updateStateAndSave({ channels: newChannels }, true);
                                        }
                                    })
                                ),
                                ce("div", { style: { display: "flex", gap: "6px", justifyContent: "flex-end" } },
                                    ce("button", {
                                        onClick: () => setEditingChannel({ id: ch.id, newId: ch.id, newLang: ch.lang }),
                                        style: {
                                            padding: "5px 12px", background: "var(--background-modifier-active)", color: "var(--interactive-normal)",
                                            border: "1px solid var(--border-strong)", borderRadius: "6px",
                                            cursor: "pointer", fontSize: "12px", fontWeight: "500",
                                            transition: "all 0.15s"
                                        },
                                        onMouseOver: (e) => { e.currentTarget.style.background = "var(--background-modifier-selected)"; e.currentTarget.style.color = "var(--header-primary)"; },
                                        onMouseOut: (e) => { e.currentTarget.style.background = "var(--background-modifier-hover)"; e.currentTarget.style.color = "var(--interactive-normal)"; }
                                    }, t('edit')),
                                    ce("button", {
                                        onClick: () => {
                                            const newChannels = channels.filter((c) => { return c.id !== ch.id; });
                                            setChannels(newChannels); 
                                            updateStateAndSave({ channels: newChannels }, true); 
                                        },
                                        style: {
                                            padding: "5px 12px", background: "rgba(237,66,69,0.1)", color: "#ed4245",
                                            border: "1px solid rgba(237,66,69,0.2)", borderRadius: "6px",
                                            cursor: "pointer", fontSize: "12px", fontWeight: "500",
                                            transition: "all 0.15s"
                                        },
                                        onMouseOver: (e) => { e.currentTarget.style.background = "rgba(237,66,69,0.2)"; e.currentTarget.style.color = "#ff6b6b"; },
                                        onMouseOut: (e) => { e.currentTarget.style.background = "rgba(237,66,69,0.1)"; e.currentTarget.style.color = "#ed4245"; }
                                    }, t('delete'))
                                )
                            );
                        })
                    ),

                    ce(SectionDivider),

                    ce(SectionHeader, { icon: "\uD83C\uDFA8", title: t('appearance') }),

                    ce("div", { style: { display: "flex", flexDirection: "column", gap: "4px" } },

                        ce("div", {
                            style: {
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px", borderRadius: "8px",
                                background: "var(--background-modifier-hover)"
                            }
                        },
                            ce("div", null,
                                ce("div", { style: { color: "var(--text-normal)", fontSize: "14px", fontWeight: "500" } }, t('translationColor')),
                                ce("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" } }, t('translationColorDesc'))
                            ),
                            ce("div", { style: { display: "flex", alignItems: "center", gap: "10px" } },
                                ce(ChromeStyleColorPicker, {
                                    value: translationColor,
                                    onChange: (val) => {
                                        document.documentElement.style.setProperty('--bd-auto-translate-color', val);
                                        setTranslationColor(val);
                                        updateStateAndSave({ translationColor: val });
                                    }
                                }),
                                ce("button", {
                                    onClick: () => {
                                        const defaultColor = "#9aff99";
                                        setTranslationColor(defaultColor);
                                        updateStateAndSave({ translationColor: defaultColor });
                                        document.documentElement.style.setProperty('--bd-auto-translate-color', defaultColor);
                                    },
                                    style: {
                                        padding: "5px 12px", background: "transparent", color: "var(--text-muted)",
                                        border: "1px solid var(--border-strong)", borderRadius: "6px",
                                        cursor: "pointer", fontSize: "12px", transition: "all 0.15s"
                                    },
                                    onMouseOver: (e) => { e.currentTarget.style.color = "var(--header-primary)"; e.currentTarget.style.borderColor = "var(--border-strong)"; },
                                    onMouseOut: (e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--background-modifier-selected)"; }
                                }, t('reset'))
                            )
                        ),

                        ce("div", {
                            style: {
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px", borderRadius: "8px",
                                background: "var(--background-modifier-hover)", transition: "background 0.15s",
                                cursor: "pointer"
                            },
                            onClick: () => { setShowSeparator(!showSeparator); updateStateAndSave({ showSeparator: !showSeparator }, false, true); },
                            onMouseOver: (e) => e.currentTarget.style.background = "var(--background-modifier-selected)",
                            onMouseOut: (e) => e.currentTarget.style.background = "var(--background-modifier-hover)"
                        },
                            ce("div", null,
                                ce("div", { style: { color: "var(--text-normal)", fontSize: "14px", fontWeight: "500" } }, t('showSeparator')),
                                ce("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" } }, t('showSeparatorDesc'))
                            ),
                            ce(ToggleSwitch, { checked: showSeparator, onChange: function(val) { setShowSeparator(val); updateStateAndSave({ showSeparator: val }, false, true); } })
                        ),

                        ce("div", {
                            style: {
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "12px 16px", borderRadius: "8px",
                                background: "var(--background-modifier-hover)", transition: "background 0.15s",
                                cursor: "pointer"
                            },
                            onClick: () => { setHideOriginal(!hideOriginal); updateStateAndSave({ hideOriginal: !hideOriginal }, false, true); },
                            onMouseOver: (e) => e.currentTarget.style.background = "var(--background-modifier-selected)",
                            onMouseOut: (e) => e.currentTarget.style.background = "var(--background-modifier-hover)"
                        },
                            ce("div", null,
                                ce("div", { style: { color: "var(--text-normal)", fontSize: "14px", fontWeight: "500" } }, t('hideOriginal')),
                                ce("div", { style: { color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" } }, t('hideOriginalDesc'))
                            ),
                            ce(ToggleSwitch, { checked: hideOriginal, onChange: function(val) { setHideOriginal(val); updateStateAndSave({ hideOriginal: val }, false, true); } })
                        )
                    ),

                    ce(SectionDivider),

                    ce("div", { style: { display: "flex", alignItems: "center", justifyContent: "center", padding: "8px 0" } },
                        ce("button", {
                            onClick: () => {
                                this.cacheManager.clear();
                                setCacheSize(0);
                                this.showToast(t('cacheCleared'), "success");
                            },
                            style: {
                                padding: "8px 16px", background: "var(--background-modifier-hover)", color: "var(--text-muted)",
                                border: "1px solid var(--border-subtle)", borderRadius: "8px",
                                cursor: "pointer", fontSize: "13px", fontWeight: "500",
                                transition: "all 0.15s", display: "flex", alignItems: "center", gap: "6px"
                            },
                            onMouseOver: (e) => { e.currentTarget.style.color = "var(--header-primary)"; e.currentTarget.style.background = "var(--background-modifier-selected)"; e.currentTarget.style.borderColor = "var(--background-modifier-selected)"; },
                            onMouseOut: (e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "var(--background-modifier-hover)"; e.currentTarget.style.borderColor = "var(--background-modifier-hover)"; }
                        }, "\uD83D\uDDD1\uFE0F " + t('clearCache') + " (" + cacheSize + ")")
                    )
                );
            };

            return ce(SettingsPanel);
        }
    }

    class SettingsManager {
        constructor() {
            this.settings = this.load();
            this.saveTimer = null;
        }

        load() {
            try {
                const saved = BdApi.Data.load(CONFIG.PLUGIN_NAME, "settings");
                return { ...CONFIG.DEFAULT_SETTINGS, ...(saved ? saved : {}) };
            } catch (error) {
                return { ...CONFIG.DEFAULT_SETTINGS };
            }
        }

        update(newState) {
            this.settings = { ...this.settings, ...newState };
            if (this.saveTimer) clearTimeout(this.saveTimer);
            this.saveTimer = setTimeout(() => {
                BdApi.Data.save(CONFIG.PLUGIN_NAME, "settings", this.settings);
            }, 300);
        }
    }

    // === MAIN PLUGIN ===

    return class BetterAutoTranslate {
        constructor() {
            this.settingsManager = new SettingsManager();
            this.cacheManager = new CacheManager();
            this.engine = new TranslationEngine(this.cacheManager, this.settingsManager);
            this.uiManager = new UIManager(this, this.settingsManager, this.cacheManager);

            this.beforeUnloadHandler = () => {
                this.cacheManager.forceSave();
            };
        }

        start(isQuiet = false) {
            this.settingsManager.settings = this.settingsManager.load();
            this.cacheManager.load();
            this.uiManager.injectStyle();

            // [Replaced with 100% reliable DOM Observer]
            this.startDOMObserver();

            // Patch sendMessage for Outgoing Translation
            const MessageActions = BdApi.Webpack.getModule(m => m && m.sendMessage && m.editMessage);
            if (MessageActions) {
                BdApi.Patcher.instead(CONFIG.PLUGIN_NAME, MessageActions, "sendMessage", async (thisObject, args, originalFunction) => {
                    const [channelId, message] = args;
                    
                    if (this.settingsManager.settings.translateOutgoing && channelId && message && typeof message.content === "string" && message.content.trim().length > 0) {
                        const prefix = this.settingsManager.settings.ignorePrefix;
                        if (prefix && message.content.startsWith(prefix)) {
                            message.content = message.content.slice(prefix.length).trimStart();
                            return originalFunction.apply(thisObject, args);
                        }
                        
                        const channelTarget = this.settingsManager.settings.channels.find(ch => ch.id === channelId);
                        if (channelTarget && channelTarget.enabled !== false && channelTarget.lang !== "auto" && channelTarget.lang !== this.settingsManager.settings.targetLang) {
                            try {
                                const targetLang = channelTarget.lang;
                                const translatedText = await this.engine.translate(message.content, "auto", targetLang);
                                
                                if (translatedText && translatedText !== message.content) {
                                    message.content = translatedText;
                                }
                            } catch (e) {
                                console.error("[AutoTranslate] Outgoing translation failed:", e);
                                this.uiManager.showToast(t('outgoingFailed'), "error");
                            }
                        }
                    }
                    return originalFunction.apply(thisObject, args);
                });
            }
        }

        stop() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
            if (this._uiElements && this._uiElements.wrapper) {
                this._uiElements.wrapper.remove();
                this._uiElements = null;
            }
            document.querySelectorAll('.bd-auto-translate-container, .bd-auto-translate-separator').forEach(el => el.remove());
            document.querySelectorAll('#bd-translate-header-wrapper').forEach(el => el.remove());
            
            if (this.settingsManager && this.settingsManager.saveTimer) clearTimeout(this.settingsManager.saveTimer);
            this.uiManager.removeStyle();
            this.engine.stop();
            this.cacheManager.stop();
            if (global.BdApi && BdApi.Patcher) BdApi.Patcher.unpatchAll(CONFIG.PLUGIN_NAME);
        }

        getSettingsPanel() {
            return this.uiManager.getSettingsPanel();
        }

        injectHeaderButton() {
            const currentChannelId = Utils.getCurrentChannelId();
            if (!currentChannelId) return;

            const toolbar = document.querySelector('section[class*="title_"] [class*="toolbar_"]');
            if (!toolbar) return;

            const channels = this.settingsManager.settings.channels || [];
            const channelTarget = channels.find(ch => ch.id === currentChannelId);

            if (!channelTarget) {
                if (this._uiElements && this._uiElements.wrapper) {
                    this._uiElements.wrapper.remove();
                    this._uiElements = null;
                }
                return;
            }

            if (!this._uiElements || !document.getElementById('bd-translate-header-wrapper')) {
                this.createHeaderUI(toolbar);
            }

            this.updateHeaderUI(channelTarget);
        }

        createHeaderUI(toolbar) {
            const wrapper = document.createElement('div');
            wrapper.id = 'bd-translate-header-wrapper';
            wrapper.style.cssText = 'position: relative; display: flex; align-items: center; justify-content: center; margin: 0 4px;';
            
            const btn = document.createElement('div');
            btn.id = 'bd-translate-header-btn';
            btn.style.cssText = 'cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transform: translateY(0);';
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', t('translationMenu'));

            const dropdown = document.createElement('div');
            dropdown.className = 'bd-translate-dropdown';
            dropdown.style.cssText = 'position: absolute; top: calc(100% + 16px); left: 50%; width: 130px; box-sizing: border-box; background: var(--background-primary); backdrop-filter: blur(16px); border: 1px solid var(--border-subtle, transparent); border-radius: 8px; box-shadow: var(--elevation-high); padding: 8px; z-index: 1000; display: flex; flex-direction: column; gap: 2px;';
            
            const bridge = document.createElement('div');
            bridge.style.cssText = 'position: absolute; top: -20px; left: 0; width: 100%; height: 20px; background: transparent;';
            dropdown.appendChild(bridge);

            const pointer = document.createElement('div');
            pointer.style.cssText = 'position: absolute; top: -6px; left: calc(50% - 5px); width: 10px; height: 10px; background: var(--background-primary); backdrop-filter: blur(16px); border-top: 1px solid var(--border-subtle, transparent); border-left: 1px solid var(--border-subtle, transparent); transform: rotate(45deg); pointer-events: none;';
            dropdown.appendChild(pointer);
            
            const createItem = (id, label, svg, isDanger = false) => {
                const el = document.createElement('div');
                el.id = 'bd-translate-menu-' + id;
                el.className = 'bd-translate-item';
                if (isDanger) el.dataset.danger = "true";
                el.style.cssText = `display: flex; align-items: center; gap: 8px; padding: 8px; border-radius: 4px; cursor: pointer; font-size: 14px;`;
                el.innerHTML = `${svg} <span>${label}</span>`;
                return el;
            };

            const googleSvg18 = `<svg width="18" height="18" viewBox="0 0 24 24">${ICONS.googlePath}</svg>`;
            const deeplSvg18 = `<svg width="18" height="18" viewBox="0 0 48 48">${ICONS.deeplPath}</svg>`;
            const offSvg18 = `<svg width="18" height="18" viewBox="0 0 24 24">${ICONS.offPath}</svg>`;

            const itemGoogle = createItem('google', 'Google', googleSvg18);
            const itemDeepl = createItem('deepl', 'DeepL', deeplSvg18);
            const itemOff = createItem('off', 'OFF', offSvg18, true);

            dropdown.appendChild(itemGoogle);
            dropdown.appendChild(itemDeepl);
            dropdown.appendChild(itemOff);

            wrapper.appendChild(btn);
            wrapper.appendChild(dropdown);

            wrapper.addEventListener('mouseenter', () => dropdown.classList.add('open'));
            wrapper.addEventListener('mouseleave', () => dropdown.classList.remove('open'));

            const updateSettings = (newEngine, newEnabled) => {
                const currentChannels = this.settingsManager.settings.channels || [];
                const currentChannelId = Utils.getCurrentChannelId();
                const newChannels = currentChannels.map((c) => c.id === currentChannelId ? Object.assign({}, c, { enabled: newEnabled }) : c);
                this.settingsManager.update({ channels: newChannels, translationEngine: newEngine });
                
                document.querySelectorAll('.bd-auto-translate-container, .bd-auto-translate-text, .bd-auto-translate-separator').forEach(el => el.remove());
                document.querySelectorAll('[data-translated]').forEach(el => el.removeAttribute('data-translated'));
                if (this.processDOMNode) {
                    document.querySelectorAll('[id^="message-content-"]').forEach(msg => this.processDOMNode(msg));
                }
                
                dropdown.classList.remove('open');
                this.injectHeaderButton(); // Will trigger updateHeaderUI
            };

            itemGoogle.addEventListener('click', () => updateSettings("google", true));
            itemDeepl.addEventListener('click', () => updateSettings("deepl", true));
            itemOff.addEventListener('click', () => updateSettings(this.settingsManager.settings.translationEngine, false));

            this._uiElements = { wrapper, btn, dropdown, items: { google: itemGoogle, deepl: itemDeepl, off: itemOff } };
            toolbar.insertBefore(wrapper, toolbar.firstChild);
        }

        updateHeaderUI(channelTarget) {
            if (!this._uiElements) return;

            const isEnabled = channelTarget.enabled !== false;
            const currentEngine = this.settingsManager.settings.translationEngine;

            const googleSvg24 = `<svg width="24" height="24" viewBox="0 0 24 24">${ICONS.googlePath}</svg>`;
            const deeplSvg24 = `<svg width="24" height="24" viewBox="0 0 48 48">${ICONS.deeplPath}</svg>`;

            const btn = this._uiElements.btn;
            btn.innerHTML = !isEnabled ? ICONS.globe : (currentEngine === 'deepl' ? deeplSvg24 : googleSvg24);

            const { google, deepl, off } = this._uiElements.items;
            
            [google, deepl, off].forEach(el => el.dataset.active = "false");
            
            let activeEl = !isEnabled ? off : (currentEngine === "deepl" ? deepl : google);
            activeEl.dataset.active = "true";
        }

        startDOMObserver() {
            this.processDOMNode = async (node) => {
                if (!node || !node.id || !node.id.startsWith("message-content-") || node.hasAttribute("data-translated")) return;
                
                // Ignore replied message previews to prevent UI clutter
                if (node.closest && node.closest('[class*="repliedMessage"], [class*="repliedTextPreview"]')) {
                    node.setAttribute("data-translated", "ignored");
                    return;
                }

                node.setAttribute("data-translated", "true");

                const currentChannelId = Utils.getCurrentChannelId();
                if (!currentChannelId) return;

                const channels = this.settingsManager.settings.channels || [];
                const channelTarget = channels.find(ch => ch.id === currentChannelId);
                
                if (!channelTarget || channelTarget.enabled === false) return; // Not configured for this channel or disabled

                const text = node.innerText || node.textContent;
                const cleanedText = text.replace(CONFIG.CLEANING_REGEX, "").trim();
                
                if (!cleanedText) return;

                const textHash = Utils.hashString(cleanedText);
                const cacheKey = [this.settingsManager.settings.translationEngine, channelTarget.lang, this.settingsManager.settings.targetLang, textHash].join(":");
                
                let translatedText = this.cacheManager.get(cacheKey);
                
                if (!translatedText) {
                    try {
                        translatedText = await this.engine.chunkTextAndTranslate(cleanedText, channelTarget.lang, this.settingsManager.settings.targetLang);
                        if (translatedText) {
                            this.cacheManager.set(cacheKey, translatedText);
                        }
                    } catch (e) {
                        console.error("[BetterAutoTranslate] Translation failed:", e);
                        return;
                    }
                }

                if (!translatedText || translatedText.toLowerCase() === cleanedText.toLowerCase() || channelTarget.lang === this.settingsManager.settings.targetLang) return;

                const { hideOriginal, showSeparator, translationColor } = this.settingsManager.settings;

                if (hideOriginal) {
                    node.style.display = "none";
                }

                const container = document.createElement("div");
                container.className = "bd-auto-translate-container";
                
                if (showSeparator && !hideOriginal) {
                    const sep = document.createElement("div");
                    sep.className = CONFIG.SEPARATOR_CLASS;
                    container.appendChild(sep);
                }

                const transNode = document.createElement("div");
                transNode.className = CONFIG.TRANSLATION_CLASS;
                transNode.style.color = translationColor || "var(--text-normal)";
                transNode.style.marginTop = (showSeparator && !hideOriginal) ? "0px" : "4px";
                transNode.innerText = translatedText;
                
                container.appendChild(transNode);
                
                // Append after the message content node
                if (node.parentNode) {
                    node.parentNode.insertBefore(container, node.nextSibling);
                }
            };

            this.observer = new MutationObserver((mutations) => {
                let shouldCheckHeader = false;

                for (const m of mutations) {
                    if (m.type === "childList") {
                        if (m.addedNodes.length > 0 || m.removedNodes.length > 0) {
                            shouldCheckHeader = true;
                        }

                        for (const node of m.addedNodes) {
                            if (node.nodeType === 1) {
                                if (node.id && node.id.startsWith("message-content-")) {
                                    this.processDOMNode(node);
                                } else if (node.querySelectorAll) {
                                    const msgs = node.querySelectorAll('[id^="message-content-"]');
                                    msgs.forEach(msg => this.processDOMNode(msg));
                                }
                            }
                        }
                    }
                }

                if (shouldCheckHeader) {
                    if (!document.getElementById('bd-translate-header-wrapper')) {
                        const toolbar = document.querySelector('section[class*="title_"] [class*="toolbar_"]');
                        if (toolbar) {
                            this.injectHeaderButton();
                        }
                    }
                }
            });
            
            const appMount = document.getElementById("app-mount") || document.body;
            this.observer.observe(appMount, { childList: true, subtree: true });
            
            // Process existing messages
            document.querySelectorAll('[id^="message-content-"]').forEach(msg => this.processDOMNode(msg));
            this.injectHeaderButton();
        }
    };
})();
