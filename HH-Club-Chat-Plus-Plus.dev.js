// ==UserScript==
// @name         HH Club Chat++ (Dev Version)
// @version      0.68
// @description  Upgrade Club Chat with various features and bug fixes
// @author       -MM-
// @match        https://*.hentaiheroes.com/*
// @match        https://*.comixharem.com/*
// @match        https://*.pornstarharem.com/*
// @match        https://*.gayharem.com/*
// @match        https://nutaku.haremheroes.com/*
// @match        https://osapi.nutaku.com/gadgets/ifr*tid=harem-heroes*
// @match        https://osapi.nutaku.com/gadgets/ifr*tid=comix-harem*
// @match        https://osapi.nutaku.com/gadgets/ifr*tid=pornstar-harem*
// @match        https://osapi.nutaku.com/gadgets/ifr*tid=gay-harem*
// @run-at       document-end
// @namespace    https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant        GM_info
// ==/UserScript==

//CHANGELOG: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/blob/main/CHANGELOG.md

(function() {
    //definitions
    'use strict';
    /* global ClubChat, initTabSystem, hero_page_popup, girlsDataList, $ */

    const isInIFrame = inIFrame();
    if((!isInIFrame && window.location.pathname === '/') || window.location.hostname === 'osapi.nutaku.com')
    {
        console.log('HH Club Chat++ Script v' + GM_info.script.version + ' // Chat Frame');

        //remove the font from nutaku and use the font from the game
        if(window.location.hostname === 'osapi.nutaku.com')
        {
            let styleNodes = document.head.querySelectorAll('style');
            for(let i = 0; i < styleNodes.length; i++) {
                if(styleNodes[i].innerHTML.includes('font-family:arial,sans-serif;')) {
                    styleNodes[i].innerHTML = styleNodes[i].innerHTML.replace('font-family:arial,sans-serif;', '');
                    break;
                }
            }
        }

        waitForGameFrame();
        function waitForGameFrame() {
            if(document.getElementById("hh_game") !== null) {
                chatFrame();
            } else {
                setTimeout(waitForGameFrame, 10);
            }
        }
    }
    else if(isInIFrame && window.location.pathname !== '/' && window.location.pathname !== '/index.php')
    {
        console.log('HH Club Chat++ Script v' + GM_info.script.version + ' // Game Frame');
        gameFrame();
    }

    function chatFrame()
    {
        //constants
        const HHCLUBCHATPLUSPLUS_URL_DOWNLOAD = 'https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js';
        const HHCLUBCHATPLUSPLUS_URL_PUSHVERSION = 'https://raw.githubusercontent.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/main/pushVersion.gif';
        const HHCLUBCHATPLUSPLUS_URL_RES = 'https://raw.githubusercontent.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/main/res/';

        const HHCLUBCHATPLUSPLUS_INDICATOR = '\u200D';

        const HHCLUBCHATPLUSPLUS_VERSION_0 = '0';
        const HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG = '\u200C';
        const HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG_MAX_LENGTH = 6; //6 = 4 + CONFIG_VERSION + CONFIG_INDICATOR

        const HHCLUBCHATPLUSPLUS_VERSION_INV_CONFIG = '\u2000';
        const HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG = '\u200B';
        const HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_COLOR_LENGTH = 6;
        const HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH = HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_COLOR_LENGTH + 2; // COLOR + CONFIG_VERSION + CONFIG_INDICATOR

        const GAME_INFO = getGameInfo();
        const MAX_MESSAGE_SIZE = 500;
        const mapGIFs = getMapGIFs();
        const mapEmojis = getMapEmojis();
        const mapGameIcons = getMapGameIcons();
        const mapCustomEmojiGifHosts = getMapCustomEmojiGifHosts();
        const mapCustomEmojiGifFileExtensions = getMapCustomEmojiGifFileExtensions();

        //local storage keys
        const BASE_KEY = 'HHClubChatPlusPlus_';
        const KEY_CONFIG = BASE_KEY + GAME_INFO.tag + '_Config';
        const KEY_CUSTOM_EMOJIS = BASE_KEY + GAME_INFO.tag + '_CustomEmojis';
        const KEY_CUSTOM_GIFS = BASE_KEY + GAME_INFO.tag + '_CustomGifs';
        const KEY_GIRL_DICTIONARY = BASE_KEY + GAME_INFO.tag + '_GirlDictionary';
        const KEY_LAST_MESSAGE_TIMESTAMP_SEEN = BASE_KEY + GAME_INFO.tag + '_LastMsgTimestampSeen';
        const KEY_ONLINE_OFFLINE_PINGS = BASE_KEY + GAME_INFO.tag + '_OnlineOfflinePings';
        const KEY_POSITION_AND_SIZE = BASE_KEY + GAME_INFO.tag + '_PositionAndSize';

        // migration to tagged keys, remove in later version
        (function(){
            const keyPairs = new Map([
                [KEY_CONFIG, BASE_KEY + 'Config'],
                [KEY_CUSTOM_EMOJIS, BASE_KEY + 'CustomEmojis'],
                [KEY_CUSTOM_GIFS, BASE_KEY + 'CustomGifs'],
                [KEY_GIRL_DICTIONARY, BASE_KEY + 'GirlDictionary'],
                [KEY_LAST_MESSAGE_TIMESTAMP_SEEN, BASE_KEY + 'LastMsgTimestampSeen'],
                [KEY_ONLINE_OFFLINE_PINGS, BASE_KEY + 'OnlineOfflinePings'],
                [KEY_POSITION_AND_SIZE, BASE_KEY + 'PositionAndSize']
            ]);
            for (const [newKey, oldKey] of keyPairs) {
                // check if new key has been used
                if (localStorage.getItem(newKey)) { continue }
                // move value to new key if it exists
                const oldValue = localStorage.getItem(oldKey);
                if (oldValue) {
                    localStorage.setItem(newKey, oldValue);
                    localStorage.removeItem(oldKey);
                }
            }
        })();

        //check push version
        checkPushVersion();

        //create new input and send button
        createNewInputAndSendButton();

        //add insert ping into input function
        addInsertPingIntoInput();

        //config
        let config = loadConfigFromLocalStorage();

        //club chat init fails sometimes. we fix it now
        fixClubChat();

        //fix club chat scrolling. scroll only if the scrollbar is close to the bottom
        fixScrolling();

        //load last position and size of the chat window
        loadLastChatWindowPositionAndSize(document.querySelector('#resize-chat-box'));

        //css
        let css = document.createElement('style');
        document.head.appendChild(css);
        css.sheet.insertRule('div.chat-msg div.chat-msg-avatar {width:42px !important;height:42px !important;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-avatar img.icon {width:36px !important;height:36px !important;cursor:pointer;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-time {margin-top:-2px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.playername {cursor:pointer;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.member {color:#8a8ae6;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.coleader {color:#f3a03c;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.leader {color:#f33c3d;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.self {color:#ffd700;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.active_light {display:inline-block;width:.75rem;height:.75rem;margin:0px 4px 4px 11px;transform:rotate(45deg);border:1px solid #000;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.HHCCPlusPlus {color:white;font-size:20px;line-height:1;margin:0px 2px 0px 5px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender div.MaxMsgSize {display:inline-block;width:30px;color:red;font-size:10px;margin:0px 0px 1px 8px;border:solid 1px red;text-align:center;background-color:#700;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info {pointer-events: none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-info * {pointer-events: auto;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt a {color:white;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt img {max-width:200px;max-height:100px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt img.small {max-width:150px;max-height:75px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt img.smaller {max-width:100px;max-height:50px;}');
        css.sheet.insertRule('div.club-chat-messages div.chat-msg div.chat-msg-txt img.emoji {max-width:24px;max-height:24px;}');
        css.sheet.insertRule('div.club-chat-messages div.chat-msg div.chat-msg-txt img.emoji-only {max-width:36px;max-height:36px;}');
        css.sheet.insertRule('div.pinned-block div.chat-msg div.chat-msg-txt img.emoji {max-width:16px;max-height:16px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.girl {width:300px;background-color:#2f3136;padding:7px;border-radius:7px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.girl div.left {float:left;width:70%;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.girl div.right {float:right;width:30%;text-align:right;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.girl div.clear {clear:both;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.girl img {width:80px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses {display:inline-block;background-color:#2f3136;padding:7px;border-radius:7px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses a {padding:0px 10px 0px 10px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses span {padding:0px 10px 0px 10px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses span.spoiler-visible {background:none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses span.spoiler-visible * {background:none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses span.spoiler {display:inline-block;height:100px;width:100%;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping {background-color:#4e4d73;padding:0px 3px 0px 3px;border-radius:3px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping-invalid {background-color:#4e4d73;padding:0px 3px 0px 3px;border-radius:3px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping-invalid:after {color:#4e4d73;background-image:url("https://hh2.hh-content.com/ic_new.png");background-size:8px auto;background-repeat:no-repeat;background-position:1px 1px;content:"_";}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler {background:#202225;padding:0px 3px 0px 3px;border-radius:3px;color:transparent;cursor:pointer;user-select:none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler * {background:#202225;padding:0px;border-radius:0px;color:transparent;cursor:pointer;user-select:none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler a {pointer-events:none;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler img {padding:0px 3px 0px 3px;border-radius:3px;max-width:1px;max-height:1px;filter:opacity(0%);}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible {background:#4a4d53;padding:0px 3px 0px 3px;border-radius:3px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible * {background:#4a4d53;padding:0px;border-radius:0px;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible a {pointer-events: auto;}');
        css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible img {padding:0px 3px 0px 3px;border-radius:3px;}');
        css.sheet.insertRule('input.club-chat-input-custom {width:100%;height:38px;color:#fff;font-size:16px;padding-left:12px;border:1px solid #ffa23e;background-color:rgba(0,0,0,.3);box-shadow:0 2px 0 #c61f52,0 0 13px rgba(159,7,58,.6),0 0 13px rgba(159,7,58,.95);border-radius:4px;font-family:Tahoma,Helvetica,Arial,sans-serif;padding-right:80px;}');
        css.sheet.insertRule('button.club-chat-send-custom {position:absolute;top:7px;right:1px;border:none;background-color:transparent;outline:0;cursor:pointer;}');
        css.sheet.insertRule('#btnEmojisGIFs {position:absolute;top:5px;right:43px;border:none;background-color:transparent;outline:0;cursor:pointer;width:28px;height:28px;background-image:url("https://cdn.discordapp.com/emojis/861385389004947526.webp?size=48&quality=lossless");background-size:28px;background-repeat:no-repeat;background-position:right;padding-right:33px;}');

        //css members online/offline
        let cssOnline = document.createElement('style');
        document.head.appendChild(cssOnline);

        //EmojiKeyboard
        let emojiKeyboard;
        initEmojiKeyboard();

        //Coloris (Color Picker)
        initColoris();

        //cross-domain communication
        function receiveMessage(e)
        {
            if(typeof e.data === 'object' && e.data.HHCCPlusPlus === true)
            {
                //console.log('ChatFrame-ReceiveMessage', e.data);

                switch (e.data.type){
                    case 'fixClubChat':
                        receivedFixClubChat(e);
                        break;
                    case 'girlsUpdate':
                        receivedGirlsUpdate(e);
                        break;
                    default:
                        console.warn('unknown message type: ' + e.data.type);
                        break;
                }
            }
        }

        function receivedFixClubChat(e)
        {
            pingMessageCount = 0; //reset ping counter, as we will receive all chat messages again after successful reconnection
            ClubChat.hasInit = false;
            ClubChat.hasPinnedMessageHandler = false; //the handler is lost after the connection is restored
            fixClubChat();
        }

        function receivedGirlsUpdate(e) {
            localStorage.setItem(KEY_GIRL_DICTIONARY, JSON.stringify(e.data.girls));
        }

        window.addEventListener('message', receiveMessage);

        //chat variables
        let playerId = -1;
        let playerName = null;
        let playerNamePing = null;
        let pingValidList = [];
        let pingMessageCount = 0;
        let mapOnOffPings = cleanOnlineOfflinePingsInLocalStore();
        let lastMsgTimestamp = 0;
        let lastMsgTimestampSeen = loadLastMsgTimestampSeen(); //we cant use ClubChat.lastSeenMessage because its not available when we receive the first messages
        let lastBeepTimestamp = 0;
        let sndNewMessage = null;
        let firstMessageReceived = false;

        function parseMessageInfo(html)
        {
            let ret = {
                html: html,
                sentByHHCCPlusPlus: false,
                nicknameColor: null,
                maxMsgSize: MAX_MESSAGE_SIZE
            };

            if(html.endsWith(HHCLUBCHATPLUSPLUS_INDICATOR))
            {
                ret.sentByHHCCPlusPlus = true;
                ret.html = html.substr(0, html.length - HHCLUBCHATPLUSPLUS_INDICATOR.length).trimEnd();
            }
            else if(html.endsWith(HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG)
                    && html.length > HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG.length + 4) //min. length without indicator = 5 = 4 + 1 = AAAA + version
            {
                ret.sentByHHCCPlusPlus = true;

                let version = html.charAt(html.length - HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG.length - 1);

                //check version
                if(version == HHCLUBCHATPLUSPLUS_VERSION_0)
                {
                    try
                    {
                        let nicknameColor = convertBase64ToHexColor(html.substr(html.length - HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG.length - 1 - 4, 4));
                        if(isHexColor(nicknameColor))
                        {
                            ret.nicknameColor = nicknameColor;
                            ret.html = html.substr(0, html.length - HHCLUBCHATPLUSPLUS_INDICATOR_WITH_CONFIG.length - 1 - 4).trimEnd();
                        }
                    }
                    catch (e)
                    {
                        // something went wrong, maybe had indicator character randomly at the end
                        ret.sentByHHCCPlusPlus = false;
                        console.error(e);
                    }
                }
            }
            else if(html.endsWith(HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG)
                    && html.length >= HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH)
            {
                ret.sentByHHCCPlusPlus = true;

                let version = html.charAt(html.length - HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG.length - 1);

                //check version
                if(version == HHCLUBCHATPLUSPLUS_VERSION_INV_CONFIG)
                {
                    try
                    {
                        let nicknameColor = convertInvToHexColor(html.substr(-HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH, HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_COLOR_LENGTH));
                        if(isHexColor(nicknameColor))
                        {
                            ret.nicknameColor = nicknameColor;
                            ret.html = html.substr(0, html.length - HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH).trimEnd();
                        }
                    }
                    catch (e)
                    {
                        // something went wrong, maybe had indicator character randomly at the end
                        ret.sentByHHCCPlusPlus = false;
                        console.error(e);
                    }
                }
            }
            if(ret.sentByHHCCPlusPlus) ret.maxMsgSize = MAX_MESSAGE_SIZE - HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH - 1;
            return ret;
        }

        //observe chat messages
        function observerMessagesFunction(mutations, observer) {

            //user is not in a club if we do not have a chat token
            if(ClubChat.chatVars.CHAT_TOKEN == '') return;

            //chat visible?
            let chatWindowVisible = document.querySelector('#resize-chat-box').classList.contains('visible');

            //get playername
            if(playerName === null)
            {
                playerName = JSON.parse(atob(ClubChat.chatVars.CHAT_TOKEN.substr(0, ClubChat.chatVars.CHAT_TOKEN.indexOf('.')))).nickname;
                playerNamePing = '@' + playerName.toLowerCase().replaceAll(' ', '_');
            }

            //get playerId
            playerId = ClubChat.id_member;

            //get playerId of club leader
            let clubLeaderPlayerId = parseInt(ClubChat.chatVars.CLUB_INFO.leader_id);

            //get playerId of club co-leaders
            let clubCoLeadersPlayerId = [];
            ClubChat.chatVars.CLUB_INFO.co_leaders.forEach(e => { clubCoLeadersPlayerId.push(parseInt(e)) });

            //get pingValidList
            if(pingValidList.length == 0 && document.querySelectorAll('div.chat-members-list div.member p.name-member').length != 0)
            {
                pingValidList.push('@club');
                pingValidList.push('@online');
                pingValidList.push('@offline');
                document.querySelectorAll('div.chat-members-list div.member p.name-member').forEach(e => pingValidList.push('@' + e.innerHTML.toLowerCase().replaceAll(' ', '_')));
                if(playerNamePing != null && !pingValidList.includes(playerNamePing)) pingValidList.push(playerNamePing); //KK bug fix after name change
            }

            //parse new messages
            for(let i = 0; i < mutations.length; i++)
            {
                for(let j = 0; j < mutations[i].addedNodes.length; j++)
                {
                    let node = mutations[i].addedNodes[j];
                    let msgId = node.getAttribute('msg_id');
                    if(msgId == null) break;
                    let msgIdSplits = msgId.split(':');
                    let msgIdClubId = parseInt(msgIdSplits[0]);
                    let msgIdPlayerId = parseInt(msgIdSplits[1]);
                    let msgIdTimestampMs = parseInt(msgIdSplits[2]);
                    let msgInfo = parseMessageInfo(node.lastElementChild.lastElementChild.innerHTML);
                    let html = msgInfo.html;
                    let htmlLC = html.toLowerCase();
                    let isPinnedMsg = (mutations[i].pinnedBlock == true);

                    //change the playername color (self gold, club leader red, club co leaders orange, members blue) and add "click to ping"
                    let nodeSpanMsgSender = node.querySelector('div.chat-msg-info span.chat-msg-sender');
                    let nodeSpanMsgSender_nickname = document.createElement('span');
                    nodeSpanMsgSender_nickname.setAttribute('class', 'playername ' + (msgIdPlayerId == playerId && config.SelfColor == '1' ? 'self' : (msgIdPlayerId == clubLeaderPlayerId ? 'leader' : (clubCoLeadersPlayerId.includes(msgIdPlayerId) ? 'coleader' : 'member'))));
                    if(msgInfo.nicknameColor != null && isSponsorOrMM(msgIdPlayerId) && (msgIdPlayerId != playerId || config.SelfColor != '1')) nodeSpanMsgSender_nickname.setAttribute('style', 'color:' + msgInfo.nicknameColor);
                    nodeSpanMsgSender_nickname.setAttribute('onClick', 'ClubChat.insertPingIntoInput(this)');
                    nodeSpanMsgSender_nickname.innerHTML = nodeSpanMsgSender.innerHTML;
                    nodeSpanMsgSender.innerHTML = '';
                    nodeSpanMsgSender.appendChild(nodeSpanMsgSender_nickname);

                    //update and save last (seen) message timestamp in localstore
                    if(lastMsgTimestamp < msgIdTimestampMs)
                    {
                        lastMsgTimestamp = msgIdTimestampMs;

                        //chat log
                        if(config.ChatLog == '1') console.info((isPinnedMsg ? '[PINNED] ' : '') + '[' + (new Date(msgIdTimestampMs).toLocaleString()) + '] ' + nodeSpanMsgSender_nickname.innerHTML + ': ' + html);

                        //no sound on init
                        if(lastBeepTimestamp == 0) lastBeepTimestamp = Date.now();

                        //play sound on new message
                        if(!chatWindowVisible && !isPinnedMsg) playSoundNewMessage(config.NewMessageSound);
                    }
                    if(chatWindowVisible && lastMsgTimestampSeen < lastMsgTimestamp)
                    {
                        lastMsgTimestampSeen = lastMsgTimestamp;
                        saveLastMsgTimestampSeen();
                    }

                    //add the online icon
                    if(!isPinnedMsg)
                    {
                        let nodeSpanMsgSender_active_light = document.createElement('span');
                        nodeSpanMsgSender_active_light.setAttribute('class', 'active_light');
                        nodeSpanMsgSender_active_light.setAttribute('title', 'Online Status');
                        nodeSpanMsgSender.appendChild(nodeSpanMsgSender_active_light);
                    }

                    //mark message as sent by HH Club Chat++
                    if(msgInfo.sentByHHCCPlusPlus)
                    {
                        let nodeSpanMsgSender_HHCCPlusPlus = document.createElement('span');
                        nodeSpanMsgSender_HHCCPlusPlus.setAttribute('class', 'HHCCPlusPlus');
                        nodeSpanMsgSender_HHCCPlusPlus.setAttribute('title', 'HH Club Chat++');
                        nodeSpanMsgSender_HHCCPlusPlus.innerHTML = '++';
                        nodeSpanMsgSender.appendChild(nodeSpanMsgSender_HHCCPlusPlus);
                    }

                    //mark message when maximum message size is reached
                    if(msgInfo.maxMsgSize <= html.length)
                    {
                        let nodeSpanMsgSender_MaxMsgSize = document.createElement('div');
                        nodeSpanMsgSender_MaxMsgSize.setAttribute('class', 'MaxMsgSize');
                        nodeSpanMsgSender_MaxMsgSize.setAttribute('title', 'Max Message Size reached (' + msgInfo.maxMsgSize + ' characters)');
                        nodeSpanMsgSender_MaxMsgSize.innerHTML = 'Max';
                        nodeSpanMsgSender.appendChild(nodeSpanMsgSender_MaxMsgSize);
                    }

                    //open the hero page when clicking on the avatar
                    node.querySelector('div.chat-msg-avatar img').addEventListener('click', (e) => {
                        window[0].postMessage({ HHCCPlusPlus: true, type: 'heroPagePopup', playerId: msgIdPlayerId }, '*');
                        document.querySelector('#resize-chat-box div.chat-wrapper div.chat-container a.close_cross').click();
                    });

                    //new html
                    let htmlNew = [];
                    let forceScrollDown = false;
                    let emojiOnly = false; //emojis can be larger if the message contains nothing else

                    if(htmlLC.startsWith('/girl ') && htmlLC.length > 6 && !isPinnedMsg)
                    {
                        let param1 = html.substr(6).trim();
                        let girlId = -1;
                        let girlName = null;

                        //is it a girl id or a girl name?
                        let girlDictionary = getGirlDictionary();
                        if(strIsInt(param1))
                        {
                            girlId = parseInt(param1);
                            girlName = getGirlNameById(girlId, girlDictionary);
                            if(girlName == null) girlName = 'Unknown Girl';
                        }
                        else
                        {
                            girlId = getGirlIdByName(param1, girlDictionary);
                            if(girlId != -1) girlName = getGirlNameById(girlId, girlDictionary); //get the name nicely written
                        }

                        //girl found?
                        if(girlId != -1)
                        {
                            let url = null;
                            if (girlName != 'Unknown Girl' && GAME_INFO.wikiUrl) {
                                url = GAME_INFO.wikiUrl + girlName.replaceAll(' ', '-').replaceAll('.', '').replaceAll('’', '');
                            }
                            htmlNew.push({ isValid: true, value: '<div class="girl"><div class="left">' + (url != null ? '<a href="' + url + '" target="_blank">' + girlName + '</a>' : (girlName != 'Unknown Girl' ? girlName : 'Girl ID ' + girlId)) + '<br/><br/>' + (url != null ? 'All' : 'No') + ' infos about her!</div><div class="right">' + (url != null ? '<a href="' + url + '" target="_blank">' : '') + '<img title="' + girlName + '" src="'+GAME_INFO.contentUrl+girlId+'/ico0-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">' + (url != null ? '</a>' : '') + '</div><div class="clear"></div></div>' + (url != null ? '<br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
                        }
                    }
                    else if(htmlLC.startsWith('/poses ') && htmlLC.length > 7 && !isPinnedMsg)
                    {
                        let param1 = html.substr(7).trim();
                        let girlId = -1;
                        let girlName = null;
                        let girlGrade = -1;

                        //is it a girl id or a girl name?
                        let girlDictionary = getGirlDictionary();
                        if(strIsInt(param1))
                        {
                            girlId = parseInt(param1);
                            girlName = getGirlNameById(girlId, girlDictionary);
                            if(girlName == null)
                            {
                                girlName = 'Unknown Girl';
                            }
                            else
                            {
                                girlGrade = getGirlGradeById(girlId, girlDictionary);
                            }
                        }
                        else
                        {
                            girlId = getGirlIdByName(param1, girlDictionary);
                            if(girlId != -1)
                            {
                                girlName = getGirlNameById(girlId, girlDictionary); //get the name nicely written
                                girlGrade = getGirlGradeById(girlId, girlDictionary);
                            }
                        }

                        //girl found?
                        if(girlId != -1)
                        {
                            //build girl poses
                            let htmlPoses = (config.PosesInSpoilerBlock == '1' ? '<span class="spoiler" title="click to reveal spoiler" onClick="this.setAttribute(\'class\',\'spoiler-visible\');this.setAttribute(\'title\',\'\');ClubChat.resizeNiceScroll()">' : '');
                            if(girlGrade == -1) girlGrade = 6; //use 6 girl poses if we have the girl but no girl grade
                            for(let k = 0; k <= girlGrade; k++)
                            {
                                htmlPoses += '<a href="' + GAME_INFO.contentUrl + girlId + '/ava' + k + '-1200x.webp?v=5" target="_blank"><img title="Pose ' + k + '" src="' + GAME_INFO.contentUrl + girlId + '/ava' + k + '-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()" onerror="this.parentNode.style.display=\'none\'"></a>';
                            }
                            htmlPoses += (config.PosesInSpoilerBlock == '1' ? '</span>' : '');

                            let url = null;
                            if (girlName != 'Unknown Girl' && GAME_INFO.wikiUrl) {
                                url = GAME_INFO.wikiUrl + girlName.replaceAll(' ', '-').replaceAll('.', '').replaceAll('’', '');
                            }
                            htmlNew.push({ isValid: true, value: '<div class="poses">' + (url != null ? '<a href="' + url + '" target="_blank">Poses: ' + girlName + '</a>' : '<span>Poses: ' + (girlName != 'Unknown Girl' ? girlName : 'Girl ID ' + girlId)) + '</span><br/><br/>' + htmlPoses + '</div>' + (url != null ? '<br/><br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
                        }
                    }
                    else if(htmlLC.startsWith('/plain '))
                    {
                        htmlNew.push({ isValid: true, value: html.substr(7) });
                    }
                    else if(htmlLC == '/dice' && !isPinnedMsg)
                    {
                        htmlNew.push({ isValid: true, value: htmlLC });

                        //add a new node with the dice result (prevents deletion)
                        let div = document.createElement('div');
                        div.setAttribute('class', 'chat-system-msg');
                        div.setAttribute('style', 'font-size:16px');
                        div.innerHTML = ' <b style="font-weight:bold">Dice Master:</b> <span style="font-size:16px">' + nodeSpanMsgSender_nickname.innerHTML + ' rolled a ' + (msgIdTimestampMs % 6 + 1) + ' !</span> <span style="color:rgb(170,170,170);font-size:12px">' + node.querySelector('div.chat-msg-info span.chat-msg-time').innerHTML + '</span> ';
                        node.after(div);
                    }
                    else
                    {
                        //no bigger emoijs in the pinned message
                        emojiOnly = !isPinnedMsg;

                        //is it a spoiler?
                        let isSpoiler = false;
                        if(htmlLC.startsWith('/spoiler '))
                        {
                            htmlLC = htmlLC.substr(9);
                            html = html.substr(9);
                            isSpoiler = true;
                        }

                        //parse text word by word (links, images, ping, format)
                        let htmlSplits = html.split(' ');
                        let pingReceived = false;
                        let styleBold = -1;
                        let styleItalic = -1;
                        let styleUnderline = -1;
                        let styleLineThrough = -1;
                        let hasGif = false;
                        //TODO add || as spoiler
                        for(let k = 0; k < htmlSplits.length; k++)
                        {
                            let word = htmlSplits[k];
                            if(word == '') continue;
                            let wordLC = word.toLowerCase();

                            //links / images
                            if(wordLC.startsWith('https://'))
                            {
                                emojiOnly = false;

                                //is it an image?
                                let pos = wordLC.indexOf('?');
                                if(pos == -1) pos = wordLC.length;
                                let fileExtension = wordLC.substr(pos - 5, 5);
                                if(config.Image != '0' && ((fileExtension.endsWith('.gif') || fileExtension.endsWith('.jpg') || fileExtension == '.jpeg' || fileExtension.endsWith('.png') || fileExtension == '.webp')))
                                {
                                    htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank"><img ' + (config.Image == 'sr' || isPinnedMsg ? 'class="smaller" ' : (config.Image == 'sl' ? 'class="small" ' : '')) + 'src="' + word + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()"></a>' });
                                }
                                else //its a link
                                {
                                    htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank" onclick="return confirm(\'Do you really want to open this link?\')">' + word + '</a>' });
                                }
                            }
                            else if(word.startsWith('@') && word.length != 1) //ping
                            {
                                //ignore some characters at the end
                                if([',', '.', '!', '?', ':', ')'].includes(wordLC[wordLC.length - 1])) wordLC = wordLC.substr(0, wordLC.length - 1);
                                else if(['\'s', '´s'].includes(wordLC.substr(wordLC.length - 2))) wordLC = wordLC.substr(0, wordLC.length - 2);

                                //shortform of nicknames for club "Hērōēs Prāvī Forī [EN]"
                                if(msgIdClubId == 1898 && window.location.hostname.includes('.hentaiheroes.com'))
                                {
                                    switch(wordLC)
                                    {
                                        case '@mm': wordLC = '@-mm-'; break;
                                        case '@holy': wordLC = '@holymolly'; break;
                                        case '@epic':
                                        case '@bacon': wordLC = '@epicbacon'; break;
                                        case '@finder':
                                        case '@finders':
                                        case '@find':
                                        case '@finds': wordLC = '@finderkeeper'; break;
                                        case '@yoyo': wordLC = '@yoyowhan'; break;
                                        case '@hvj': wordLC = '@hvjkzv'; break;
                                        case '@chuck':
                                        case '@maximus':
                                        case '@master': wordLC = '@master_maximus'; break;
                                        case '@mars':
                                        case '@marsome': wordLC = '@marsome-dominatrix'; break;
                                        case '@ck':
                                        case '@ckiller': wordLC = '@cuntkiller'; break;
                                        case '@pity': wordLC = '@pitythefool'; break;
                                        case '@chico': wordLC = '@chico_bonbon'; break;
                                        case '@nat': wordLC = '@natstar'; break;
                                        case '@z': wordLC = '@zteev'; break;
                                        case '@zami': wordLC = '@zam'; break;
                                        case '@-fakemm-':
                                        case '@fakemm':
                                        case '@hpfcc':
                                        case '@hērōēs_prāvī_forī_cc': wordLC = '@-ww-'; break;
                                    }
                                }

                                //ping valid?
                                if(pingValidList.includes(wordLC))
                                {
                                    //format the ping word
                                    htmlNew.push({ isValid: true, value: '<span class="ping">' + word + '</span>' });

                                    //@online / @offline pings
                                    let triggerOnOffPing = false;
                                    const key = msgIdTimestampMs + '-' + msgIdPlayerId;
                                    if(mapOnOffPings.has(key))
                                    {
                                        triggerOnOffPing = mapOnOffPings.get(key);
                                    }
                                    else if(wordLC == '@online')
                                    {
                                        triggerOnOffPing = (msgIdTimestampMs >= Date.now() - 5000);

                                        //we do not need to save the @online trigger, if its false
                                        if(triggerOnOffPing)
                                        {
                                            mapOnOffPings.set(key, triggerOnOffPing);
                                            saveOnlineOfflinePingsToLocalStorage(mapOnOffPings);
                                        }
                                    }
                                    else if(wordLC == '@offline')
                                    {
                                        triggerOnOffPing = (msgIdTimestampMs < Date.now() - 5000);
                                        mapOnOffPings.set(key, triggerOnOffPing);
                                        saveOnlineOfflinePingsToLocalStorage(mapOnOffPings);
                                    }

                                    //is the ping for this user?
                                    if(!pingReceived && (wordLC == '@club' || triggerOnOffPing || (playerNamePing != null && wordLC == playerNamePing)))
                                    {
                                        //only one ping per message
                                        pingReceived = true;

                                        //highlight the message
                                        node.setAttribute('style', 'background-color:#49443c');

                                        //if the chat window is not visible and if its a new unread ping message, we notify the user about it
                                        if(!chatWindowVisible && lastMsgTimestampSeen < msgIdTimestampMs)
                                        {
                                            if(!isPinnedMsg || pingMessageCount == 0) pingMessageCount++;
                                            window[0].postMessage({ HHCCPlusPlus: true, type: 'ping', pingMessageCount }, '*');

                                            //play sound on new ping
                                            if(!isPinnedMsg) playSoundNewMessage(config.NewPingSound);
                                        }
                                    }
                                }
                                else
                                {
                                    //format the ping word as invalid
                                    htmlNew.push({ isValid: true, value: '<span class="ping-invalid" title="Invalid Ping">' + word + '</span>' });
                                }
                            }
                            else
                            {
                                //text format
                                let cutterL = 0;
                                let cutterR = 0;
                                let styleAdded;
                                do
                                {
                                    styleAdded = false;

                                    if(wordLC.length > 2)
                                    {
                                        //bold
                                        if(styleBold == -1 && wordLC.startsWith('**'))
                                        {
                                            styleBold = htmlNew.push({ isValid: false, value: '<span style="font-weight:bold;">', invalidValue: '**' }) - 1;
                                            wordLC = wordLC.substr(2, wordLC.length - 2);
                                            cutterL += 2;
                                            styleAdded = true;
                                        }

                                        //underline
                                        if(styleUnderline == -1 && wordLC.startsWith('__'))
                                        {
                                            styleUnderline = htmlNew.push({ isValid: false, value: '<span style="text-decoration:underline;">', invalidValue: '__' }) - 1;
                                            wordLC = wordLC.substr(2, wordLC.length - 2);
                                            cutterL += 2;
                                            styleAdded = true;
                                        }

                                        //line-through
                                        if(styleLineThrough == -1 && wordLC.startsWith('~~'))
                                        {
                                            styleLineThrough = htmlNew.push({ isValid: false, value: '<span style="text-decoration:line-through;">', invalidValue: '~~' }) - 1;
                                            wordLC = wordLC.substr(2, wordLC.length - 2);
                                            cutterL += 2;
                                            styleAdded = true;
                                        }
                                    }

                                    if(wordLC.length > 1)
                                    {
                                        //italic
                                        if(styleItalic == -1 && wordLC.startsWith('*'))
                                        {
                                            styleItalic = htmlNew.push({ isValid: false, value: '<span style="font-style:italic;">', invalidValue: '*' }) - 1;
                                            wordLC = wordLC.substr(1, wordLC.length - 1);
                                            cutterL++;
                                            styleAdded = true;
                                        }
                                    }
                                } while(styleAdded);

                                //add a placeholder for the word
                                let wordIndex = htmlNew.push({ isValid: true, value: '' }) - 1;

                                do
                                {
                                    styleAdded = false;

                                    if(wordLC.length > 2)
                                    {
                                        //bold
                                        if(styleBold != -1 && wordLC.endsWith('**'))
                                        {
                                            htmlNew[styleBold].isValid = true;
                                            styleBold = -1;
                                            htmlNew.push({ isValid: true, value: '</span>' });
                                            wordLC = wordLC.substr(0, wordLC.length - 2);
                                            cutterR += 2;
                                            styleAdded = true;
                                        }

                                        //underline
                                        if(styleUnderline != -1 && wordLC.endsWith('__'))
                                        {
                                            htmlNew[styleUnderline].isValid = true;
                                            styleUnderline = -1;
                                            htmlNew.push({ isValid: true, value: '</span>' });
                                            wordLC = wordLC.substr(0, wordLC.length - 2);
                                            cutterR += 2;
                                            styleAdded = true;
                                        }

                                        //line-through
                                        if(styleLineThrough != -1 && wordLC.endsWith('~~'))
                                        {
                                            htmlNew[styleLineThrough].isValid = true;
                                            styleLineThrough = -1;
                                            htmlNew.push({ isValid: true, value: '</span>' });
                                            wordLC = wordLC.substr(0, wordLC.length - 2);
                                            cutterR += 2;
                                            styleAdded = true;
                                        }
                                    }

                                    if(wordLC.length > 1)
                                    {
                                        //italic
                                        if(styleItalic != -1 && wordLC.endsWith('*'))
                                        {
                                            htmlNew[styleItalic].isValid = true;
                                            styleItalic = -1;
                                            htmlNew.push({ isValid: true, value: '</span>' });
                                            wordLC = wordLC.substr(0, wordLC.length - 1);
                                            cutterR++;
                                            styleAdded = true;
                                        }
                                    }
                                } while(styleAdded);

                                //extract the word
                                if(cutterL != 0 || cutterR != 0)
                                {
                                    word = word.substr(cutterL, word.length - cutterL - cutterR);
                                }

                                //emojis
                                if(wordLC.length > 2 && wordLC.startsWith(':') && wordLC.endsWith(':') && (mapEmojis.has(wordLC) || mapGameIcons.has(wordLC)))
                                {
                                    let emojiId = mapEmojis.has(wordLC) ? mapEmojis.get(wordLC) : mapGameIcons.get(wordLC);
                                    if(emojiId.startsWith(':')) emojiId = mapEmojis.has(emojiId) ? mapEmojis.get(emojiId) : mapGameIcons.get(emojiId); //emoji alias
                                    let url = emojiId.startsWith('res:') ? HHCLUBCHATPLUSPLUS_URL_RES + 'emojis/' + emojiId.substr(4) : 'https://cdn.discordapp.com/emojis/' + emojiId + '.webp?size=48&quality=lossless';
                                    htmlNew[wordIndex].value = '<img class="emoji" src="' + url + '" title="' + wordLC + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">';
                                    htmlNew[wordIndex].isEmoji = true;
                                }
                                //custom emojis
                                else if(isCustomEmojiCode(word))
                                {
                                    let url = convertCustomEmojiCodeToUrl(word);
                                    htmlNew[wordIndex].value = '<img class="emoji" src="' + url + '" title=":CustomEmoji:" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">';
                                    htmlNew[wordIndex].isEmoji = true;
                                }
                                else if(config.Gif != '0' && !hasGif && wordLC.startsWith('!') && (mapGIFs.has(wordLC) || isCustomGifCode(word) || (wordLC.includes('_') && mapGIFs.has(wordLC.substr(0, wordLC.indexOf('_')))))) //gifs (only one gif per message allowed)
                                {
                                    emojiOnly = false;
                                    hasGif = true;

                                    let imgSrc;
                                    let gifTitle;
                                    if(isCustomGifCode(word))
                                    {
                                        wordLC = '';
                                        gifTitle = '!CustomGif';
                                        imgSrc = convertCustomGifCodeToUrl(word);
                                    }
                                    else
                                    {
                                        gifTitle = wordLC;

                                        let gifNr, gifCode;
                                        if(wordLC.includes('_'))
                                        {
                                            gifNr = parseInt(wordLC.substr(wordLC.indexOf('_') + 1));
                                            if(isNaN(gifNr)) gifNr = msgIdTimestampMs;
                                            gifCode = wordLC.substr(0, wordLC.indexOf('_'));
                                        }
                                        else
                                        {
                                            gifNr = msgIdTimestampMs;
                                            gifCode = wordLC;
                                        }

                                        let imgSrcArray = mapGIFs.get(gifCode);
                                        if(!Array.isArray(imgSrcArray)) imgSrcArray = mapGIFs.get(imgSrcArray); //gif alias
                                        imgSrc = imgSrcArray[gifNr % imgSrcArray.length];
                                    }

                                    let htmlGif = '<a href="' + (imgSrc.startsWith('https://') ? imgSrc : 'https://media.tenor.com/' + imgSrc) + '" target="_blank"><img ' + (config.Gif == 'sr' || isPinnedMsg ? 'class="smaller" ' : (config.Gif == 'sl' ? 'class="small" ' : '')) + 'src="' + (imgSrc.startsWith('https://') ? imgSrc : 'https://media.tenor.com/' + imgSrc) + '" title="' + gifTitle + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()"></a>';

                                    //are we at the beginning of the message?
                                    if(k == 0)
                                    {
                                        htmlNew[wordIndex].value = htmlGif;
                                    }
                                    else
                                    {
                                        //insert the gif at the beginning of the message and the gif code in the text
                                        htmlNew[wordIndex].value = wordLC;
                                        htmlNew.unshift({ isValid: true, value: htmlGif + ' ' });
                                    }
                                }
                                else
                                {
                                    emojiOnly = false;

                                    //add the word
                                    htmlNew[wordIndex].value = word;
                                }
                            }

                            //add space
                            if(k < htmlSplits.length - 1)
                            {
                                htmlNew.push({ isValid: true, value: ' ' });
                            }
                        }

                        if(isSpoiler)
                        {
                            htmlNew.unshift({ isValid: true, value: '<span class="spoiler" title="click to reveal spoiler" onClick="this.setAttribute(\'class\',\'spoiler-visible\');this.setAttribute(\'title\',\'\');ClubChat.resizeNiceScroll()">' });
                            htmlNew.push({ isValid: true, value: '</span>' });
                        }
                    }

                    if(htmlNew.length != 0)
                    {
                        //add new html
                        let htmlNewStr = '';
                        htmlNew.forEach(e => { htmlNewStr += e.isValid ? (emojiOnly && e.isEmoji ? e.value.replace('class="emoji"', 'class="emoji-only"') : e.value) : e.invalidValue });
                        node.lastElementChild.lastElementChild.innerHTML = htmlNewStr;

                        //scrolling
                        ClubChat.resizeNiceScrollAndUpdatePosition();
                        if(forceScrollDown) scrollDown();
                    }
                }
            }

            //delayed execution after the first message
            if(!firstMessageReceived)
            {
                firstMessageReceived = true;

                setTimeout(function() {
                    //parse the pinned message if there is one
                    parsePinnedMessage();

                    //resize custom tabs
                    resizeCustomTabs();

                    //bug fix for different browsers
                    fixTabs();

                    //important system message on start-up
                    /*
                setTimeout(function() {
                    //add a new node with the system message
                    let div = document.createElement('div');
                    div.setAttribute('class', 'chat-system-msg');
                    div.setAttribute('style', 'font-size:16px');
                    div.innerHTML = ' <b style="font-size:14px;font-weight:bold;color:red">-MM-:</b> <span style="font-size:14px;color:red">Kinkoid has changed the chat tabs system. The custom chat tabs have been temporarily disabled so that the chat can work again :)</span> ';
                    let lastChatMsgNodes = document.querySelectorAll('div.club-chat-messages.dark_subpanel_box div.chat-msg');
                    if(lastChatMsgNodes != null && lastChatMsgNodes.length != 0) lastChatMsgNodes[lastChatMsgNodes.length - 1].after(div);
                    scrollDown();
                }, 1000);
                */
                }, 300);
            }
        }
        const observerMessages = new MutationObserver(observerMessagesFunction);
        observerMessages.observe(document.querySelector('div.club-chat-messages.dark_subpanel_box'), { childList:true });

        //observe chat window users online/offline
        const observerOnline = new MutationObserver((mutations, observer) => {

            //members online/offline
            for(let i = 0; i < mutations.length; i++)
            {
                for(let j = 0; j < mutations[i].addedNodes.length; j++)
                {
                    let node = mutations[i].addedNodes[j];
                    let playerId = node.getAttribute('member_id');
                    cssOnline.sheet.insertRule('div.chat-msg[msg_id*=":'+playerId+':"] div.chat-msg-info span.chat-msg-sender span.active_light {background-color:#47bd0d;}');
                }
                for(let j = 0; j < mutations[i].removedNodes.length; j++)
                {
                    let node = mutations[i].removedNodes[j];
                    let playerId = node.getAttribute('member_id');
                    for (let k = 0; k < cssOnline.sheet.cssRules.length; k++)
                    {
                        if(cssOnline.sheet.cssRules[k].selectorText === 'div.chat-msg[msg_id*=":'+playerId+':"] div.chat-msg-info span.chat-msg-sender span.active_light')
                        {
                            cssOnline.sheet.deleteRule(k);
                            break;
                        }
                    }
                }
            }
        });
        observerOnline.observe(document.querySelector('div.chat-members-list div.online-members'), { childList:true });

        //observe chat window position, size and visible/invisible
        const observerChatWindow = new MutationObserver((mutations, observer) => {

            for(let i = 0; i < mutations.length; i++)
            {
                if(mutations[i].attributeName == 'class')
                {
                    //chat visible?
                    if(mutations[i].target.classList.contains('visible'))
                    {
                        if(lastMsgTimestampSeen < lastMsgTimestamp)
                        {
                            //update and save last seen message timestamp in localstore
                            lastMsgTimestampSeen = lastMsgTimestamp;
                            saveLastMsgTimestampSeen();

                            //reset ping message box when chat turns visible
                            pingMessageCount = 0;
                            window[0].postMessage({ HHCCPlusPlus: true, type: 'ping', pingMessageCount }, '*');
                        }

                        //update position and size of emojiKeyboard
                        updateEmojiKeyboardPositionAndSize(mutations[i].target);

                        //resize custom tabs
                        resizeCustomTabs();

                        //bug fix for different browsers
                        fixTabs();

                        //scroll down in the chat when chat turns visible
                        scrollDown();

                        //parse the pinned message if there is one
                        parsePinnedMessage();
                    }
                    else if(document.getElementById('emojikb-maindiv') != null)
                    {
                        //hide emojiKeyboard
                        document.getElementById('emojikb-maindiv').classList.add('emojikb-hidden');
                    }
                }
                else if(mutations[i].attributeName == 'style')
                {
                    //chat moved/resized
                    saveLastChatWindowPositionAndSize(mutations[i].target);

                    //update position and size of emojiKeyboard
                    updateEmojiKeyboardPositionAndSize(mutations[i].target);

                    //resize custom tabs
                    resizeCustomTabs();
                }
            }
        });
        observerChatWindow.observe(document.querySelector('#resize-chat-box'), { attributes:true });

        //sync enabled/disabled with the original input and send button
        const observerSendMsg = new MutationObserver((mutations, observer) => {

            let clubChatDisconnected = -1;
            for(let i = 0; i < mutations.length; i++)
            {
                if(mutations[i].attributeName == 'disabled')
                {
                    let custom = null;
                    if(mutations[i].target.className == 'club-chat-input')
                    {
                        custom = document.querySelector('input.club-chat-input-custom');
                    }
                    else
                    {
                        custom = document.querySelector('button.club-chat-send-custom');
                    }
                    if(mutations[i].target.getAttribute('disabled') == null)
                    {
                        custom.removeAttribute('disabled');
                        clubChatDisconnected = 0;
                    }
                    else
                    {
                        custom.setAttribute('disabled', 'disabled');

                        //if we are muted, we do not try to reconnect. we don't know, if we are still connected because ClubChat.isConnected is set to false even when the chat (read only) is connected and working... (at least at this breakpoint)
                        if(!ClubChat.isMuted) clubChatDisconnected = 1;
                    }
                }
            }

            //scroll down in the chat after init (or disconnect), if the scrollbar is at the top
            if(clubChatDisconnected == 0 && ClubChat.$msgHolder[0].scrollTop == 0)
            {
                scrollDown();
            }
            //if the chat disconnects after init, we try to reconnect (do not reconnect if theres a new session => "chatserver" popup message)
            else if(clubChatDisconnected == 1 && ClubChat.hasInit && !ClubChat.isConnected)
            {
                window[0].postMessage({ HHCCPlusPlus: true, type: 'disconnected' }, '*');
            }
        });
        observerSendMsg.observe(document.querySelector('input.club-chat-input'), { attributes:true });
        observerSendMsg.observe(document.querySelector('button.club-chat-send'), { attributes:true });

        //iFrame onload event
        document.getElementById("hh_game").onload = function() {

            //do we still have new ping messages? if yes, display the ping notification box again
            if(pingMessageCount != 0)
            {
                window[0].postMessage({ HHCCPlusPlus: true, type: 'ping', pingMessageCount }, '*');
            }
        };

        //window resize event
        window.addEventListener('resize', function() {

            //update position and size of emojiKeyboard
            updateEmojiKeyboardPositionAndSize(document.getElementById('resize-chat-box'));

            //resize custom tabs
            resizeCustomTabs();
        });

        function createNewInputAndSendButton()
        {
            //create new input and send button
            let container = document.querySelector('div.send-block-container');
            let input = document.createElement("input");
            input.setAttribute('class', 'club-chat-input-custom');
            input.setAttribute('maxlength', MAX_MESSAGE_SIZE - HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG_MAX_LENGTH - 1); //real maxlength is 500
            if(document.querySelector('input.club-chat-input').getAttribute('disabled') != null) input.setAttribute('disabled', 'disabled');
            input.addEventListener("keyup", onInputKeyUp_HHCCPlusPLus);
            container.appendChild(input);

            let btnSend = document.createElement('button');
            btnSend.setAttribute('class', 'club-chat-send-custom');
            if(document.querySelector('button.club-chat-send').getAttribute('disabled') != null) btnSend.setAttribute('disabled', 'disabled');
            btnSend.addEventListener("click", send_msg_HHCCPlusPLus);
            container.appendChild(btnSend);

            let rightArrow_mix_icn = document.createElement('span');
            rightArrow_mix_icn.setAttribute('class', 'rightArrow_mix_icn');
            btnSend.appendChild(rightArrow_mix_icn);

            //hide original input and send button
            document.querySelector('input.club-chat-input').setAttribute('style', 'display:none');
            document.querySelector('button.club-chat-send').setAttribute('style', 'display:none');

            function send_msg_HHCCPlusPLus()
            {
                let inputCustom = document.querySelector('input.club-chat-input-custom');
                if(inputCustom.value.length != 0)
                {
                    let text = inputCustom.value;
                    let textLC = text.toLowerCase();
                    let input = document.querySelector('input.club-chat-input');
                    inputCustom.value = '';

                    //change the commands /girl and /poses to make them language independent
                    let cmd = null;
                    if(textLC.startsWith('!hh ') && textLC.length > 4) { textLC = '/girl ' + textLC.substr(4); text = '/girl ' + text.substr(4); alert('!hh is deprecated. Try to use the new command /girl') } //TODO remove line (remove old commands !hh & !poses)
                    else if(textLC.startsWith('!poses ') && textLC.length > 7) { textLC = '/poses ' + textLC.substr(7); text = '/poses ' + text.substr(7); alert('!poses is deprecated. Try to use the new command /poses') } //TODO remove line (remove old commands !hh & !poses)
                    if(textLC.startsWith('/girl ') && textLC.length > 6) cmd = '/girl ';
                    else if(textLC.startsWith('/poses ') && textLC.length > 7) cmd = '/poses '; //TODO remove !poses
                    if(cmd != null)
                    {
                        let param1 = text.substr(cmd.length).trim();

                        //is it a girl name?
                        if(!strIsInt(param1))
                        {
                            let girlId = getGirlIdByName(param1, getGirlDictionary());
                            if(girlId != -1) text = cmd + girlId; //change the girl name to the girl id
                        }
                    }
                    else if(textLC.startsWith('/script'))
                    {
                        //send the /script text without HHCLUBCHATPLUSPLUS_INDICATOR
                        let param1 = text.substr(7);
                        input.value = param1 + ' Club Chat++ description and installation instructions: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus';
                        ClubChat.send_msg();
                        input.value = param1 + ' Club Chat++ direct link: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js';
                        ClubChat.send_msg();
                        return;
                    }

                    //NicknameColor
                    let msgInfo = HHCLUBCHATPLUSPLUS_INDICATOR;
                    if(config.NicknameColor == '1' && isHexColor(config.NicknameColor2))
                    {
                        msgInfo = convertHexColorToInv(config.NicknameColor2) + HHCLUBCHATPLUSPLUS_VERSION_INV_CONFIG + HHCLUBCHATPLUSPLUS_INDICATOR_INV_CONFIG; //AAAAAA + CONFIG_VERSION + CONFIG_INDICATOR
                    }

                    input.value = text + ' ' + msgInfo;
                    ClubChat.send_msg();
                }
            }

            function onInputKeyUp_HHCCPlusPLus(evt)
            {
                if(evt.key == 'Enter')
                {
                    send_msg_HHCCPlusPLus();
                }
                else if(evt.key == 'ArrowUp' || evt.key == 'ArrowDown')
                {
                    let input = document.querySelector('input.club-chat-input');
                    let oldText = input.value;
                    ClubChat.onInputKeyUp(evt);
                    let newText = input.value;
                    if(oldText != newText) document.querySelector('input.club-chat-input-custom').value = parseMessageInfo(newText).html;
                }
            }
        }

        function addInsertPingIntoInput()
        {
            //add insertPingIntoInput to members list (desktop version only)
            document.querySelector('div.chat-members-list').addEventListener('click', (e) => {
                if(!isMobile())
                {
                    if(e.target.tagName.toLowerCase() == 'p' && e.target.className == 'name-member')
                    {
                        //switch to chat and insert ping into input
                        document.getElementById('club_members_tab').click();
                        ClubChat.insertPingIntoInput(e.target);
                    }
                }
            });

            //add new function
            ClubChat.insertPingIntoInput = function(e) {

                let input = document.querySelector('.club-chat-input-custom');
                if(input.selectionStart || input.selectionStart == '0')
                {
                    let part1 = input.value.substr(0, input.selectionStart);
                    let part2 = input.value.substr(input.selectionEnd);
                    if(part1 != '' && !part1.endsWith(' ')) part1 += ' ';
                    if(!part2.startsWith(' ')) part2 = ' ' + part2;

                    input.value = part1 + '@' + e.innerHTML.replaceAll(' ', '_') + part2;
                    input.selectionStart = part1.length + 2 + e.innerHTML.length;
                    input.selectionEnd = input.selectionStart;
                }
                else
                {
                    input.value += '@' + e.innerHTML.replaceAll(' ', '_') + ' ';
                }
                input.focus();
            }
        }

        function checkPushVersion()
        {
            //return if there is already an update message
            if(document.getElementById('HHClubChatPlusPlus_UpdateMessage') != null) return;

            //check push version
            const img = new Image();
            img.src = HHCLUBCHATPLUSPLUS_URL_PUSHVERSION + '?' + Date.now() + '#' + Date.now();
            img.onload = function() {

                //bypass Cross-Origin Resource Sharing (CORS) policy: use a dummy image as version indicator
                let versionPushMajor = img.height - 1;
                let versionPushMinor = img.width - 1;
                let version = GM_info.script.version.split('.');
                if(parseInt(version[0]) < versionPushMajor || (parseInt(version[0]) == versionPushMajor && parseInt(version[1]) < versionPushMinor))
                {
                    let div = document.querySelector('#resize-chat-box div.chat-tabs');
                    let a = document.createElement('a');
                    a.setAttribute('id', 'HHClubChatPlusPlus_UpdateMessage');
                    a.setAttribute('style', 'color:red;margin-left:.3rem');
                    a.setAttribute('href', HHCLUBCHATPLUSPLUS_URL_DOWNLOAD);
                    a.setAttribute('target', '_blank');
                    a.innerHTML = 'HH Club Chat++ is outdated. Update now!';
                    div.appendChild(a);
                }
            }

            //check again in an hour
            setTimeout(checkPushVersion, 3600000);
        }

        function fixClubChat(attempts = 0)
        {
            //KK bug fixed: GAME_FEATURE_CLUB
            if(GAME_FEATURE_CLUB === false)
            {
                GAME_FEATURE_CLUB = true;
                console.warn('KK Bug detected. GAME_FEATURE_CLUB is set to false. It\'s fixed now :)');
            }

            if(!ClubChat.hasInit)
            {
                attempts++;
                if(ClubChat.chatVars != null) //dont do it at the beginning
                {
                    //user is not in a club if we do not have a chat token
                    if(ClubChat.chatVars.CHAT_TOKEN == '') return;

                    //chat init
                    ClubChat.init();
                }
            }

            //did it work?
            if(ClubChat.hasInit)
            {
                //update club id to prevent wrong call to unPinMsg()
                ClubChat.club_id = ClubChat.chatVars.CLUB_INFO.id_club;

                //add pinned message handler
                if(typeof ClubChat.hasPinnedMessageHandler == 'undefined' || !ClubChat.hasPinnedMessageHandler)
                {
                    ClubChat.hasPinnedMessageHandler = true;

                    //parse pinned messages
                    ClubChat.socket.on("pin", parsePinnedMessage);

                    //parse the pinned message if there already is one
                    parsePinnedMessage();
                }

                //run this code once when the chat is ready
                if(typeof ClubChat.hasFirstInit == 'undefined')
                {
                    ClubChat.hasFirstInit = true;

                    //add custom tabs
                    addCustomTabs();
                }
            }
            else //if no, we try it in a second again (up to 10 times)
            {
                if(attempts < 10)
                {
                    setTimeout(fixClubChat, 1000, attempts);
                }
                else
                {
                    //fix didnt work 10 times. wait 60 seconds
                    //setTimeout(fixClubChat, 60000);
                    //temporarily changed due to KK bug GAME_FEATURE_CLUB
                    setTimeout(fixClubChat, 10000);
                }
            }
        }

        function addCustomTabs()
        {
            //replace the default buttons as they can move the window
            if(document.getElementById('club_members_tab') !== null && document.getElementById('upgrades_tab') !== null)
            {
                //replace KK slideTab function
                slideTab = function slideTab(tabs_id, tab) {
                    if(typeof tab === 'undefined') return; //MM: code line added
                    var $slider = $("#" + tabs_id + ">.slider");
                    if (!$slider.length) {
                        return
                    }
                    var $tab = $("#" + tabs_id + '>button[data-tab="' + tab + '"]'); //MM: '>div[data-tab="' changed to '>button[data-tab="'
                    var tab_width = $tab.css("width");
                    var left = 0;
                    left = $tab[0].offsetLeft;
                    $slider.css({
                        width: tab_width,
                        left: left + "px"
                    })
                }

                //remove the buttons
                document.getElementById('club_members_tab').remove();
                document.getElementById('upgrades_tab').remove();

                //create new buttons
                css.sheet.insertRule('.chat-tabs button#club_members_tab {margin-left:0}');
                addNewTabButton('club_members_tab', 'chat_messages_list', 'background-image:url(https://hh2.hh-content.com/clubs-chat/ic_ChatBTN.png);background-size:23px;width:25px;height:25px');
                addNewTabButton('upgrades_tab', 'chat_members_list', '');
            }

            //css
            css.sheet.insertRule('.chat-tabs button.switch-tab.tab-switcher-fade-in {-webkit-box-shadow:none;-moz-box-shadow:none;box-shadow:none;}'); //active button

            //KK callback for all tab buttons
            let chatCb = function() {
                ClubChat.switchClubChatTab.bind(ClubChat)
            }

            //set our own tabs in ClubChat object for future use in initTabSystem + add the two default chat tabs
            ClubChat.tabs = {
                chat_messages_list: {
                    callback: chatCb
                },
                chat_members_list: {
                    callback: chatCb
                }
            };
            ClubChat.tabs.length = 2;

            //to use our own tabs, we inject some code before the initTabSystem function
            const initTabSystem_KK = initTabSystem;
            initTabSystem = function(tabs_id, tabs) {
                if(tabs_id === 'club-chat') {
                    arguments[1] = ClubChat.tabs; //replace tabs
                }
                initTabSystem_KK.apply(null, arguments); //forward all arguments
            }

            //custom chat tabs
            addNewTab(chatCb, 'chat_hhclubchatplusplus_settings', 'chat-hhclubchatplusplus-settings', 'background-image:url(https://hh2.hh-content.com/design/menu/panel.svg);background-size:26px', getTagContentSettings('chat-hhclubchatplusplus-settings'));
            addNewTab(chatCb, 'chat_hhclubchatplusplus_help', 'chat-hhclubchatplusplus-help', 'background-image:url(' + HHCLUBCHATPLUSPLUS_URL_RES + 'tabs/help.png);background-size:24px', getTabContentHelp());
            addNewTab(chatCb, 'chat_hhclubchatplusplus_info', 'chat-hhclubchatplusplus-info', 'background-image:url(https://hh2.hh-content.com/design/ic_info.svg);background-size:contain', getTabContentInfo());

            //init tab system
            initTabSystem('club-chat', ClubChat.tabs);

            //resize custom tabs
            resizeCustomTabs();

            //bug fix for different browsers + activate chat tab
            fixTabs();

            //delayed bug fix for different browsers
            setTimeout(function() {
                //resize custom tabs
                resizeCustomTabs();

                //bug fix for different browsers + activate chat tab
                fixTabs();
            }, 1);

            function addNewTabButton(id, name, iconStyle)
            {
                //add the button of a new tab
                let btnTab = document.createElement('button');
                btnTab.setAttribute('class', 'square_blue_btn switch-tab tab-switcher-fade-out');
                btnTab.setAttribute('id', id);
                btnTab.setAttribute('data-tab', name);
                btnTab.innerHTML = '<span class="clubMember_flat_icn" style="'+iconStyle+'"></span>';
                document.querySelector('div#club-chat-tabs').appendChild(btnTab);
            }

            function addNewTab(callback, name, bodyName, iconStyle, content)
            {
                //add the css of a new tab
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' a {color:white;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' li {margin-left:15px;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' span.title {font-weight:bold;color:rgb(255, 184, 39);display:inline-block;padding-bottom:4px;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' .nicescroll-rails div {background:linear-gradient(to top,#ffa23e 0,#ff545c 100%);webkit-box-shadow:0 2px 0 1px rgba(0,0,0,.35),inset 0 3px 0 rgba(255,232,192,.75);-moz-box-shadow:0 2px 0 1px rgba(0,0,0,.35),inset 0 3px 0 rgba(255,232,192,.75);box-shadow:0 2px 0 1px rgba(0,0,0,.35),inset 0 3px 0 rgba(255,232,192,.75);}');

                //add the data of a new tab
                ClubChat.tabs[name] = {
                    callback: callback
                }
                ClubChat.tabs.length++;

                //add the button of a new tab
                addNewTabButton(name + '_btn', name, iconStyle)

                //add the node of a new tab
                let tabNode = document.createElement('div');
                tabNode.setAttribute('id', name);
                tabNode.setAttribute('class', bodyName + ' dark_subpanel_box switch-tab-content');
                tabNode.setAttribute('style', 'padding:10px;font-family:Tahoma,Helvetica,Arial,sans-serif;line-height:1.4;');
                tabNode.setAttribute('tabindex', ClubChat.tabs.length);
                tabNode.innerHTML = content;
                document.querySelector('div.chat-active-wrapper').appendChild(tabNode);

                //create nice scrollbar
                $("div.chat-active-wrapper div." + bodyName).niceScroll();
            }

            function getTagContentSettings(bodyName)
            {
                //add the css of the settings tab
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' select option {color:#fff;background-color:#371820;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' select {width:150px;background-image: url("https://hh2.hh-content.com/pictures/design/form/down-arrow.png");}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' input {width:100px;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' button.blue_button_L {width:100px;margin-bottom:-1px;padding:0px 10px 0px 10px;font:400 14px / 32px "Carter One", "Alegreya Sans", sans-serif;}');
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ' select, div.chat-active-wrapper div.' + bodyName + ` input {
                appearance: none;
                background-color: rgba(0, 0, 0, 0.3);
                background-position-x: 100%;
                background-position-y: 50%;
                background-repeat: no-repeat;
                background-size: 37px;
                border-bottom-color: rgb(255, 162, 62);
                border-bottom-left-radius: 4px;
                border-bottom-right-radius: 4px;
                border-bottom-style: solid;
                border-bottom-width: 1px;
                border-image-outset: 0;
                border-image-repeat: stretch;
                border-image-slice: 100%;
                border-image-source: none;
                border-image-width: 1;
                border-left-color: rgb(255, 162, 62);
                border-left-style: solid;
                border-left-width: 1px;
                border-right-color: rgb(255, 162, 62);
                border-right-style: solid;
                border-right-width: 1px;
                border-top-color: rgb(255, 162, 62);
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                border-top-style: solid;
                border-top-width: 1px;
                box-shadow: rgb(198, 31, 82) 0px 2px 0px 0px, rgba(159, 7, 58, 0.6) 0px 0px 13px 0px, rgba(159, 7, 58, 0.95) 0px 0px 13px 0px;
                box-sizing: border-box;
                color: rgb(255, 255, 255);
                cursor: pointer;
                font-family: "Carter One", "Alegreya Sans", sans-serif;
                font-feature-settings: normal;
                font-kerning: auto;
                font-language-override: normal;
                font-optical-sizing: auto;
                font-palette: normal;
                font-size: 14px;
                font-size-adjust: none;
                font-stretch: 100%;
                font-style: normal;
                font-variant-alternates: normal;
                font-variant-caps: normal;
                font-variant-east-asian: normal;
                font-variant-ligatures: normal;
                font-variant-numeric: normal;
                font-variant-position: normal;
                font-variation-settings: normal;
                font-weight: 400;
                height: 32px;
                line-height: 32px;
                padding-left: 12px;
                text-rendering: optimizelegibility;
                vertical-align: bottom;
                -moz-text-size-adjust: none;
            }`);
                css.sheet.insertRule('div.chat-active-wrapper div.' + bodyName + ` label {
                width: 260px;
                display: inline-block;
                margin-top: 30px;
                font-family: "Carter One", "Alegreya Sans", sans-serif;
                font-size: 16px;
                font-weight: 400;
                letter-spacing: .22px;
                color: #fff;
                -webkit-text-shadow: 1px 1px 0 #000,-1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000;
                -moz-text-shadow: 1px 1px 0 #000,-1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000;
                text-shadow: 1px 1px 0 #000,-1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000;
            }`);

                //add global functions
                ClubChat.changeConfig = function(e) {
                    if(typeof config[e.name] != 'undefined')
                    {
                        config[e.name] = e.value;
                        saveConfigToLocalStorage(config);
                    }
                }
                ClubChat.changeConfigSponsors = function(e) {
                    if(playerId != -1)
                    {
                        if(isSponsorOrMM(playerId))
                        {
                            ClubChat.changeConfig(e);
                        }
                        else
                        {
                            alert('This feature is only available for sponsors to show my gratitude. The setting will not be applied.');
                        }
                    }
                }
                ClubChat.testSound = function(e) {
                    playSoundNewMessage(config[e.name], true);
                }

                //settings with all valid values
                let settings = [
                    { name: 'Gif', label: 'Show GIFs', options: [{ name: 'ON', value: '1' },
                                                                 { name: 'SMALL', value: 'sl' },
                                                                 { name: 'SMALLER', value: 'sr' },
                                                                 { name: 'OFF', value: '0' }]
                    },
                    { name: 'Image', label: 'Show images instead of URL', options: [{ name: 'ON', value: '1' },
                                                                                    { name: 'SMALL', value: 'sl' },
                                                                                    { name: 'SMALLER', value: 'sr' },
                                                                                    { name: 'OFF', value: '0' }]
                    },
                    { name: 'PosesInSpoilerBlock', label: 'Put girl poses in spoiler', options: [{ name: 'ON', value: '1' },
                                                                                                 { name: 'OFF', value: '0' }]
                    },
                    { name: 'NewMessageSound', label: 'Sound on new message', subtype: 'sound', options: [{ name: 'OFF', value: '0' },
                                                                                                          { name: '10%', value: '10' },
                                                                                                          { name: '20%', value: '20' },
                                                                                                          { name: '30%', value: '30' },
                                                                                                          { name: '40%', value: '40' },
                                                                                                          { name: '50%', value: '50' },
                                                                                                          { name: '60%', value: '60' },
                                                                                                          { name: '70%', value: '70' },
                                                                                                          { name: '80%', value: '80' },
                                                                                                          { name: '90%', value: '90' },
                                                                                                          { name: '100%', value: '100' }]
                    },
                    { name: 'NewPingSound', label: 'Sound on new ping', subtype: 'sound', options: [{ name: 'OFF', value: '0' },
                                                                                                    { name: '10%', value: '10' },
                                                                                                    { name: '20%', value: '20' },
                                                                                                    { name: '30%', value: '30' },
                                                                                                    { name: '40%', value: '40' },
                                                                                                    { name: '50%', value: '50' },
                                                                                                    { name: '60%', value: '60' },
                                                                                                    { name: '70%', value: '70' },
                                                                                                    { name: '80%', value: '80' },
                                                                                                    { name: '90%', value: '90' },
                                                                                                    { name: '100%', value: '100' }]
                    },
                    { name: 'SelfColor', label: 'Nickname Self Color', options: [{ name: 'ON', value: '1' },
                                                                                 { name: 'OFF', value: '0' }]
                    },
                    { name: 'NicknameColor', label: 'Nickname color', subtype: 'coloris', sponsorsOnly: true, options: [{ name: 'ON', value: '1' },
                                                                                                                        { name: 'OFF', value: '0' }]
                    },
                    { name: 'EmojiKeyboard', label: 'EmojiKeyboard behavior', options: [{ name: 'AUTO CLOSE', value: 'AutoClose' },
                                                                                        { name: 'STAY OPEN', value: 'StayOpen' }]
                    },
                    { name: 'ChatLog', label: 'Chat log in console', options: [{ name: 'ON', value: '1' },
                                                                               { name: 'OFF', value: '0' }]
                    },
                ];

                //build the html of the settings tab
                let html = '';
                for(let i = 0; i < settings.length; i++)
                {
                    html += '<div><label>' + settings[i].label + '</label><select name="' + settings[i].name + '" onchange="ClubChat.changeConfig' + (settings[i].sponsorsOnly ? 'Sponsors' : '') + '(this)">';
                    for(let j = 0; j < settings[i].options.length; j++)
                    {
                        html += '<option value="' + settings[i].options[j].value + '"' + (config[settings[i].name] == settings[i].options[j].value ? ' selected="selected"' : '') + '>' + settings[i].options[j].name + '</option>';
                    }
                    html += '</select>';

                    if(settings[i].subtype == 'coloris')
                    {
                        let name2 = settings[i].name + '2';
                        html += '<input style="margin-left:10px;" name="' + name2 + '" type="text" class="coloris" value="' + config[name2] + '" onchange="ClubChat.changeConfig(this)" />';
                    }
                    else if(settings[i].subtype == 'sound')
                    {
                        html += '<button style="margin-left:10px;" name="' + settings[i].name + '" class="blue_button_L" onclick="ClubChat.testSound(this)">Test</button>';
                    }
                    html += '</div>';
                }

                return html;
            }

            function getTabContentHelp()
            {
                let gifsRandom = '';
                mapGIFs.forEach((value, key) => { if((Array.isArray(value) && value.length != 1) || (!Array.isArray(value) && mapGIFs.get(value).length != 1)) gifsRandom += key + ' '; });
                return '<span class="title">SHARE THE SCRIPT</span><br/>' +
                    '/script <span style="font-style:italic;">&lt;optional text&gt;</span> = post the script links with an optional text (user friendly for non-script users)<br/>' +
                    '<br/>' +
                    '<span class="title">PING</span><br/>' +
                    '@club = ping all club members<br/>' +
                    '@online / @offline = ping all online/offline club members<br/>' +
                    '@<span style="font-style:italic;">&lt;membername&gt;</span> = ping a club member<br/>' +
                    'Note 1: Club members will receive a notification outside of the chat, when the chat is not open<br/>' +
                    'Note 2: Replace spaces with underscores. E.g. to ping John Doe write @John_Doe<br/>' +
                    'Note 3: Click on a nickname to ping (in chat or members list)<br/>' +
                    '<br/>' +
                    '<span class="title">DICE</span><br/>' +
                    '/dice = roll a dice (D6, 1-6)<br/>' +
                    '<br/>' +
                    '<span class="title">GIRL COMMANDS</span><br/>' +
                    '/girl <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link for a girl<br/>' +
                    '/poses <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link and all poses of a girl in a spoiler block<br/>' +
                    '<br/>' +
                    '<span class="title">TEXT FORMATTING</span><br/>' +
                    '*italic* = <span style="font-style:italic;">italic</span><br/>' +
                    '**bold** = <span style="font-weight:bold;">bold</span><br/>' +
                    '__underline__ = <span style="text-decoration:underline;">underlined</span><br/>' +
                    '~~strikethrough~~ = <span style="text-decoration:line-through;">strikethrough</span><br/>' +
                    '<br/>' +
                    '<span class="title">PLAINTEXT</span><br/>' +
                    '/plain <span style="font-style:italic;">&lt;text&gt;</span> = post text without text formatting<br/>' +
                    '<br/>' +
                    '<span class="title">SPOILER</span><br/>' +
                    '/spoiler <span style="font-style:italic;">&lt;text / images&gt;</span> = hide text and images in a spoiler block<br/>' +
                    '<br/>' +
                    '<span class="title">LINKS / IMAGES / GIRL POSES</span><br/>' +
                    'Links and images are clickable and open in a new tab. Post a URL to an image or a girl pose and it will be embedded in the chat.<br/>' +
                    '<br/>' +
                    '<span class="title">EMOJIS</span><br/>' +
                    'Check out the Emojis / GIFs Picker "EmojiKeyboard" for the current list. You can add custom emojis by clicking on the + sign<br/>' +
                    '<br/>' +
                    '<span class="title">GIFS</span><br/>' +
                    'Only one GIF per message allowed. GIF code can be used anywhere in the text. Check out the Emojis / GIFs Picker "EmojiKeyboard" for the current list. You can add custom GIFs by clicking on the + sign. The following random gifs are available: ' + gifsRandom + '<br/>' +
                    '<br/>' +
                    '<span class="title">MISCELLANEOUS</span><br/>' +
                    '- Your nickname is gold, the club leader is red, the club co leaders are orange and all members are blue<br/>' +
                    '- Online/Offline status added behind the nickname (with auto refresh)<br/>' +
                    '- ++ added behind the nickname (indicates who is using this script)<br/>' +
                    '- Added Emojis / GIFs Picker "EmojiKeyboard"<br/>' +
                    '- Chat window remains in its position and size<br/>' +
                    '- Auto Scrolling fixed. It scrolls only if the scrollbar is close to the bottom<br/>' +
                    '- Avatars are a bit bigger and clicking on them opens the hero page<br/>' +
                    '- Play sound on new message or ping<br/>' +
                    '- Chatlog in console<br/>' +
                    '- KK Bug Fixes: "Idle/Disconnect", "Chat disabled until click a menu", "Member list outside the window", "Chat broken after login"';
            }

            function getTabContentInfo()
            {
                let sponsorsList = [];
                const sponsors = getSponsors();

                //first add the sponsors for the current game
                sponsors.forEach((value, key) => {
                    if(key.startsWith(GAME_INFO.hostname + '/')) sponsorsList.push({ key, value });
                });

                //add the sponsors for the other games and exclude sponsors already added
                sponsors.forEach((value, key) => {
                    let i = 0;
                    for(; i < sponsorsList.length; i++) {
                        if(value.name === sponsorsList[i].value.name) break;
                    }
                    if(i === sponsorsList.length) sponsorsList.push({ key, value });
                });

                //sort sponsors by order number
                for(let i = 0; i < sponsorsList.length; i++) {
                    for(let j = 0; j < sponsorsList.length; j++) {
                        if(sponsorsList[i].value.order < sponsorsList[j].value.order) {
                            let tmp = sponsorsList[i];
                            sponsorsList[i] = sponsorsList[j];
                            sponsorsList[j] = tmp;
                        }
                    }
                }

                //create sponsors text
                let sponsorsText = '';
                for(let i = 0; i < sponsorsList.length; i++)
                {
                    if(sponsorsList[i].key.includes(GAME_INFO.hostname)){
                        // popup for profiles of current game
                        sponsorsText += '<li style="height:25px; cursor: pointer;" onclick="' +
                            'window[0].postMessage({ HHCCPlusPlus: true, type: \'heroPagePopup\', playerId: ' + sponsorsList[i].key.split('/').pop() + '}, \'*\');' +
                            'document.querySelector(\'#resize-chat-box div.chat-wrapper div.chat-container a.close_cross\').click();' +
                            '"> ' + sponsorsList[i].value.name;
                    } else {
                        // new tab for profiles of other games
                        sponsorsText += '<li style="height:25px;"><a style="text-decoration:none;" href="https://' + sponsorsList[i].key + '/profile.html" target="_blank">' + sponsorsList[i].value.name + '</a>';
                    }

                    let activeText = (sponsorsList[i].value.active ? 'Active' : 'Former');
                    let cssOpacity = (!sponsorsList[i].value.active ? ';opacity:30%' : '');
                    switch(sponsorsList[i].value.tier)
                    {
                        case 'gold': sponsorsText += '<img title="' + activeText + ' Gold Tier Supporter" style="height:20px;margin-left:10px' + cssOpacity + '" src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/9305494/eeec946e32054cb096050a17d1c70886/eyJ3Ijo0MDB9/2.png?token-time=2145916800&token-hash=JX_PWjK7Y4_--W2qHZlPBUycpjGkNKYlzObfAMFL8Yk%3D">'; break;
                        case 'silver': sponsorsText += '<img title="' + activeText + ' Silver Tier Supporter" style="height:20px;margin-left:10px' + cssOpacity + '" src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/9305480/1e49ca84119b4f9e9eb17f2f45afd721/eyJ3Ijo0MDB9/1.png?token-time=2145916800&token-hash=wvDQ5Jbn_P9sz6UR-rUJpv1Fu-qitHUxM-flB0d31qU%3D">'; break;
                        case 'bronze': sponsorsText += '<img title="' + activeText + ' Bronze Tier Supporter" style="height:20px;margin-left:10px' + cssOpacity + '" src="https://c10.patreonusercontent.com/4/patreon-media/p/reward/9305478/8e1f4980fe074ea080806bab81a0b5b9/eyJ3Ijo0MDB9/5.png?token-time=2145916800&token-hash=Dl_V_41v3sOy_1kDuVvn97sPETMjnyhNU2XTr71QRTQ%3D">'; break;
                        case 'coffee': sponsorsText += '<span title="' + activeText + ' Coffee Supporter" style="margin-left:10px' + cssOpacity + '" >☕</span>'; break;
                    }
                    sponsorsText += '</li>';
                }

                return '<span class="title">SCRIPT INFORMATION</span><br/>' +
                    'HH Club Chat++ Script v' + GM_info.script.version + '<br/>' +
                    'Web: <a href="https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus" target="_blank">HOMEPAGE</a> || <a href="https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/blob/main/CHANGELOG.md" target="_blank">CHANGELOG</a><br/>' +
                    '<br/>' +
                    'Script coded by <a style="text-decoration:none;" href="https://www.hentaiheroes.com/hero/4266159/profile.html" target="_blank">-MM-</a> and tested with club mates <a style="text-decoration:none;" href="https://www.hentaiheroes.com/clubs.html?view_club=1898" target="_blank">"Hērōēs Prāvī Forī [EN]"</a><br/>' +
                    'Compatible with Mozilla Firefox (Desktop), Google Chrome (Desktop & Android), Opera (Desktop), Firefox Nightly (Android), Kiwi Browser (Android)<br/>' +
                    '<br/>' +
                    '<span class="title">SPONSORS</span><br/>' +
                    'Special thanks to my sponsors!<br/>' +
                    sponsorsText +
                    '<br/>' +
                    'If you would like to support me, you can do so here:<br/><li><a href="https://www.patreon.com/HHMM" target="_blank">https://www.patreon.com/HHMM</a></li><li><a href="https://www.buymeacoffee.com/HHMM" target="_blank">https://www.buymeacoffee.com/HHMM</a></li>' +
                    '<br/>' +
                    '<span class="title">OTHER SCRIPTS</span><br/>' +
                    '<li><a href="https://github.com/HH-GAME-MM/HH-Harem" target="_blank">HH Harem</a></li>' +
                    '<li><a href="https://github.com/HH-GAME-MM/HH-Simulate-Headband-in-Pantheon" target="_blank">HH Simulate Headband in Pantheon</a></li>';
            }
        }

        function resizeCustomTabs()
        {
            let chatTabsHeight = document.querySelector('div.chat-tabs').getBoundingClientRect().height;
            let chatContainerHeight = document.querySelector('#resize-chat-box div.chat-wrapper div.chat-container').getBoundingClientRect().height;
            let newHeight = (chatContainerHeight - chatTabsHeight - 29) + 'px';

            ['settings', 'help', 'info'].forEach(function(e) {
                let $tab = $('div.chat-active-wrapper div.chat-hhclubchatplusplus-' + e);
                if($tab.length == 1)
                {
                    $tab[0].style.height = newHeight;
                    $tab.getNiceScroll().resize();
                }
            });
        }

        function fixTabs()
        {
            //bug fix for different browsers: The members list is outside the window at the first visit + the same behavior with the custom tabs

            //get active tab button (default tab is the chat)
            let activeTabBtn = document.querySelector('button.switch-tab.tab-switcher-fade-in');
            if(activeTabBtn === null) activeTabBtn = document.getElementById('club_members_tab');

            //click through all tabs
            let tabBtns = document.querySelectorAll('button.switch-tab');
            for(let i = 0; i < tabBtns.length; i++) {
                tabBtns[i].click();
            }

            //click last active tab button
            activeTabBtn.click();
        }

        function fixScrolling()
        {
            //replace scroll function
            ClubChat.updateScrollPosition = function() {

                //scroll only if the scrollbar is close to the bottom
                if (ClubChat.$msgHolder[0].scrollTop > getScrollTopMax() - 250)
                {
                    scrollDown();
                }
            }

            //add new scroll functions
            ClubChat.resizeNiceScrollAndUpdatePosition = function() {

                ClubChat.$msgHolder.getNiceScroll().resize();
                ClubChat.updateScrollPosition();
            }

            ClubChat.resizeNiceScroll = function() {

                ClubChat.$msgHolder.getNiceScroll().resize();
            }
        }

        function scrollDown()
        {
            ClubChat.$msgHolder[0].scrollTop = getScrollTopMax();
        }

        function getScrollTopMax()
        {
            return ClubChat.$msgHolder[0].scrollHeight - ClubChat.$msgHolder[0].clientHeight;
        }

        function parsePinnedMessage()
        {
            let pinnedMsgNode = document.querySelector('div.pinned-block div.container div');
            if(pinnedMsgNode != null && pinnedMsgNode.getAttribute('ParsedByHHClubChatPlusPlus') == null)
            {
                pinnedMsgNode.setAttribute('ParsedByHHClubChatPlusPlus', '1');
                let mr = {addedNodes: [pinnedMsgNode], target: pinnedMsgNode.parentNode, pinnedBlock: true};
                observerMessagesFunction([mr], observerMessages);
            }
        }

        function playSoundNewMessage(volumeStr, forcePlay = false)
        {
            //max. 1 beep in 3 seconds when chat is not visible
            if(volumeStr != '0' && (lastBeepTimestamp < Date.now() - 3000 || forcePlay))
            {
                lastBeepTimestamp = Date.now();

                if(sndNewMessage == null) sndNewMessage = new Audio("data:audio/wav;base64,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");
                sndNewMessage.volume = parseInt(volumeStr) / 100;
                sndNewMessage.currentTime = 0;
                sndNewMessage.play();
            }
        }

        function loadConfigFromLocalStorage()
        {
            let json = localStorage.getItem(KEY_CONFIG);
            let config = json != null ? JSON.parse(json) : { };

            //default config
            if(typeof config.Gif == 'undefined') config.Gif = '1'; //1 sl sr 0
            if(typeof config.Image == 'undefined') config.Image = '1'; //1 sl sr 0
            if(typeof config.SelfColor == 'undefined') config.SelfColor = '1'; //1 0
            if(typeof config.PosesInSpoilerBlock == 'undefined') config.PosesInSpoilerBlock = '1'; //1 0
            if(typeof config.EmojiKeyboard == 'undefined') config.EmojiKeyboard = 'AutoClose'; //AutoClose StayOpen
            if(typeof config.NewMessageSound == 'undefined') config.NewMessageSound = '0'; //0 - 100
            if(typeof config.NewPingSound == 'undefined') config.NewPingSound = '0'; //0 - 100
            if(typeof config.ChatLog == 'undefined') config.ChatLog = '0'; //1 0
            if(typeof config.NicknameColor == 'undefined') config.NicknameColor = '0'; //1 0
            if(typeof config.NicknameColor2 == 'undefined') config.NicknameColor2 = '#8a8ae6';

            return config;
        }

        function saveConfigToLocalStorage(config)
        {
            localStorage.setItem(KEY_CONFIG, JSON.stringify(config));
        }

        function loadOnlineOfflinePingsFromLocalStorage()
        {
            let json = localStorage.getItem(KEY_ONLINE_OFFLINE_PINGS);
            return json != null ? new Map(JSON.parse(json)) : new Map();
        }

        function saveOnlineOfflinePingsToLocalStorage(pings)
        {
            localStorage.setItem(KEY_ONLINE_OFFLINE_PINGS, JSON.stringify(Array.from(pings.entries())));
        }

        function cleanOnlineOfflinePingsInLocalStore()
        {
            let map = loadOnlineOfflinePingsFromLocalStorage();

            //remove pings older than 7 days
            let dateNow = Date.now();
            let keys = Array.from(map.keys());
            let mapOldSize = map.size;
            for(let i = 0; i < keys.length; i++)
            {
                let key = keys[i];
                let timestamp = parseInt(key.substr(0, key.indexOf('-')));
                if(timestamp < dateNow - 604800000) map.delete(key);
            }
            if(mapOldSize != map.size) saveOnlineOfflinePingsToLocalStorage(map);
            return map;
        }

        function loadLastMsgTimestampSeen()
        {
            let lastMsgTimestampSeenLS = localStorage.getItem(KEY_LAST_MESSAGE_TIMESTAMP_SEEN);
            return lastMsgTimestampSeenLS != null ? parseInt(lastMsgTimestampSeenLS) : 0;
        }

        function saveLastMsgTimestampSeen()
        {
            localStorage.setItem(KEY_LAST_MESSAGE_TIMESTAMP_SEEN, lastMsgTimestampSeen);
        }

        function loadLastChatWindowPositionAndSize(chatWnd)
        {
            //disabled on mobile
            if(!isMobile())
            {
                let vars = localStorage.getItem(KEY_POSITION_AND_SIZE);
                if(vars != null)
                {
                    let splits = vars.split(',');
                    if(splits.length == 4)
                    {
                        chatWnd.style.left = splits[0];
                        chatWnd.style.top = splits[1];
                        chatWnd.style.width = splits[2];
                        chatWnd.style.height = splits[3];
                    }
                }
            }
            else
            {
                localStorage.removeItem(KEY_POSITION_AND_SIZE);
            }
        }

        function saveLastChatWindowPositionAndSize(chatWnd)
        {
            //disabled on mobile
            if(!isMobile()) localStorage.setItem(KEY_POSITION_AND_SIZE, chatWnd.style.left + ',' + chatWnd.style.top + ',' + chatWnd.style.width + ',' + chatWnd.style.height);
        }

        function getGirlNameById(id, girlDictionary)
        {
            return girlDictionary != null && girlDictionary.has(id.toString()) ? girlDictionary.get(id.toString()).name : null;
        }

        function getGirlIdByName(name, girlDictionary)
        {
            if(girlDictionary != null)
            {
                //Case and ’´`' independent
                let nameLC = name.toLowerCase().replace(/[’´`']/g,'?');
                for (let [key, value] of girlDictionary) if(value.name.toLowerCase().replace(/[’´`']/g,'?') == nameLC) return key;
            }
            return -1;
        }

        function getGirlGradeById(id, girlDictionary)
        {
            if(girlDictionary != null && girlDictionary.has(id.toString()))
            {
                let grade = girlDictionary.get(id.toString()).grade;
                return typeof grade == 'undefined' ? -1 : grade;
            }
            return -1;
        }

        function getGirlDictionary()
        {
            let girlDictJSON = localStorage.getItem(KEY_GIRL_DICTIONARY);
            if (girlDictJSON != null) {
                return new Map(Object.entries(JSON.parse(girlDictJSON)));
            } else {
                // TODO suggest to open harem
                return new Map();
            }
        }

        function strIsInt(s)
        {
            if (typeof s != 'string') return false
            return !isNaN(s) && !isNaN(parseInt(s));
        }

        function isHexColor(value)
        {
            return /^#[0-9A-F]{6}$/i.test(value);
        }

        // deprecated: only used to decode old color format
        function convertBase64ToHexColor(base64)
        {
            let charCodes = atob(base64);
            let ret = '#';
            for(let i = 0; i < 3; i++)
            {
                let hex = charCodes.charCodeAt(i).toString(16);
                if(hex.length == 1) hex = '0' + hex;
                ret += hex;
            }
            return ret;
        }

        const mapHexToInv = { // mapping to invisible characters
            '0':'\u2000', '4':'\u2004', '8':'\u2008', 'c':'\u200C',
            '1':'\u2001', '5':'\u2005', '9':'\u2009', 'd':'\u200D',
            '2':'\u2002', '6':'\u2006', 'a':'\u200A', 'e':'\u200E',
            '3':'\u2003', '7':'\u2007', 'b':'\u200B', 'f':'\u200F',
            '#':''
        };

        const mapInvToHex = (()=>{
            let map = {};
            for(const [key, value] of Object.entries(mapHexToInv)) {
                map[value] = key;
            }
            return map;
        })();

        function convertHexColorToInv(hex)
        {
            let inv = '';
            hex.split('').forEach(c => {inv += mapHexToInv[c];});
            return inv;
        }

        function convertInvToHexColor(inv)
        {
            let hex = '#';
            inv.split('').forEach(c => {hex += mapInvToHex[c];});
            return hex;
        }

        function initColoris()
        {
            //coloris.js and coloris.css
            insertColorisJsCssFile();

            //init Coloris
            Coloris({
                el: '.coloris',
                theme: 'large',
                themeMode: 'dark',
                format: 'hex',
                alpha: false,
                swatches: [
                    "#9C27B0", "#3F51B5", "#03A9F4", "#009688", "#8BC34A", "#FFEB3B", "#FF9800", "#795548",
                    "#BA68C8", "#7986CB", "#4FC3F7", "#4DB6AC", "#AED581", "#FFF176", "#FFB74D", "#A1887F",
                    "#E1BEE7", "#C5CAE9", "#B3E5FC", "#B2DFDB", "#DCEDC8", "#FFF9C4", "#FFE0B2", "#D7CCC8",
                ],
            });
        }

        function insertColorisJsCssFile()
        {
            //coloris.js
            let jsFile = document.createElement('script');
            jsFile.innerHTML = `!function(u,p,s){var d,f,h,b,c,v,y,i,g,l,m,w,k,x,a,r=p.createElement("canvas").getContext("2d"),L={r:0,g:0,b:0,h:0,s:0,v:0,a:1},E={el:"[data-coloris]",parent:"body",theme:"default",themeMode:"light",wrap:!0,margin:2,format:"hex",formatToggle:!1,swatches:[],swatchesOnly:!1,alpha:!0,forceAlpha:!1,focusInput:!0,selectInput:!1,inline:!1,defaultColor:"#000000",clearButton:!1,clearLabel:"Clear",a11y:{open:"Open color picker",close:"Close color picker",marker:"Saturation: {s}. Brightness: {v}.",hueSlider:"Hue slider",alphaSlider:"Opacity slider",input:"Color value field",format:"Color format",swatch:"Color swatch",instruction:"Saturation and brightness selector. Use up, down, left and right arrow keys to select."}},n={},o="",S={},A=!1;function T(e){if("object"==typeof e)for(var t in e)switch(t){case"el":H(e.el),!1!==e.wrap&&N(e.el);break;case"parent":(d=p.querySelector(e.parent))&&(d.appendChild(f),E.parent=e.parent,d===p.body&&(d=null));break;case"themeMode":E.themeMode=e.themeMode,"auto"===e.themeMode&&u.matchMedia&&u.matchMedia("(prefers-color-scheme: dark)").matches&&(E.themeMode="dark");case"theme":e.theme&&(E.theme=e.theme),f.className="clr-picker clr-"+E.theme+" clr-"+E.themeMode,E.inline&&O();break;case"margin":e.margin*=1,E.margin=(isNaN(e.margin)?E:e).margin;break;case"wrap":e.el&&e.wrap&&N(e.el);break;case"formatToggle":E.formatToggle=!!e.formatToggle,X("clr-format").style.display=E.formatToggle?"block":"none",E.formatToggle&&(E.format="auto");break;case"swatches":Array.isArray(e.swatches)&&function(){var a=[];e.swatches.forEach(function(e,t){a.push('<button type="button" id="clr-swatch-'+t+'" aria-labelledby="clr-swatch-label clr-swatch-'+t+'" style="color: '+e+';">'+e+"</button>")}),X("clr-swatches").innerHTML=a.length?"<div>"+a.join("")+"</div>":"",E.swatches=e.swatches.slice()}();break;case"swatchesOnly":E.swatchesOnly=!!e.swatchesOnly,f.setAttribute("data-minimal",E.swatchesOnly);break;case"alpha":E.alpha=!!e.alpha,f.setAttribute("data-alpha",E.alpha);break;case"inline":E.inline=!!e.inline,f.setAttribute("data-inline",E.inline),E.inline&&(l=e.defaultColor||E.defaultColor,x=D(l),O(),j(l));break;case"clearButton":"object"==typeof e.clearButton&&(e.clearButton.label&&(E.clearLabel=e.clearButton.label,i.innerHTML=E.clearLabel),e.clearButton=e.clearButton.show),E.clearButton=!!e.clearButton,i.style.display=E.clearButton?"block":"none";break;case"clearLabel":E.clearLabel=e.clearLabel,i.innerHTML=E.clearLabel;break;case"a11y":var a,l,r=e.a11y,n=!1;if("object"==typeof r)for(var o in r)r[o]&&E.a11y[o]&&(E.a11y[o]=r[o],n=!0);n&&(a=X("clr-open-label"),l=X("clr-swatch-label"),a.innerHTML=E.a11y.open,l.innerHTML=E.a11y.swatch,v.setAttribute("aria-label",E.a11y.close),g.setAttribute("aria-label",E.a11y.hueSlider),m.setAttribute("aria-label",E.a11y.alphaSlider),y.setAttribute("aria-label",E.a11y.input),h.setAttribute("aria-label",E.a11y.instruction));default:E[t]=e[t]}}function C(e,t){"string"==typeof e&&"object"==typeof t&&(n[e]=t,A=!0)}function M(e){delete n[e],0===Object.keys(n).length&&(A=!1,e===o&&B())}function t(l){if(A){var e,r=["el","wrap","inline","defaultColor","a11y"];for(e in n)if("break"===function(e){var t=n[e];if(l.matches(e)){for(var a in o=e,S={},r.forEach(function(e){return delete t[e]}),t)S[a]=Array.isArray(E[a])?E[a].slice():E[a];return T(t),"break"}}(e))break}}function B(){0<Object.keys(S).length&&(T(S),o="",S={})}function H(e){U(p,"click",e,function(e){E.inline||(t(e.target),k=e.target,a=k.value,x=D(a),f.classList.add("clr-open"),O(),j(a),(E.focusInput||E.selectInput)&&y.focus({preventScroll:!0}),E.selectInput&&y.select(),k.dispatchEvent(new Event("open",{bubbles:!0})))}),U(p,"input",e,function(e){var t=e.target.parentNode;t.classList.contains("clr-field")&&(t.style.color=e.target.value)})}function O(){var e,t,a,l,r=d,n=u.scrollY,o=f.offsetWidth,i=f.offsetHeight,c={left:!1,top:!1},s={x:0,y:0};r&&(a=u.getComputedStyle(r),e=parseFloat(a.marginTop),l=parseFloat(a.borderTopWidth),(s=r.getBoundingClientRect()).y+=l+n),E.inline||(a=(t=k.getBoundingClientRect()).x,l=n+t.y+t.height+E.margin,r?(a-=s.x,l-=s.y,a+o>r.clientWidth&&(a+=t.width-o,c.left=!0),l+i>r.clientHeight-e&&i+E.margin<=t.top-(s.y-n)&&(l-=t.height+i+2*E.margin,c.top=!0),l+=r.scrollTop):(a+o>p.documentElement.clientWidth&&(a+=t.width-o,c.left=!0),l+i-n>p.documentElement.clientHeight&&i+E.margin<=t.top&&(l=n+t.y-i-E.margin,c.top=!0)),f.classList.toggle("clr-left",c.left),f.classList.toggle("clr-top",c.top),f.style.left=a+"px",f.style.top=l+"px"),b={width:h.offsetWidth,height:h.offsetHeight,x:f.offsetLeft+h.offsetLeft+s.x,y:f.offsetTop+h.offsetTop+s.y}}function N(e){p.querySelectorAll(e).forEach(function(e){var t,a=e.parentNode;a.classList.contains("clr-field")||((t=p.createElement("div")).innerHTML='<button type="button" aria-labelledby="clr-open-label"></button>',a.insertBefore(t,e),t.setAttribute("class","clr-field"),t.style.color=e.value,t.appendChild(e))})}function I(e){var t;k&&!E.inline&&(t=k,e&&(k=null,a!==t.value&&(t.value=a,t.dispatchEvent(new Event("input",{bubbles:!0})))),setTimeout(function(){a!==t.value&&t.dispatchEvent(new Event("change",{bubbles:!0}))}),f.classList.remove("clr-open"),A&&B(),t.dispatchEvent(new Event("close",{bubbles:!0})),E.focusInput&&t.focus({preventScroll:!0}),k=null)}function j(e){var t=function(e){var t;r.fillStyle="#000",r.fillStyle=e,(e=/^((rgba)|rgb)[\D]+([\d.]+)[\D]+([\d.]+)[\D]+([\d.]+)[\D]*?([\d.]+|$)/i.exec(r.fillStyle))?(t={r:+e[3],g:+e[4],b:+e[5],a:+e[6]}).a=+t.a.toFixed(2):(e=r.fillStyle.replace("#","").match(/.{2}/g).map(function(e){return parseInt(e,16)}),t={r:e[0],g:e[1],b:e[2],a:1});return t}(e),e=function(e){var t=e.r/255,a=e.g/255,l=e.b/255,r=s.max(t,a,l),n=s.min(t,a,l),o=r-n,i=r,c=0,n=0;o&&(r===t&&(c=(a-l)/o),r===a&&(c=2+(l-t)/o),r===l&&(c=4+(t-a)/o),r&&(n=o/r));return{h:(c=s.floor(60*c))<0?c+360:c,s:s.round(100*n),v:s.round(100*i),a:e.a}}(t);R(e.s,e.v),q(t,e),g.value=e.h,f.style.color="hsl("+e.h+", 100%, 50%)",l.style.left=e.h/360*100+"%",c.style.left=b.width*e.s/100+"px",c.style.top=b.height-b.height*e.v/100+"px",m.value=100*e.a,w.style.left=100*e.a+"%"}function D(e){e=e.substring(0,3).toLowerCase();return"rgb"===e||"hsl"===e?e:"hex"}function F(e){e=void 0!==e?e:y.value,k&&(k.value=e,k.dispatchEvent(new Event("input",{bubbles:!0}))),p.dispatchEvent(new CustomEvent("coloris:pick",{detail:{color:e}}))}function W(e,t){e={h:+g.value,s:e/b.width*100,v:100-t/b.height*100,a:m.value/100},t=function(e){var t=e.s/100,a=e.v/100,l=t*a,r=e.h/60,n=l*(1-s.abs(r%2-1)),o=a-l;l+=o,n+=o;t=s.floor(r)%6,a=[l,n,o,o,n,l][t],r=[n,l,l,n,o,o][t],t=[o,o,n,l,l,n][t];return{r:s.round(255*a),g:s.round(255*r),b:s.round(255*t),a:e.a}}(e);R(e.s,e.v),q(t,e),F()}function R(e,t){var a=E.a11y.marker;e=+e.toFixed(1),t=+t.toFixed(1),a=(a=a.replace("{s}",e)).replace("{v}",t),c.setAttribute("aria-label",a)}function Y(e){var t={pageX:((a=e).changedTouches?a.changedTouches[0]:a).pageX,pageY:(a.changedTouches?a.changedTouches[0]:a).pageY},a=t.pageX-b.x,t=t.pageY-b.y;d&&(t+=d.scrollTop),a=a<0?0:a>b.width?b.width:a,t=t<0?0:t>b.height?b.height:t,c.style.left=a+"px",c.style.top=t+"px",W(a,t),e.preventDefault(),e.stopPropagation()}function q(e,t){void 0===t&&(t={});var a,l,r=E.format;for(a in e=void 0===e?{}:e)L[a]=e[a];for(l in t)L[l]=t[l];var n,o=function(e){var t=e.r.toString(16),a=e.g.toString(16),l=e.b.toString(16),r="";e.r<16&&(t="0"+t);e.g<16&&(a="0"+a);e.b<16&&(l="0"+l);E.alpha&&(e.a<1||E.forceAlpha)&&(e=255*e.a|0,r=e.toString(16),e<16&&(r="0"+r));return"#"+t+a+l+r}(L),i=o.substring(0,7);switch(c.style.color=i,w.parentNode.style.color=i,w.style.color=o,v.style.color=o,h.style.display="none",h.offsetHeight,h.style.display="",w.nextElementSibling.style.display="none",w.nextElementSibling.offsetHeight,w.nextElementSibling.style.display="","mixed"===r?r=1===L.a?"hex":"rgb":"auto"===r&&(r=x),r){case"hex":y.value=o;break;case"rgb":y.value=(n=L,!E.alpha||1===n.a&&!E.forceAlpha?"rgb("+n.r+", "+n.g+", "+n.b+")":"rgba("+n.r+", "+n.g+", "+n.b+", "+n.a+")");break;case"hsl":y.value=(n=function(e){var t,a=e.v/100,l=a*(1-e.s/100/2);0<l&&l<1&&(t=s.round((a-l)/s.min(l,1-l)*100));return{h:e.h,s:t||0,l:s.round(100*l),a:e.a}}(L),!E.alpha||1===n.a&&!E.forceAlpha?"hsl("+n.h+", "+n.s+"%, "+n.l+"%)":"hsla("+n.h+", "+n.s+"%, "+n.l+"%, "+n.a+")")}p.querySelector('.clr-format [value="'+r+'"]').checked=!0}function e(){var e=+g.value,t=+c.style.left.replace("px",""),a=+c.style.top.replace("px","");f.style.color="hsl("+e+", 100%, 50%)",l.style.left=e/360*100+"%",W(t,a)}function P(){var e=m.value/100;w.style.left=100*e+"%",q({a:e}),F()}function X(e){return p.getElementById(e)}function U(e,t,a,l){var r=Element.prototype.matches||Element.prototype.msMatchesSelector;"string"==typeof a?e.addEventListener(t,function(e){r.call(e.target,a)&&l.call(e.target,e)}):(l=a,e.addEventListener(t,l))}function G(e,t){t=void 0!==t?t:[],"loading"!==p.readyState?e.apply(void 0,t):p.addEventListener("DOMContentLoaded",function(){e.apply(void 0,t)})}void 0!==NodeList&&NodeList.prototype&&!NodeList.prototype.forEach&&(NodeList.prototype.forEach=Array.prototype.forEach),u.Coloris=function(){var r={set:T,wrap:N,close:I,setInstance:C,removeInstance:M,updatePosition:O};function e(e){G(function(){e&&("string"==typeof e?H:T)(e)})}for(var t in r)!function(l){e[l]=function(){for(var e=arguments.length,t=new Array(e),a=0;a<e;a++)t[a]=arguments[a];G(r[l],t)}}(t);return e}(),G(function(){d=null,(f=p.createElement("div")).setAttribute("id","clr-picker"),f.className="clr-picker",f.innerHTML='<input id="clr-color-value" class="clr-color" type="text" value="" spellcheck="false" aria-label="'+E.a11y.input+'"><div id="clr-color-area" class="clr-gradient" role="application" aria-label="'+E.a11y.instruction+'"><div id="clr-color-marker" class="clr-marker" tabindex="0"></div></div><div class="clr-hue"><input id="clr-hue-slider" type="range" min="0" max="360" step="1" aria-label="'+E.a11y.hueSlider+'"><div id="clr-hue-marker"></div></div><div class="clr-alpha"><input id="clr-alpha-slider" type="range" min="0" max="100" step="1" aria-label="'+E.a11y.alphaSlider+'"><div id="clr-alpha-marker"></div><span></span></div><div id="clr-format" class="clr-format"><fieldset class="clr-segmented"><legend>'+E.a11y.format+'</legend><input id="clr-f1" type="radio" name="clr-format" value="hex"><label for="clr-f1">Hex</label><input id="clr-f2" type="radio" name="clr-format" value="rgb"><label for="clr-f2">RGB</label><input id="clr-f3" type="radio" name="clr-format" value="hsl"><label for="clr-f3">HSL</label><span></span></fieldset></div><div id="clr-swatches" class="clr-swatches"></div><button type="button" id="clr-clear" class="clr-clear">'+E.clearLabel+'</button><button type="button" id="clr-color-preview" class="clr-preview" aria-label="'+E.a11y.close+'"></button><span id="clr-open-label" hidden>'+E.a11y.open+'</span><span id="clr-swatch-label" hidden>'+E.a11y.swatch+"</span>",p.body.appendChild(f),h=X("clr-color-area"),c=X("clr-color-marker"),i=X("clr-clear"),v=X("clr-color-preview"),y=X("clr-color-value"),g=X("clr-hue-slider"),l=X("clr-hue-marker"),m=X("clr-alpha-slider"),w=X("clr-alpha-marker"),H(E.el),N(E.el),U(f,"mousedown",function(e){f.classList.remove("clr-keyboard-nav"),e.stopPropagation()}),U(h,"mousedown",function(e){U(p,"mousemove",Y)}),U(h,"touchstart",function(e){p.addEventListener("touchmove",Y,{passive:!1})}),U(c,"mousedown",function(e){U(p,"mousemove",Y)}),U(c,"touchstart",function(e){p.addEventListener("touchmove",Y,{passive:!1})}),U(y,"change",function(e){(k||E.inline)&&(j(y.value),F())}),U(i,"click",function(e){F(""),I()}),U(v,"click",function(e){F(),I()}),U(p,"click",".clr-format input",function(e){x=e.target.value,q(),F()}),U(f,"click",".clr-swatches button",function(e){j(e.target.textContent),F(),E.swatchesOnly&&I()}),U(p,"mouseup",function(e){p.removeEventListener("mousemove",Y)}),U(p,"touchend",function(e){p.removeEventListener("touchmove",Y)}),U(p,"mousedown",function(e){f.classList.remove("clr-keyboard-nav"),I()}),U(p,"keydown",function(e){"Escape"===e.key?I(!0):"Tab"===e.key&&f.classList.add("clr-keyboard-nav")}),U(p,"click",".clr-field button",function(e){A&&B(),e.target.nextElementSibling.dispatchEvent(new Event("click",{bubbles:!0}))}),U(c,"keydown",function(e){var t={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]};-1!==Object.keys(t).indexOf(e.key)&&(!function(e,t){e=+c.style.left.replace("px","")+e,t=+c.style.top.replace("px","")+t,c.style.left=e+"px",c.style.top=t+"px",W(e,t)}.apply(void 0,t[e.key]),e.preventDefault())}),U(h,"click",Y),U(g,"input",e),U(m,"input",P)})}(window,document,Math);`;
            document.head.appendChild(jsFile);

            //coloris.css
            let cssFile = document.createElement('style');
            cssFile.innerHTML = `.clr-picker{display:none;flex-wrap:wrap;position:absolute;width:200px;z-index:1000;border-radius:10px;background-color:#fff;justify-content:space-between;box-shadow:0 0 5px rgba(0,0,0,.05),0 5px 20px rgba(0,0,0,.1);-moz-user-select:none;-webkit-user-select:none;user-select:none}.clr-picker.clr-open,.clr-picker[data-inline=true]{display:flex}.clr-picker[data-inline=true]{position:relative}.clr-gradient{position:relative;width:100%;height:100px;margin-bottom:15px;border-radius:3px 3px 0 0;background-image:linear-gradient(rgba(0,0,0,0),#000),linear-gradient(90deg,#fff,currentColor);cursor:pointer}.clr-marker{position:absolute;width:12px;height:12px;margin:-6px 0 0 -6px;border:1px solid #fff;border-radius:50%;background-color:currentColor;cursor:pointer}.clr-picker input[type=range]::-webkit-slider-runnable-track{width:100%;height:8px}.clr-picker input[type=range]::-webkit-slider-thumb{width:8px;height:8px;-webkit-appearance:none}.clr-picker input[type=range]::-moz-range-track{width:100%;height:8px;border:0}.clr-picker input[type=range]::-moz-range-thumb{width:8px;height:8px;border:0}.clr-hue{background-image:linear-gradient(to right,red 0,#ff0 16.66%,#0f0 33.33%,#0ff 50%,#00f 66.66%,#f0f 83.33%,red 100%)}.clr-alpha,.clr-hue{position:relative;width:calc(100% - 40px);height:8px;margin:5px 20px;border-radius:4px}.clr-alpha span{display:block;height:100%;width:100%;border-radius:inherit;background-image:linear-gradient(90deg,rgba(0,0,0,0),currentColor)}.clr-alpha input,.clr-hue input{position:absolute;width:calc(100% + 16px);height:16px;left:-8px;top:-4px;margin:0;background-color:transparent;opacity:0;cursor:pointer;appearance:none;-webkit-appearance:none}.clr-alpha div,.clr-hue div{position:absolute;width:16px;height:16px;left:0;top:50%;margin-left:-8px;transform:translateY(-50%);border:2px solid #fff;border-radius:50%;background-color:currentColor;box-shadow:0 0 1px #888;pointer-events:none}.clr-alpha div:before{content:'';position:absolute;height:100%;width:100%;left:0;top:0;border-radius:50%;background-color:currentColor}.clr-format{display:none;order:1;width:calc(100% - 40px);margin:0 20px 20px}.clr-segmented{display:flex;position:relative;width:100%;margin:0;padding:0;border:1px solid #ddd;border-radius:15px;box-sizing:border-box;color:#999;font-size:12px}.clr-segmented input,.clr-segmented legend{position:absolute;width:100%;height:100%;margin:0;padding:0;border:0;left:0;top:0;opacity:0;pointer-events:none}.clr-segmented label{flex-grow:1;padding:4px 0;text-align:center;cursor:pointer}.clr-segmented label:first-of-type{border-radius:10px 0 0 10px}.clr-segmented label:last-of-type{border-radius:0 10px 10px 0}.clr-segmented input:checked+label{color:#fff;background-color:#666}.clr-swatches{order:2;width:calc(100% - 32px);margin:0 16px}.clr-swatches div{display:flex;flex-wrap:wrap;padding-bottom:12px;justify-content:center}.clr-swatches button{position:relative;width:20px;height:20px;margin:0 4px 6px 4px;border:0;border-radius:50%;color:inherit;text-indent:-1000px;white-space:nowrap;overflow:hidden;cursor:pointer}.clr-swatches button:after{content:'';display:block;position:absolute;width:100%;height:100%;left:0;top:0;border-radius:inherit;background-color:currentColor;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}input.clr-color{order:1;width:calc(100% - 80px);height:32px;margin:15px 20px 20px 0;padding:0 10px;border:1px solid #ddd;border-radius:16px;color:#444;background-color:#fff;font-family:sans-serif;font-size:14px;text-align:center;box-shadow:none}input.clr-color:focus{outline:0;border:1px solid #1e90ff}.clr-clear{display:none;order:2;height:24px;margin:0 20px 20px auto;padding:0 20px;border:0;border-radius:12px;color:#fff;background-color:#666;font-family:inherit;font-size:12px;font-weight:400;cursor:pointer}.clr-preview{position:relative;width:32px;height:32px;margin:15px 0 20px 20px;border:0;border-radius:50%;overflow:hidden;cursor:pointer}.clr-preview:after,.clr-preview:before{content:'';position:absolute;height:100%;width:100%;left:0;top:0;border:1px solid #fff;border-radius:50%}.clr-preview:after{border:0;background-color:currentColor;box-shadow:inset 0 0 0 1px rgba(0,0,0,.1)}.clr-alpha div,.clr-color,.clr-hue div,.clr-marker{box-sizing:border-box}.clr-field{display:inline-block;position:relative;color:transparent}.clr-field button{position:absolute;width:30px;height:100%;right:0;top:50%;transform:translateY(-50%);border:0;color:inherit;text-indent:-1000px;white-space:nowrap;overflow:hidden;pointer-events:none}.clr-field button:after{content:'';display:block;position:absolute;width:100%;height:100%;left:0;top:0;border-radius:inherit;background-color:currentColor;box-shadow:inset 0 0 1px rgba(0,0,0,.5)}.clr-alpha,.clr-alpha div,.clr-field button,.clr-preview:before,.clr-swatches button{background-image:repeating-linear-gradient(45deg,#aaa 25%,transparent 25%,transparent 75%,#aaa 75%,#aaa),repeating-linear-gradient(45deg,#aaa 25%,#fff 25%,#fff 75%,#aaa 75%,#aaa);background-position:0 0,4px 4px;background-size:8px 8px}.clr-marker:focus{outline:0}.clr-keyboard-nav .clr-alpha input:focus+div,.clr-keyboard-nav .clr-hue input:focus+div,.clr-keyboard-nav .clr-marker:focus,.clr-keyboard-nav .clr-segmented input:focus+label{outline:0;box-shadow:0 0 0 2px #1e90ff,0 0 2px 2px #fff}.clr-picker[data-alpha=false] .clr-alpha{display:none}.clr-picker[data-minimal=true]{padding-top:16px}.clr-picker[data-minimal=true] .clr-alpha,.clr-picker[data-minimal=true] .clr-color,.clr-picker[data-minimal=true] .clr-gradient,.clr-picker[data-minimal=true] .clr-hue,.clr-picker[data-minimal=true] .clr-preview{display:none}.clr-dark{background-color:#444}.clr-dark .clr-segmented{border-color:#777}.clr-dark .clr-swatches button:after{box-shadow:inset 0 0 0 1px rgba(255,255,255,.3)}.clr-dark input.clr-color{color:#fff;border-color:#777;background-color:#555}.clr-dark input.clr-color:focus{border-color:#1e90ff}.clr-dark .clr-preview:after{box-shadow:inset 0 0 0 1px rgba(255,255,255,.5)}.clr-dark .clr-alpha,.clr-dark .clr-alpha div,.clr-dark .clr-preview:before,.clr-dark .clr-swatches button{background-image:repeating-linear-gradient(45deg,#666 25%,transparent 25%,transparent 75%,#888 75%,#888),repeating-linear-gradient(45deg,#888 25%,#444 25%,#444 75%,#888 75%,#888)}.clr-picker.clr-polaroid{border-radius:6px;box-shadow:0 0 5px rgba(0,0,0,.1),0 5px 30px rgba(0,0,0,.2)}.clr-picker.clr-polaroid:before{content:'';display:block;position:absolute;width:16px;height:10px;left:20px;top:-10px;border:solid transparent;border-width:0 8px 10px 8px;border-bottom-color:currentColor;box-sizing:border-box;color:#fff;filter:drop-shadow(0 -4px 3px rgba(0,0,0,.1));pointer-events:none}.clr-picker.clr-polaroid.clr-dark:before{color:#444}.clr-picker.clr-polaroid.clr-left:before{left:auto;right:20px}.clr-picker.clr-polaroid.clr-top:before{top:auto;bottom:-10px;transform:rotateZ(180deg)}.clr-polaroid .clr-gradient{width:calc(100% - 20px);height:120px;margin:10px;border-radius:3px}.clr-polaroid .clr-alpha,.clr-polaroid .clr-hue{width:calc(100% - 30px);height:10px;margin:6px 15px;border-radius:5px}.clr-polaroid .clr-alpha div,.clr-polaroid .clr-hue div{box-shadow:0 0 5px rgba(0,0,0,.2)}.clr-polaroid .clr-format{width:calc(100% - 20px);margin:0 10px 15px}.clr-polaroid .clr-swatches{width:calc(100% - 12px);margin:0 6px}.clr-polaroid .clr-swatches div{padding-bottom:10px}.clr-polaroid .clr-swatches button{width:22px;height:22px}.clr-polaroid input.clr-color{width:calc(100% - 60px);margin:10px 10px 15px 0}.clr-polaroid .clr-clear{margin:0 10px 15px auto}.clr-polaroid .clr-preview{margin:10px 0 15px 10px}.clr-picker.clr-large{width:275px}.clr-large .clr-gradient{height:150px}.clr-large .clr-swatches button{width:22px;height:22px}.clr-picker.clr-pill{width:380px;padding-left:180px;box-sizing:border-box}.clr-pill .clr-gradient{position:absolute;width:180px;height:100%;left:0;top:0;margin-bottom:0;border-radius:3px 0 0 3px}.clr-pill .clr-hue{margin-top:20px}`;
            document.head.appendChild(cssFile);
        }

        function initEmojiKeyboard()
        {
            //fuse.js
            let fuseJsFile = document.createElement('script');
            fuseJsFile.src = 'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js';
            fuseJsFile.onload = initEmojiKeyboard_OnLoad;
            document.head.appendChild(fuseJsFile);

            //emoji_keyboard.css
            insertEmojiKeyboardCssFile();

            //emojiKeyboard button
            let btnEmojisGIFs = document.createElement('button');
            btnEmojisGIFs.setAttribute('id', 'btnEmojisGIFs');
            document.querySelector('.club-chat-input-custom').parentNode.appendChild(btnEmojisGIFs);
        }

        function initEmojiKeyboard_OnLoad()
        {
            //emojiKeyboard
            emojiKeyboard = new EmojiKeyboard;
            emojiKeyboard.resizable = false;
            emojiKeyboard.auto_reconstruction = true;
            emojiKeyboard.default_placeholder = "Search GIF / Emoji ...";
            emojiKeyboard.customEmojiGifDeleteMode = 0;
            emojiKeyboard.customEmojiGifSortMode = 0;
            emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = null;
            emojiKeyboard.callback = (emoji, closed) => {

                //SortMode for custom Emojis/Gifs enabled?
                if(emojiKeyboard.customEmojiGifSortMode > 0)
                {
                    if(emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif == null)
                    {
                        emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = emoji.emoji;
                        emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emoji.emoji + '"]').classList.add('MoveSwapMode_Selected');
                    }
                    else if(emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif == emoji.emoji)
                    {
                        emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = null;
                        emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emoji.emoji + '"]').classList.remove('MoveSwapMode_Selected');
                    }
                    else
                    {
                        let emojiGif1 = emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif;
                        let emojiGif2 = emoji.emoji;

                        if(emojiGif1 != emojiGif2)
                        {
                            emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = null;
                            let isMoveMode = (emojiKeyboard.customEmojiGifSortMode == 1); //2 = SwapMode

                            let isEmoji1 = isCustomEmojiCode(emojiGif1);
                            let isEmoji2 = isCustomEmojiCode(emojiGif2);
                            let isGif1 = isCustomGifCode(emojiGif1);
                            let isGif2 = isCustomGifCode(emojiGif2);

                            let ret = false;
                            if(isEmoji1 && isEmoji2)
                            {
                                if(isMoveMode) ret = moveCustomEmojiInLocalStore(emojiGif1, emojiGif2);
                                else ret = swapCustomEmojiInLocalStore(emojiGif1, emojiGif2);
                            }
                            else if(isGif1 && isGif2)
                            {
                                if(isMoveMode) ret = moveCustomGifInLocalStore(emojiGif1, emojiGif2);
                                else ret = swapCustomGifInLocalStore(emojiGif1, emojiGif2);
                            }
                            else
                            {
                                if(isMoveMode) alert('Movement is invalid. A custom gif / emoji cannot be moved in front of a non-custom gif / emoji or into a different category.');
                                else alert('Movement is invalid. A custom gif / emoji cannot be swapped with a non-custom gif / emoji or into a different category.');
                            }
                            if(ret)
                            {
                                let nodeEmojiGif1 = emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emojiGif1 + '"]');
                                let nodeEmojiGif2 = emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emojiGif2 + '"]');

                                if(isMoveMode)
                                {
                                    //move
                                    nodeEmojiGif2.before(nodeEmojiGif1);
                                }
                                else
                                {
                                    //swap
                                    let oldPosNode1 = document.createElement("span");
                                    nodeEmojiGif1.before(oldPosNode1);
                                    nodeEmojiGif2.before(nodeEmojiGif1);
                                    oldPosNode1.replaceWith(nodeEmojiGif2);
                                }

                                //remove selected style
                                nodeEmojiGif1.classList.remove('selected');
                                nodeEmojiGif2.classList.remove('selected');
                                nodeEmojiGif1.classList.remove('MoveSwapMode_Selected');
                            }
                        }
                    }
                }
                //DeleteMode for custom Emojis/Gifs enabled?
                else if(emojiKeyboard.customEmojiGifDeleteMode > 0)
                {
                    let isEmoji = isCustomEmojiCode(emoji.emoji);
                    let isGif = false;
                    let ret = false;
                    if(isEmoji)
                    {
                        ret = removeCustomEmojiFromLocalStorage(emoji.emoji);
                    }
                    else
                    {
                        isGif = isCustomGifCode(emoji.emoji);
                        if(isGif) ret = removeCustomGifFromLocalStorage(emoji.emoji);
                    }
                    if(ret) emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emoji.emoji + '"]').remove();
                }
                else
                {
                    let input = document.querySelector('.club-chat-input-custom');
                    if(input.selectionStart || input.selectionStart == '0')
                    {
                        let part1 = input.value.substr(0, input.selectionStart);
                        let part2 = input.value.substr(input.selectionEnd);
                        if(part1 != '' && !part1.endsWith(' ')) part1 += ' ';
                        if(!part2.startsWith(' ')) part2 = ' ' + part2;

                        input.value = part1 + emoji.emoji + part2;
                        input.selectionStart = part1.length + 1 + emoji.emoji.length;
                        input.selectionEnd = input.selectionStart;
                    }
                    else
                    {
                        input.value += emoji.emoji + ' ';
                    }
                    input.focus();
                }
            };

            //emojiKeyboard css
            let emojiKeyboardCss = document.createElement('style');
            document.head.appendChild(emojiKeyboardCss);
            emojiKeyboardCss.sheet.insertRule('img.emojikb-emoji[data-category="GIFs"] { width: auto; height: auto; max-width: 200px; max-height: 100px; }');

            //add Emojis/GameIcons to emojiKeyboard
            function addEmojisToCategory(map, category) {
                let emojiList = emojiKeyboard.emojis.get(category);
                map.forEach((value, key) => {
                    //is it not an alias?
                    if(!value.startsWith(':'))
                    {
                        emojiList.push({
                            url: value.startsWith('res:') ? HHCLUBCHATPLUSPLUS_URL_RES + 'emojis/' + value.substr(4) : 'https://cdn.discordapp.com/emojis/' + value + '.webp?size=48&quality=lossless',
                            name: key,
                            emoji: key,
                            unicode: key
                        });
                    }
                });
            }
            addEmojisToCategory(mapEmojis,'Emojis');
            addEmojisToCategory(mapGameIcons,'HH');

            //add custom emojis to emojiKeyboard
            let emojiKeyboardEmojis = emojiKeyboard.emojis.get('Emojis');
            let customEmojis = loadCustomEmojisFromLocalStorage();
            customEmojis.forEach(e => {
                emojiKeyboardEmojis.push({
                    url: convertCustomEmojiCodeToUrl(e),
                    name: e,
                    emoji: e,
                    unicode: e
                });
            });

            //add gifs to emojiKeyboard
            let emojiKeyboardGIFs = emojiKeyboard.emojis.get('GIFs');
            mapGIFs.forEach((value, key) => {
                //is it not an alias?
                if(Array.isArray(value))
                {
                    for(let i = 0; i < value.length; i++)
                    {
                        let imgSrc = value[i];
                        let url = imgSrc.startsWith('https://') ? imgSrc : 'https://media.tenor.com/' + imgSrc;
                        let directKey = key + (value.length != 1 ? '_' + i : '');

                        emojiKeyboardGIFs.push({
                            url: url,
                            name: directKey,
                            emoji: directKey,
                            unicode: directKey,
                        });
                    }
                }
            });

            //add custom gifs to emojiKeyboard
            let customGifs = loadCustomGifsFromLocalStorage();
            customGifs.forEach(e => {
                emojiKeyboardGIFs.push({
                    url: convertCustomGifCodeToUrl(e),
                    name: e,
                    emoji: e,
                    unicode: e
                });
            });

            //emojiKeyboard init
            emojiKeyboard.instantiate(document.getElementById('btnEmojisGIFs'));

            //hide emojiKeyboard at startup
            let emojiKeyboardTempCss = document.createElement('style');
            document.head.appendChild(emojiKeyboardTempCss);
            emojiKeyboardTempCss.sheet.insertRule('#emojikb-maindiv {display:none}');
            emojiKeyboard.wait_for_ready().then(() => {
                emojiKeyboard.toggle_window();
                emojiKeyboardTempCss.remove();
                updateEmojiKeyboardPositionAndSize(document.getElementById('resize-chat-box'));
            });
        }

        function updateEmojiKeyboardPositionAndSize(divChatBox)
        {
            let emojiKeyboardMainDiv = document.getElementById('emojikb-maindiv');
            if(emojiKeyboardMainDiv != null)
            {
                let rect = divChatBox.getBoundingClientRect();
                let left, top, width;
                if(isMobile())
                {
                    width = rect.right - rect.left;
                    left = rect.left;
                    top = rect.top;
                }
                else
                {
                    width = 470;
                    left = rect.right;
                    top = rect.bottom - 489;
                }
                emojiKeyboardMainDiv.setAttribute('style', 'width:'+width+'px;height:478px;z-index:250;right:auto;bottom:auto;left:'+left+'px;top:'+top+'px');
            }
        }

        function insertEmojiKeyboardCssFile()
        {
            //source: emoji_keyboard.css
            //styling colors: #5d2031 #4f222e #ffa23e #391821
            let emojiKeyboardCssFile = document.createElement('style');
            emojiKeyboardCssFile.innerHTML = `
.emojikb-hidden {
    display: none !important;
}

#emojikb-maindiv {
    display: flex;
    flex-direction: column;
    height: 444px;
    position: absolute;
    z-index: 2;
    right: 0;
    bottom: 20px;
    user-select: none;
    font-family: 'Whitney', 'Catamaran', 'Helvetica Neue', sans-serif;
}

#emojikb-maindiv.resizable:after {
    content: " ";
       position: absolute;
       left: 0;
       width: 5px;
       height: 100%;
       cursor: ew-resize;
   }

#emojikb-searchdiv {
    border: 3px solid #ffa23e;
    border-radius: 7px 7px 0 0;
    border-bottom: 1px solid #ffa23e;
    background-color: #5d2031;
    padding: 12px 5px 12px 3%;
    display: flex;
}

#emojikb-searchdiv svg {
    fill: rgb(114, 118, 125);
    width: 24px;
    height: 24px;
    margin: 0 12px;
    align-self: center;
}

#emojikb-searchdiv input {
    flex-grow: 1;
    line-height: 32px;
    height: 30px;
    padding: 0 8px;
    margin: 1px;
    background-color: #391821;
    border: none;
    color: rgb(220, 221, 222);
    border-radius: 4px;
}

#emojikb-searchdiv input:focus {
    outline: none;
}

#emojikb-div2 {
    display: flex;
    height: 90%;
}

#emojikb-div3 {
    border-bottom: 3px solid #ffa23e;
    border-right: 3px solid #ffa23e;
    border-radius: 0 0 7px;
    background-color: #4f222e;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

#emojikb-leftlist {
    border-left: 3px solid #ffa23e;
    border-bottom: 3px solid #ffa23e;
    display: flex;
    flex-direction: column;
    background-color: #5d2031;
    float: left;
    border-radius: 0 0 0 7px;
    padding: 8px;
    /* width: 32px; */
}

#emojikb-leftlist>svg {
    width: 24px;
    height: 24px;
    fill: white;
    /* align-self: center; */
    padding: 4px;
    border-radius: 4px;
    margin-bottom: 2px;
    transition: all .1s ease-in-out;
    cursor: pointer;
}

#emojikb-leftlist>svg:hover {
    background-color: #ffa23e;
    fill: lightgray
}

#emojikb-leftlist>svg.selected {
    background-color: #ffa23e;
    fill: white;
}

#emojikb-show {
    overflow-y: scroll;
    scrollbar-color: #ffa23e transparent;
    scrollbar-width: thin;
    margin: 8px 8px 0 8px;
    position: relative;
    flex-grow: 1;
}

#emojikb-show::-webkit-scrollbar {
  width: 4px;
}

#emojikb-show::-webkit-scrollbar-thumb {
  background: linear-gradient(to top,#ffa23e 0,#ff545c 100%);
  border-radius: 5px;
  height: 40px;
  box-shadow: 0 2px 0 1px rgba(0,0,0,.35), inset 0 3px 0 rgba(255,232,192,.75);
}

#emojikb-show svg {
    width: 16px;
    height: 16px;
    fill: white;
}

.emojikb-categ {
    margin-bottom: 12px;
}

.emojikb-categname {
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    padding: 1px 4px;
    align-items: center;
    display: flex;
    background-color: #5d2031;
    height: 32px;
}

.emojikb-categname span {
    font-size: 12px;
    color: white;
    margin: 0 8px;
    text-transform: uppercase;
    transition: color .3s ease-in-out;
}

.emojikb-categ:hover > .emojikb-categname > span{
    color: white;
}

.emojikb-categ:hover > .emojikb-categname > svg{
    fill: white !important;
}

.emojikb-categ .emojikb-emoji {
    height: 32px;
    width: 32px;
    border-radius: 4px;
    cursor: pointer;
    padding: 4px;
}

.emojikb-categ .emojikb-emoji.selected, .emojikb-categ .emojikb-emoji.lazy, .emojikb-categ .emojikb-emoji.MoveSwapMode_Selected {
    background-color: #ffa23e;
}

#emojikb-info {
    flex-basis: 48px;
    flex-shrink: 0;
    background-color: #5d2031;
    display: flex;
    align-items: center;
    padding: 0 3%;
    border-radius: 0 0 7px;
}

#emojikb-info-icon {
    height: 28px;
    width: 28px;
}

#emojikb-info-name {
    margin-left: 8px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-weight: 600;
    line-height: 20px;
    color: white;
    max-width: 355px;
}`;
            document.head.appendChild(emojiKeyboardCssFile);
        }

        function promptAddCustomEmojiGif(isEmoji)
        {
            let hostsText = '';
            mapCustomEmojiGifHosts.forEach((value, key) => {
                hostsText += value.name + ', ';
            });
            let fileExtText = '';
            mapCustomEmojiGifFileExtensions.forEach((value, key) => {
                fileExtText += value + ', ';
            });

            let url = prompt('Add a custom ' + (isEmoji ? 'Emoji' : 'GIF') + ' by pasting a valid direct URL from your image (' + (isEmoji ? fileExtText.substr(0, fileExtText.length - 2) : '.gif') + '). Valid Hosts: ' + hostsText.substr(0, hostsText.length - 2));
            if(url != null)
            {
                //prepare url
                let urlEnd = url.indexOf('?');
                if(urlEnd != -1) url = url.substr(0, urlEnd); //remove all url parameters
                if(url.length > 30 && url.startsWith('https://media') && url.substr(14, 17) == '.giphy.com/media/') url = 'https://media' + url.substr(14); //change giphy.com subdomains media0, media1, etc. to media

                //check url for validity
                let urlWithGif = url.endsWith('.gif');
                let customEmojiGifCode = convertUrlToCustomEmojiGifCode(url, urlWithGif);
                if(customEmojiGifCode != null && isEmoji != urlWithGif)
                {
                    let ret = (isEmoji ? addCustomEmojiToLocalStorage(customEmojiGifCode) : addCustomGifToLocalStorage(customEmojiGifCode));
                    if(ret)
                    {
                        //add custom emoji/gif to emojiKeyboard
                        emojiKeyboard.addCustomEmojiGifCode(customEmojiGifCode, url, isEmoji);
                    }
                    else
                    {
                        alert('The emoji / gif already exists!');
                    }
                }
                else
                {
                    alert('Invalid URL or file type!');
                }
            }
        }

        function confirmDeleteModeCustomEmojiGif(span)
        {
            if(span.innerText == '[-]')
            {
                if(confirm('Do you want to delete custom emojis / gifs? You can select which ones you want to delete. Click on "DELETE MODE" to exit the mode.'))
                {
                    span.innerText = '[DELETE MODE]';
                    span.setAttribute('style', 'cursor:pointer;color:red');
                    emojiKeyboard.customEmojiGifDeleteMode++;
                }
            }
            else
            {
                span.innerText = '[-]';
                span.setAttribute('style', 'cursor:pointer');
                emojiKeyboard.customEmojiGifDeleteMode--;
            }
        }

        function confirmSortModeCustomEmojiGif(span)
        {
            if(span.innerText == '[⇔]' && emojiKeyboard.customEmojiGifSortMode == 0)
            {
                alert('"MOVE MODE" has been activated.\n\nYou can now move emojis / gifs. Click on a emoji / gif and then on another emoji / gif to move it in front of it.\n\nClick on "MOVE MODE" to switch to "SWAP MODE".');
                span.innerText = '[MOVE MODE]';
                emojiKeyboard.customEmojiGifSortMode = 1;
            }
            else if(span.innerText == '[MOVE MODE]' && emojiKeyboard.customEmojiGifSortMode == 1)
            {
                alert('"SWAP MODE" has been activated.\n\nYou can now swap two emojis / gifs. Click on two gifs to swap their positions.\n\nClick on "SWAP MODE" to exit the mode completely.');
                span.innerText = '[SWAP MODE]';
                emojiKeyboard.customEmojiGifSortMode = 2;
                if(emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif != null)
                {
                    emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif + '"]').classList.remove('MoveSwapMode_Selected');
                    emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = null;
                }
            }
            else if(span.innerText == '[SWAP MODE]' && emojiKeyboard.customEmojiGifSortMode == 2)
            {
                span.innerText = '[⇔]';
                emojiKeyboard.customEmojiGifSortMode = 0;
                if(emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif != null)
                {
                    emojiKeyboard.get_keyboard(document).querySelector('img.emojikb-emoji[data-emoji="' + emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif + '"]').classList.remove('MoveSwapMode_Selected');
                    emojiKeyboard.customEmojiGifSortMode_FirstEmojiGif = null;
                }
            }
        }

        function addCustomEmojiToLocalStorage(newCustomEmoji)
        {
            let customEmojis = loadCustomEmojisFromLocalStorage();
            if(!customEmojis.includes(newCustomEmoji))
            {
                customEmojis.push(newCustomEmoji);
                saveCustomEmojisToLocalStorage(customEmojis);
                return true;
            }
            return false;
        }

        function removeCustomEmojiFromLocalStorage(customEmoji)
        {
            let customEmojis = loadCustomEmojisFromLocalStorage();
            let index = customEmojis.indexOf(customEmoji);
            if (index > -1)
            {
                customEmojis.splice(index, 1);
                saveCustomEmojisToLocalStorage(customEmojis);
                return true;
            }
            return false;
        }

        function swapCustomEmojiInLocalStore(emoji1, emoji2)
        {
            let customEmojis = loadCustomEmojisFromLocalStorage();
            let index1 = customEmojis.indexOf(emoji1);
            if (index1 > -1)
            {
                let index2 = customEmojis.indexOf(emoji2);
                if (index2 > -1)
                {
                    customEmojis[index1] = emoji2;
                    customEmojis[index2] = emoji1;
                    saveCustomEmojisToLocalStorage(customEmojis);
                    return true;
                }
            }
            return false;
        }

        function moveCustomEmojiInLocalStore(emoji1, emoji2)
        {
            let customEmojis = loadCustomEmojisFromLocalStorage();
            let index1 = customEmojis.indexOf(emoji1);
            if (index1 > -1)
            {
                let index2 = customEmojis.indexOf(emoji2);
                if (index2 > -1)
                {
                    customEmojis.splice(index1, 1);
                    index2 = customEmojis.indexOf(emoji2);
                    customEmojis.splice(index2, 0, emoji1);
                    saveCustomEmojisToLocalStorage(customEmojis);
                    return true;
                }
            }
            return false;
        }

        function loadCustomEmojisFromLocalStorage()
        {
            let json = localStorage.getItem(KEY_CUSTOM_EMOJIS);
            if(json == null) json = '[]';
            return JSON.parse(json);
        }

        function saveCustomEmojisToLocalStorage(customEmojis)
        {
            localStorage.setItem(KEY_CUSTOM_EMOJIS, JSON.stringify(customEmojis));
        }

        function addCustomGifToLocalStorage(newCustomGif)
        {
            let customGifs = loadCustomGifsFromLocalStorage();
            if(!customGifs.includes(newCustomGif))
            {
                customGifs.push(newCustomGif);
                saveCustomGifsToLocalStorage(customGifs);
                return true;
            }
            return false;
        }

        function removeCustomGifFromLocalStorage(customGif)
        {
            let customGifs = loadCustomGifsFromLocalStorage();
            let index = customGifs.indexOf(customGif);
            if (index > -1)
            {
                customGifs.splice(index, 1);
                saveCustomGifsToLocalStorage(customGifs);
                return true;
            }
            return false;
        }

        function swapCustomGifInLocalStore(gif1, gif2)
        {
            let customGifs = loadCustomGifsFromLocalStorage();
            let index1 = customGifs.indexOf(gif1);
            if (index1 > -1)
            {
                let index2 = customGifs.indexOf(gif2);
                if (index2 > -1)
                {
                    customGifs[index1] = gif2;
                    customGifs[index2] = gif1;
                    saveCustomGifsToLocalStorage(customGifs);
                    return true;
                }
            }
            return false;
        }

        function moveCustomGifInLocalStore(gif1, gif2)
        {
            let customGifs = loadCustomGifsFromLocalStorage();
            let index1 = customGifs.indexOf(gif1);
            if (index1 > -1)
            {
                let index2 = customGifs.indexOf(gif2);
                if (index2 > -1)
                {
                    customGifs.splice(index1, 1);
                    index2 = customGifs.indexOf(gif2);
                    customGifs.splice(index2, 0, gif1);
                    saveCustomGifsToLocalStorage(customGifs);
                    return true;
                }
            }
            return false;
        }

        function loadCustomGifsFromLocalStorage()
        {
            let json = localStorage.getItem(KEY_CUSTOM_GIFS);
            if(json == null) json = '[]';
            return JSON.parse(json);
        }

        function saveCustomGifsToLocalStorage(customGifs)
        {
            localStorage.setItem(KEY_CUSTOM_GIFS, JSON.stringify(customGifs));
        }

        function convertUrlToCustomEmojiGifCode(url, urlWithGif)
        {
            let hostCode = null;
            let fileExtCode = null;
            let urlCodeStart, urlCodeEnd;
            for(let [key, value] of mapCustomEmojiGifHosts) {
                if(url.startsWith(value.url))
                {
                    hostCode = key;
                    urlCodeStart = value.url.length;
                    break;
                }
            }
            if(!urlWithGif)
            {
                for(let [key, value] of mapCustomEmojiGifFileExtensions) {
                    if(url.endsWith(value))
                    {
                        fileExtCode = key + ':';
                        urlCodeEnd = value.length;
                        break;
                    }
                }
            }
            else
            {
                fileExtCode = '';
                urlCodeEnd = 4;
            }
            return (hostCode != null && fileExtCode != null ? (urlWithGif ? '!' : ':') + hostCode + url.substr(urlCodeStart, url.length - urlCodeStart - urlCodeEnd) + fileExtCode : null);
        }

        function isCustomEmojiCode(code)
        {
            return (code.startsWith(':') && code.endsWith(':') && code.length > 4 && mapCustomEmojiGifHosts.has(code.substr(1, 1)) && mapCustomEmojiGifFileExtensions.has(code.substr(code.length - 2, 1)));
        }

        function isCustomGifCode(code)
        {
            return (code.startsWith('!') && code.length > 2 && mapCustomEmojiGifHosts.has(code.substr(1, 1)));
        }

        function convertCustomEmojiCodeToUrl(code)
        {
            return mapCustomEmojiGifHosts.get(code.substr(1, 1)).url + code.substr(2, code.length - 4) + mapCustomEmojiGifFileExtensions.get(code.substr(code.length - 2, 1));
        }

        function convertCustomGifCodeToUrl(code)
        {
            return mapCustomEmojiGifHosts.get(code.substr(1, 1)).url + code.substr(2) + '.gif';
        }

        function getMapCustomEmojiGifHosts()
        {
            return new Map([
                ['ÿ', { name: 'snipboard.io', url: 'https://snipboard.io/' }],
                ['þ', { name: 'imgur.com', url: 'https://i.imgur.com/' }],
                ['ý', { name: 'tenor.com', url: 'https://media.tenor.com/' }],
                ['ü', { name: 'giphy.com', url: 'https://media.giphy.com/media/' }],
            ]);
        }

        function getMapCustomEmojiGifFileExtensions()
        {
            return new Map([
                ['ÿ', '.png'],
                ['þ', '.jpg']
            ]);
        }

        function getMapGIFs()
        {
            return new Map([
                ['!:p', ['OHfZzUQuB88AAAAC/rin-shrug.gif', 'FVr4Zhmsnm4AAAAd/kotomine-kirei.gif']],
                ['!?', ['https://i.imgur.com/aovpJWc.gif', '47_TR9UGqh4AAAAM/fate-rin-tohsaka.gif']],
                ['!25', ['ww8XZ4PLWgEAAAAC/25-years.gif', '1eUwz8-OAwgAAAAC/25-pusheen.gif']],
                ['!both', ['odyVsZbC-OYAAAAC/why-not-both-why-not.gif', 'ZjqPAZpKWAUAAAAC/the-road-to-el-dorado-both.gif']],
                ['!clap', ['BHEkb1EYsaMAAAAC/aplausos-clapped.gif', '3DslEXJ6bn8AAAAC/clap-slow-clap.gif', '50IjyLmv8mQAAAAC/will-smith-clap.gif', 'jrIAsC6362EAAAAC/clap-clapping.gif', '-DXhLQTX9hwAAAAd/im-proud-of-you-dan-levy.gif']],
                ['!dejavu', ['CqoEATCG-1wAAAAC/déjàvu-drift.gif']],
                ['!doit', ['NZXtIRvja5cAAAAC/doit-shialabeouf.gif']],
                ['!doubt', ['ld5tk9ujuJsAAAAC/doubt-press-x.gif', '_0AGcJvL5QYAAAAC/jim-halpert-face.gif', 'xZt1qV8KMbkAAAAC/ehh-probably-not.gif']],
                ['!fail', ['sAdlyyKDxogAAAAC/bart-simpson-the-simpsons.gif', 'FOzbM2mVKG0AAAAC/error-windows-xp.gif']],
                ['!gm', ['YnY4gUjy8JQAAAAC/fate-stay-night-rin-tohsaka.gif']],
                ['!gn', ['n6xhcPW4zDcAAAAC/saber-goodnight.gif', 'AeCpJ0xNKKcAAAAC/anime-foodwars.gif', 'E9cdA-c9vcwAAAAC/kumo-desu-ga-nani-ka-kumoko.gif']],
                ['!gz', ['xDHCe07zrocAAAAC/congrats-minions.gif', '2Di8n4U2wJUAAAAC/yay-congrats.gif']],
                ['!gratz', '!gz'],
                ['!congratz', '!gz'],
                ['!congrats', '!gz'],
                ['!headpat', ['xE9m5-LkBeEAAAAi/anime-kanna.gif']],
                ['!hehe', ['s6axyeNl4HMAAAAC/fate-ubw.gif']],
                ['!heyhey', ['iOG-xvGrcVQAAAAC/hayasaka-kaguya.gif']],
                ['!legit', ['JwI2BNOevBoAAAAC/sherlock-martin-freeman.gif']],
                ['!liar', ['oZrRoDQDXZ4AAAAC/anakin-liar.gif', 'ZZi-EEsk_X8AAAAC/liar-mad.gif']],
                ['!moar', ['dStuVKgo6kwAAAAC/crumch-game-grumps.gif', 'Ft71uoGyHLEAAAAC/cat-moar.gif', 'XnYJ-WoYGyMAAAAC/ln_strike-kylo-ren.gif']],
                ['!monster', ['e1T7jSFlZ-EAAAAC/shrek-gingerbread.gif', 'A_JS3lx__egAAAAC/star-trek-tos.gif', 'fx-nkmNVA_MAAAAC/penguins-of-madagascar-kowalski.gif']],
                ['!new', ['C52JpqHPWcYAAAAC/friends-phoebe.gif']],
                ['!ohmy', ['svFFJHFmLccAAAAC/oh-my-george-takei.gif']],
                ['!proud', ['-DXhLQTX9hwAAAAC/im-proud-of-you-dan-levy.gif', 'X9jgpiApABcAAAAC/yes-nod.gif', 'iU_-BMVz9BIAAAAC/im-proud-of-you-dwayne-johnson.gif', '46dxApXEHh0AAAAd/smug-daniel-craig.gif']],
                ['!rng', ['https://imgs.xkcd.com/comics/random_number.png', 'c6drTKdM9ZEAAAAS/rng-excalibur.gif', 'mACda5RzcAcAAAAd/destiny.gif']],
                ['!rule', ['nPWzt3Rfql0AAAAC/fight-club-rules.gif', 'ijKrOkX2MEcAAAAC/fight-club-first-rule-of-fight-club.gif']],
                ['!sad', ['Up7hRFmFY9AAAAAC/anime-sad-anime-pout.gif', 'B9w6cHA-RrYAAAAd/marin-cry-marin-sad.gif']],
                ['!sleepy', ['ajpTPte6fI8AAAAd/rin-tohsaka-pyjamas.gif']],
                ['!thx', ['35hmBwYHYikAAAAC/the-office-bow.gif', 'xCQSK3wG0OQAAAAC/my-hero.gif', 'https://i.imgur.com/1cjdsob.gif']],
                ['!ty', '!thx'],
                ['!thanks', '!thx'],
                ['!whale', ['https://cdn.discordapp.com/attachments/344734413600587776/463933711193473044/Whale.png', 'Gb_N7yXyB-UAAAAC/marin-kitagawa-marin.gif', 'f_G-jdId4fkAAAAd/whale-gold.gif', 'id2Lsryg60cAAAAC/unusual-whales-unusual-whales-rain-money.gif']],
                ['!what', ['eAqD-5MDzFAAAAAC/mai-sakurajima-sakurajima-mai.gif', 'Q0yIxNX0L-kAAAAC/wait-what-what.gif']],
                ['!why', ['o2CYGlMLADUAAAAC/barack-obama-why.gif', 'OPbFPRevcv4AAAAC/ajholmes-why.gif', '1Vh0XBrPM7MAAAAC/why-whats-the-reason.gif', 'y0Up9A_bTPwAAAAd/nph-why.gif', 'KjJTBQ9lftsAAAAC/why-huh.gif']],
                ['!wtf', ['https://i.ytimg.com/vi/XjVKHZ_F4zo/maxresdefault.jpg']],
            ]);
        }

        function getMapGameIcons()
        {
            return new Map([
                [':ep:', 'res:pachinko_ep1.png'],
                [':ep10:', 'res:pachinko_ep10.png'],
                [':epd:', 'res:pachinko_epd.png'],
                [':myp:', 'res:pachinko_myp1.png'],
                [':myp3:', 'res:pachinko_myp3.png'],
                [':myp6:', 'res:pachinko_myp6.png'],
                [':qp:', 'res:pachinko_qp1.png'],
                [':qp2:', 'res:pachinko_qp2.png'],
                [':qp10:', 'res:pachinko_qp10.png'],
                [':gp:', 'res:pachinko_gp1.png'],
                [':gp10:', 'res:pachinko_gp10.png'],
                [':evp:', 'res:pachinko_evp.png'],
                // end of row

                [':w1:', 'res:league_1.png'],
                [':w2:', 'res:league_2.png'],
                [':w3:', 'res:league_3.png'],
                [':s1:', 'res:league_4.png'],
                [':s2:', 'res:league_5.png'],
                [':s3:', 'res:league_6.png'],
                [':d1:', 'res:league_7.png'],
                [':d2:', 'res:league_8.png'],
                [':d3:', 'res:league_9.png'],

                [':hc:', '320538924156059649'],
                [':hardcore:', ':hc:'],
                [':shagger:', ':hc:'],
                [':ch:', '320538924801851392'],
                [':charm:', ':ch:'],
                [':lover:', ':ch:'],
                [':kh:', '320538923753275394'],
                [':knowhow:', ':kh:'],
                [':expert:', ':kh:'],
                // end of row

                [':rainbow:', '901254800690278491'],
                [':balanced:', ':rainbow:'],
                [':black:', '901255133004976149'],
                [':dominatrix:', ':black:'],
                [':red:', '901254872429637682'],
                [':eccentric:', ':red:'],
                [':green:', '901254909276602418'],
                [':exhibitionist:', ':green:'],
                [':orange:', '901254970542788628'],
                [':physical:', ':orange:'],
                [':yellow:', '901255043871830016'],
                [':playful:', ':yellow:'],
                [':blue:', '901255091665895424'],
                [':sensual:', ':blue:'],
                [':white:', '901255190433370192'],
                [':submissive:', ':white:'],
                [':purple:', '901255233773137991'],
                [':voyeur:', ':purple:'],

                [':attack:', 'res:stats_attack.png'],
                [':defense:', 'res:stats_defense.png'],
                [':ego:', 'res:stats_ego.png'],
                // end of row

                [':allgem:', '918072869043458048'],
                [':allgems:', ':allgem:'],
                [':blackgem:', '910701075361845288'],
                [':blackgems:', ':blackgem:'],
                [':redgem:', '910701075420557412'],
                [':redgems:', ':redgem:'],
                [':greengem:', '910701075550576720'],
                [':greengems:', ':greengem:'],
                [':orangegem:', '910701075181469737'],
                [':orangegems:', ':orangegem:'],
                [':yellowgem:', '910701075852591144'],
                [':yellowgems:', ':yellowgem:'],
                [':bluegem:', '910701075345068034'],
                [':bluegems:', ':bluegem:'],
                [':whitegem:', '910701075672232016'],
                [':whitegems:', ':whitegem:'],
                [':purplegem:', '910701077568040990'],
                [':purplegems:', ':purplegem:'],

                [':harmony:', 'res:stats_harmony.png'],
                [':endurance:', 'res:stats_endurance.png'],
                [':mojo:', 'res:mojo.png'],
                // end of row

                [':cscroll:', 'res:scroll_common.png'],
                [':cbulb:', ':cscroll:'],
                [':rscroll:', 'res:scroll_rare.png'],
                [':rbulb:', ':rscroll:'],
                [':escroll:', 'res:scroll_epic.png'],
                [':ebulb:', ':escroll:'],
                [':lscroll:', 'res:scroll_legendary.png'],
                [':lbulb:', ':lscroll:'],
                [':mscroll:', 'res:scroll_mythic.png'],
                [':mbulb:', ':mscroll:'],

                [':potion_endurance:', '948310353735987240'],
                [':bbpotion:', ':potion_love:'],
                [':potion_love:', '948310353828282408'],
                [':pogpotion:', ':potion_love:'],
                [':potion_lust:', '948310353979252786'],
                [':povpotion:', ':potion_lust:'],
                [':penetrationpotion:', '1073585652756643850'],
                [':dppotion:', ':penetrationpotion:'],
                [':crystal:', '999279877834428416'],
                [':crystal_token:', ':crystal:'],
                [':shard:', '540690525238591518'],
                [':shards:', ':shard:'],
                [':datingtoken:', '849076003882926100'],
                [':dating:', ':datingtoken:'],
                // end of row

                [':nutaku_gold:', '923585084081197117'],
                [':nugold:', ':nutaku_gold:'],
                [':cash:', '856969607537623050'],
                [':koban:', '294927828682801153'],
                [':kobans:', ':koban:'],
                [':gold:', '856150808739315712'],
                [':ymen:', '294927828972208128'],
                [':money:', ':ymen:'],

                [':energy:', '864645021561782332'],
                [':combativity:', '848991758301265990'],
                [':fisting:', ':combativity:'],
                [':kiss:', '860659467876302889'],
                [':league:', '860659427950460930'],
                [':condom:', ':league:'],
                [':condoms:', ':league:'],
                [':worship:', '902508422988169226'],
                [':ticket:', '596905784160419876'],
                [':kk:', '915301903561265194'],
                [':kinkoid:', ':kk:'],
                // end of row

                [':sultrycoin:', '1037358279275335720'],
                [':sultrycoins:', ':sultrycoin:'],
                [':key:', '1037336214459650148'],
                [':keys:', ':key:'],

                [':flowers:', '860867149009780757'],
                [':magazine:', '923655467140542544'],
                [':spellbook:', '923655294381359104'],
                [':book:', 'res:book.png'],

                [':perfume:', '917383948408086529'],
                [':sandalwood:', ':perfume:'],
                [':atm:', '917383948554862632'],
                [':memories:', ':atm:'],
                [':ginseng:', '917383948387115018'],
                [':cordy:', '917383948512919552'],
                [':cordys:', ':cordy:'],
                [':cordyceps:', ':cordy:'],
                [':am:', '917383948496154675'],
                [':ame:', ':am:'],
                [':allmastery:', ':am:'],
                [':lm:', 'res:booster_lm.png'],
                [':lme:', ':lm:'],
                [':leaguemastery:', ':lm:'],
                // end of row
            ]);
        }

        function getMapEmojis()
        {
            return new Map([
                [':kek:', '588599124312457217'],
                [':pikaponder:', '862672993720336394'],
                [':surprised:', '589875097058279437'],
                [':surprisedpika:', ':surprised:'],
                [':rip:', '657438005602025486'],
                [':hi:', '953431707556667433'],
                [':kanna_hi:', ':hi:'],
                [':kannahi:', ':hi:'],
                [':corgistare:', '650194352181739535'],
                [':huh:', '1032670699472572496'],
                [':uwot:', '650195017692086328'],
                [':wot:', ':uwot:'],
                [':kanna_nom:', '774778816870088724'],
                [':kannanom:', ':kanna_nom:'],
                [':kanna_headpat:', '667192299272273951'],
                [':kannaheadpat:', ':kanna_headpat:'],
                [':tuturu:', '562217717222866944'],
                [':louise_please:', '950890624943546368'],
                [':thinky:', '878610897709436928'],
                [':thonk:', '860651714293006387'],
                [':smug:', '1002518587833057320'],
                [':smug_asuna:', 'res:asuna_smug.png'],
                [':2bsip:', 'res:2b_sip.png'],
                [':happy_rin:', '953395143510224957'],
                [':happy_asuna:', 'res:asuna_happy.png'],
                [':2bgasm:', '650834937272074270'],
                [':thx:', '294932319020515348'],
                [':ty:', ':thx:'],
                [':thanks:', ':thx:'],
                [':bunny:', '527094255584542720'],
                [':bunny_sad:', '855351276803457044'],
                [':bunnys:', ':bunny_sad:'],
                [':bunny_joy:', '861385389004947526'],
                [':bunnyj:', ':bunny_joy:'],
                [':bunny_realization:', '865514400759808020'],
                [':bunnyr:', ':bunny_realization:'],
                [':tada:', 'res:tada.png'],
                [':sadtada:', '733120928137085019'],
                [':notlikethis:', '866732254357356624'],
            ]);
        }

        function isSponsorOrMM(id)
        {
            //-MM-
            if((window.location.hostname === 'www.hentaiheroes.com' && id == 4266159) ||
               (window.location.hostname === 'test.hentaiheroes.com' && id == 119511)) return true;

            //Sponsors
            return getSponsors().has(GAME_INFO.hostname + '/hero/' + id);
        }

        function getGameInfo()
        {
            let hostname = window.location.hostname;
            let tag = null;
            let contentUrl = null;
            let wikiUrl = null;
            if(hostname === 'osapi.nutaku.com')
            {
                if(window.location.search.includes('tid=harem-heroes')) {
                    hostname = 'nutaku.haremheroes.com';
                } else if(window.location.search.includes('tid=comix-harem')) {
                    hostname = 'nutaku.comixharem.com';
                } else if(window.location.search.includes('tid=pornstar-harem')) {
                    hostname = 'nutaku.pornstarharem.com';
                } else if(window.location.search.includes('tid=gay-harem')) {
                    hostname = 'nutaku.gayharem.com';
                }
            }
            if(hostname.includes('hentaiheroes') || hostname.includes('haremheroes')) {
                tag = 'HH';
                contentUrl = "https://hh.hh-content.com/pictures/girls/";
                wikiUrl = "https://harem-battle.club/wiki/Harem-Heroes/HH:";
            } else if(hostname.includes('comixharem')) {
                tag = 'CxH';
                contentUrl = "https://ch.hh-content.com/pictures/girls/";
                // no wiki
            } else if(hostname.includes('pornstarharem')) {
                tag = 'PsH';
                contentUrl = "https://th.hh-content.com/pictures/girls/";
                // no wiki
            } else if(hostname.includes('gayharem')) {
                tag = 'GH';
                contentUrl = "https://gh.hh-content.com/pictures/girls/";
                wikiUrl = "https://harem-battle.club/wiki/Gay-Harem/GH:";
            }
            return { tag, hostname, contentUrl, wikiUrl };
        }

        function getSponsors()
        {
            return new Map([
                ['www.hentaiheroes.com/hero/3399159', { name: 'Uxio', tier: 'silver', active: true, order: 1 }],

                ['www.hentaiheroes.com/hero/124704' , { name: 'Darkyz', tier: 'coffee', active: true, order: 2 }],
                ['www.comixharem.com/hero/29164' , { name: 'Darkyz', tier: 'coffee', active: true, order: 2 }],
                ['www.pornstarharem.com/hero/1851' , { name: 'Darkyz', tier: 'coffee', active: true, order: 2 }],
                ['test.hentaiheroes.com/hero/158794' , { name: 'Darkyz', tier: 'coffee', active: true, order: 2 }],
                ['nutaku.haremheroes.com/hero/4443024' , { name: 'xnh0x', tier: 'coffee', active: true, order: 3 }],
                ['www.hentaiheroes.com/hero/3512557' , { name: 'Bobick', tier: 'coffee', active: true, order: 4 }],
                ['www.hentaiheroes.com/hero/844437' , { name: 'holymolly', tier: 'coffee', active: true, order: 5 }],
                ['nutaku.haremheroes.com/hero/2261654' , { name: 'holymolly', tier: 'coffee', active: true, order: 5 }],
                ['www.hentaiheroes.com/hero/842927' , { name: 'Zteev', tier: 'coffee', active: true, order: 6 }],

                ['www.hentaiheroes.com/hero/5248781', { name: 'Safi', tier: 'gold', active: false, order: 7 }],
                ['www.hentaiheroes.com/hero/1964825', { name: 'Master Maximus', tier: 'silver', active: false, order: 8 }],
                ['www.hentaiheroes.com/hero/3563807', { name: 'Lep', tier: 'coffee', active: false, order: 9 }],
            ]);
        }

        // ===================================================================================================
        // emoji_keyboard.js =================================================================================
        // ===================================================================================================
        // https://github.com/ZRunner/JS-Emoji-Keyboard
        // ===================================================================================================
        const categories = new Map([
            ['People', ['People & Body', 'Smileys & Emotion', 'Component']],
            ['Nature', ['Animals & Nature']],
            ['Food', ['Food & Drink']],
            ['Activities', ['Activities']],
            ['Travel', ['Travel & Places']],
            ['Objects', ['Objects']],
            ['Symbols', ['Symbols']],
            ['Flags', ['Flags']],
            ['GIFs', []],
            ['Emojis', []],
            ['HH', []],
        ]);

        /*window.onload = function () {
    if (!window.jQuery) throw "jQuery not loaded - some features may broke";
    if (!Fuse) throw "Fuse lib not loaded - some features may broke";
}*/

        class EmojiKeyboard {
            constructor() {
                this.emojis = new Map(Array.from(categories, v => [v[0], []])); // we take categories names with empty lists
                this.categories = Array.from(categories.keys());
                this.init_base_emojis();
                this.callback = (emoji, gotClosed) => { };
                this.auto_reconstruction = true;
                this.default_placeholder = "Find the right emoji for your needs 👌";
                this.resizable = true;
                this.fuseIndex = null;
                this.fuse = null;
                if ("IntersectionObserver" in window) {
                    // https://dev.to/ekafyi/lazy-loading-images-with-vanilla-javascript-2fbj
                    this.lazyImageObserver = new IntersectionObserver((entries, observer) => {
                        // Loop through IntersectionObserverEntry objects
                        entries.forEach(entry => {
                            // Do these if the target intersects with the root
                            if (entry.isIntersecting) {
                                let lazyImage = entry.target;
                                lazyImage.src = lazyImage.dataset.src;
                                lazyImage.classList.remove("lazy");
                                observer.unobserve(lazyImage);
                            }
                        });
                    });
                    // https://stackoverflow.com/a/57991537/11213823
                    this.stickyObserver = new IntersectionObserver(entries => {
                        entries.forEach(entry => {
                            if (!entry.target.offsetParent) return;
                            const scrollPos = entry.target.offsetParent.scrollTop - entry.target.offsetTop;
                            if (scrollPos >= 1) {
                                const categ = entry.target.dataset.emojikb_categ;
                                const list = document.getElementById("emojikb-leftlist");
                                const targets = list.querySelectorAll('svg[data-emojikb_categ="' + categ + '"]');
                                if (!targets[0]) return;
                                this.click_on_category(this, targets[0], true);
                            }
                        })
                    }, { threshold: [0, 1] })
                }
            }

            instantiate(elem) {
                this.wait_for_ready().then(() => {
                    // elem should be a button
                    let document = elem.ownerDocument;
                    this.get_keyboard(document); // create keyboard if needed
                    elem.addEventListener("click", () => this.toggle_window());
                })
            }

            toggle_window() {
                let kb = document.getElementById("emojikb-maindiv");
                if (!kb) {
                    if (this.auto_reconstruction)
                        kb = this.get_keyboard(document);
                    else
                        return;
                }
                kb.classList.toggle('emojikb-hidden');
            }

            add_emojis(emojis) {
                for (const e of emojis) {
                    if (!(e.url && e.name)) continue;
                    this.custom_emojis.push({
                        url: e.url,
                        name: e.name
                    });
                }
            }

            async wait_for_ready() {
                let tests = 0; // max 15s waiting
                const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
                while (tests < 30 && this.emojis.get("People").length === 0) {
                    await sleep(500);
                    tests++;
                }
                if (tests == 30) {
                    console.error("Unable to instantiate emojis")
                }
            }


            // ----- PRIVATE PART ----- you should not need to call that ----- //

            get_keyboard(document) {
                let kb = document.getElementById("emojikb-maindiv");
                if (!kb)
                    kb = this.create_keyboard(document);
                return kb
            }

            click_on_emoji(kb, event) {
                let closed = (!event.shiftKey && emojiKeyboard.customEmojiGifDeleteMode == 0 && emojiKeyboard.customEmojiGifSortMode == 0 && config.EmojiKeyboard == 'AutoClose');
                if(closed) kb.toggle_window();
                const data = Object.assign({}, event.target.dataset)
                kb.callback(data, closed);
            }

            hover_on_emoji(kb, event) {
                const document = event.target.ownerDocument;
                const name = event.target.dataset.name;
                const url = event.target.src;
                document.getElementById("emojikb-info-name").innerText = name;
                document.getElementById("emojikb-info-icon").src = url;
                document.getElementById("emojikb-textinput").placeholder = name;
                event.target.classList.add("selected");
            }

            hover_out_emoji(kb, event) {
                const document = event.target.ownerDocument;
                document.getElementById("emojikb-textinput").placeholder = kb.default_placeholder;
                event.target.classList.remove("selected");
            }

            click_on_category(kb, event, stay) {
                let target;
                if (event.target) {
                    target = (event.target.nodeName == "path" || event.target.nodeName == "ellipse" )? event.target.parentNode : event.target;
                } else target = event;
                $('#emojikb-leftlist>svg.selected').removeClass('selected');
                target.classList.add("selected");
                if (!stay) { // scroll to the corresponding category
                    const categ = target.dataset.emojikb_categ;
                    const targets = target.ownerDocument.querySelectorAll('div.emojikb-categname[data-emojikb_categ="' + categ + '"]');
                    if (!targets[0]) return;
                    targets[0].parentNode.parentNode.scrollTop = targets[0].parentNode.offsetTop + 1;
                }
            }

            on_typing(event) {
                if (event.target.value === "") {
                    event.target.ownerDocument.querySelectorAll('img.emojikb-emoji').forEach(e => {
                        e.classList.toggle('emojikb-hidden', false);
                    })
                    event.target.ownerDocument.querySelectorAll('div.emojikb-categ').forEach(e => {
                        e.classList.toggle('emojikb-hidden', false);
                    })
                    return;
                }
                if (!this.fuse) this.init_fuse();
                const result = Array.from(this.fuse.search(event.target.value), e => e.item.name);
                let hiddens = new Map(Array.from(this.categories, v => [v, 0]));
                event.target.ownerDocument.querySelectorAll('img.emojikb-emoji').forEach(e => {
                    e.classList.toggle('emojikb-hidden', !result.includes(e.dataset.name));
                    if (!result.includes(e.dataset.name)) {
                        hiddens.set(e.dataset.category, hiddens.get(e.dataset.category) + 1);
                    }
                })
                event.target.ownerDocument.querySelectorAll('div.emojikb-categ').forEach(e => {
                    const hidden_nbr = hiddens.get(e.firstChild.dataset['emojikb_categ']);
                    e.classList.toggle('emojikb-hidden', e.childElementCount <= hidden_nbr + 1);
                })
            }

            init_fuse() {
                // https://fusejs.io/
                let flattened = [];
                for (const list of this.emojis.values()) {
                    flattened = flattened.concat(list);
                }
                this.fuseIndex = Fuse.createIndex(['name', 'unicode'], flattened);
                this.fuse = new Fuse(flattened, {
                    keys: [{
                        name: 'name',
                        weight: 0.7
                    }, {
                        name: 'unicode',
                        weight: 0.3
                    }],
                    minMatchCharLength: 2,
                    threshold: 0.35,
                    distance: 15
                }, this.fuseIndex);
            }

            init_base_emojis() {
                // https://gist.github.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb
                fetch("https://gist.githubusercontent.com/oliveratgithub/0bf11a9aff0d6da7b46f1490f86a71eb/raw/d8e4b78cfe66862cf3809443c1dba017f37b61db/emojis.json").then(async response => {
                    var contentType = response.headers.get("content-type");
                    if (contentType && (contentType.includes("application/json") || contentType.includes("text/plain"))) {
                        const json = await response.json();
                        json.emojis.forEach(emoji => {
                            if (emoji.shortname.includes('_skin_tone') || emoji.unicode.includes(':'))
                                // invalid emojis
                                return;
                            const categ = this.find_right_category(emoji.category);
                            if (!categ)
                                return;
                            this.emojis.get(categ).push({
                                emoji: emoji.emoji,
                                url: "https://cdnjs.cloudflare.com/ajax/libs/twemoji/13.0.1/72x72/" + emoji.unicode.replace(/ /g, '-').toLowerCase() + ".png",
                                name: emoji.shortname,
                                unicode: emoji.unicode
                            });
                        });
                    } else {
                        console.error("Oops, can't get the usual emojis list! (invalid format)");
                    }
                })
            }

            find_right_category(subcategory) {
                if (!subcategory) return;
                try {
                    let sub_name = subcategory.match(/[^(]+/)[0].trim();
                    for (const [k, v] of categories) {
                        if (v.includes(sub_name))
                            return k;
                    }
                }
                catch (err) {
                    console.error(err);
                }
                console.warn("Missing emoji category:", subcategory)
            }

            create_keyboard(document) {
                const dom_parser = new DOMParser();
                const parse_svg = (x) => dom_parser.parseFromString(x, "text/xml").firstChild;
                let main_div = document.createElement("div");
                main_div.id = "emojikb-maindiv";
                main_div.style.width = '500px';
                if (this.resizable) {
                    main_div.classList.add('resizable');
                    main_div.dataset.m_pos = 0;
                    const f = (e) => { this.resize(e, main_div) };
                    main_div.addEventListener("mousedown", (e) => {
                        if (e.offsetX < 4) {
                            main_div.dataset.m_pos = e.x;
                            document.addEventListener("mousemove", f, false);
                        }
                    }, false);
                    document.addEventListener("mouseup", () => {
                        document.removeEventListener("mousemove", f, false);
                    }, false);
                }
                // search div
                let search_div = document.createElement("div");
                search_div.id = "emojikb-searchdiv";
                // let s_div = document.createElement("div");
                let s_area = document.createElement("input");
                s_area.id = "emojikb-textinput";
                s_area.placeholder = this.default_placeholder;
                s_area.addEventListener('input', (e) => this.on_typing(e))
                search_div.appendChild(s_area);
                search_div.appendChild(parse_svg(SVG_HTML.search));
                // under the search div
                let div2 = document.createElement("div");
                div2.id = "emojikb-div2";
                // categories list
                let list_div = document.createElement("div");
                list_div.id = "emojikb-leftlist";
                let div3 = document.createElement("div");
                div3.id = "emojikb-div3";
                // emojis list
                let emojis_div = document.createElement("div");
                emojis_div.id = "emojikb-show";
                // filling lists
                let first_emoji;
                for (const v of [
                    [SVG_HTML.discord, 'Emojis'],
                    [SVG_HTML.gif, 'GIFs'],
                    [SVG_HTML.hh, 'HH'],
                    [SVG_HTML.head, 'People'],
                    [SVG_HTML.leaf, 'Nature'],
                    [SVG_HTML.food, 'Food'],
                    [SVG_HTML.game, 'Activities'],
                    [SVG_HTML.submarine, 'Travel'],
                    [SVG_HTML.tea, 'Objects'],
                    [SVG_HTML.heart, 'Symbols'],
                    [SVG_HTML.flag, 'Flags']
                ]) {
                    if (this.emojis.get(v[1])?.length === 0) { continue };
                    let elem = parse_svg(v[0]);
                    elem.dataset['emojikb_categ'] = v[1];
                    elem.addEventListener('click', e => this.click_on_category(this, e));
                    list_div.appendChild(elem);
                    // emojis grid
                    let categ_div = document.createElement("div");
                    categ_div.className = "emojikb-categ";
                    let categ_name = document.createElement("div");
                    categ_name.className = "emojikb-categname";
                    categ_name.dataset['emojikb_categ'] = v[1];
                    if (this.stickyObserver) {
                        this.stickyObserver.observe(categ_name);
                    }
                    let categ_span = document.createElement("span");
                    categ_span.innerText = v[1];
                    categ_name.appendChild(parse_svg(v[0]));
                    categ_name.appendChild(categ_span);
                    if(v[0] == SVG_HTML.discord || v[0] == SVG_HTML.gif)
                    {
                        let categ_span_custom_plus = document.createElement("span");
                        categ_span_custom_plus.setAttribute('style', 'cursor:pointer');
                        categ_span_custom_plus.innerText = '[+]';
                        categ_span_custom_plus.addEventListener("click", function() { promptAddCustomEmojiGif(v[1] == 'Emojis'); });
                        categ_name.appendChild(categ_span_custom_plus);

                        let categ_span_custom_minus = document.createElement("span");
                        categ_span_custom_minus.setAttribute('style', 'cursor:pointer');
                        categ_span_custom_minus.innerText = '[-]';
                        categ_span_custom_minus.addEventListener("click", function() { confirmDeleteModeCustomEmojiGif(this); });
                        categ_name.appendChild(categ_span_custom_minus);

                        let categ_span_custom_sort = document.createElement("span");
                        categ_span_custom_sort.setAttribute('style', 'cursor:pointer;margin-top:-1px');
                        categ_span_custom_sort.innerText = '[⇔]';
                        categ_span_custom_sort.addEventListener("click", function() { confirmSortModeCustomEmojiGif(this); });
                        categ_name.appendChild(categ_span_custom_sort);
                    }
                    categ_div.appendChild(categ_name);
                    let emojis_sorted = (v[1] != 'Emojis' && v[1] != 'GIFs' && v[1] != 'HH' ? this.emojis.get(v[1]).sort((a, b) => a.unicode.localeCompare(b.unicode)) : this.emojis.get(v[1])); //do not sort custom emojis / gifs
                    for (const emoji of emojis_sorted) {
                        let img = document.createElement("img");
                        img.dataset.name = emoji.name;
                        img.dataset.unicode = emoji.unicode;
                        img.dataset.emoji = emoji.emoji;
                        img.dataset.category = v[1];
                        img.className = "emojikb-emoji";
                        first_emoji = first_emoji || emoji;
                        if (this.lazyImageObserver) {
                            this.lazyImageObserver.observe(img);
                            img.dataset.src = emoji.url;
                            img.classList.add('lazy');
                        } else {
                            img.src = emoji.url;
                        }
                        if(v[1] != 'Emojis' && v[1] != 'GIFs' && v[1] != 'HH') //no error handler for custom emojis / gifs
                        {
                            img.addEventListener('error', err => {
                                // console.info(err.target.dataset);
                                const data = err.target.dataset;
                                const index = this.emojis.get(data.category).findIndex(e => e.name == data.name);
                                if (index) this.emojis.get(data.category).splice(index, 1);
                                err.target.remove();
                                this.init_fuse(); // refresh search index
                            });
                        }
                        img.addEventListener('click', e => this.click_on_emoji(this, e));
                        img.addEventListener('mouseenter', e => this.hover_on_emoji(this, e));
                        img.addEventListener('mouseleave', e => this.hover_out_emoji(this, e));
                        categ_div.appendChild(img);
                    }
                    emojis_div.appendChild(categ_div);
                }
                // emoji info
                let info_div = document.createElement("div");
                info_div.id = "emojikb-info";
                let info_icon = document.createElement("img");
                info_icon.id = "emojikb-info-icon";
                info_icon.src = first_emoji.url;
                let info_name = document.createElement("div");
                info_name.id = "emojikb-info-name";
                info_name.innerText = first_emoji.name;
                info_div.appendChild(info_icon);
                info_div.appendChild(info_name);
                // we add everything together
                div3.appendChild(emojis_div);
                div3.appendChild(info_div);
                div2.appendChild(list_div);
                div2.appendChild(div3);
                main_div.appendChild(search_div);
                main_div.appendChild(div2);
                document.documentElement.appendChild(main_div);
                return main_div;
            }

            addCustomEmojiGifCode(code, url, isEmoji) {
                let img = document.createElement("img");
                img.dataset.name = code;
                img.dataset.unicode = code;
                img.dataset.emoji = code;
                img.dataset.category = isEmoji ? 'Emojis' : 'GIFs';
                img.className = "emojikb-emoji";
                if (this.lazyImageObserver) {
                    this.lazyImageObserver.observe(img);
                    img.dataset.src = url;
                    img.classList.add('lazy');
                } else {
                    img.src = url;
                }
                img.addEventListener('click', e => this.click_on_emoji(this, e));
                img.addEventListener('mouseenter', e => this.hover_on_emoji(this, e));
                img.addEventListener('mouseleave', e => this.hover_out_emoji(this, e));
                this.get_keyboard(document).querySelector('div.emojikb-categname[data-emojikb_categ="' + (isEmoji ? 'Emojis' : 'GIFs') + '"]').parentNode.appendChild(img);
            }

            // ----- resizes part ----- //

            resize(e, panel) {
                const dx = panel.dataset.m_pos - e.x;
                panel.dataset.m_pos = e.x;
                panel.style.width = (parseInt(getComputedStyle(panel, '').width) + dx) + "px";
            }
        }

        const SVG_HTML = {
            search: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0z" fill="none"/><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>',
            head: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12C2 17.522 6.477 22 12 22C17.523 22 22 17.522 22 12C22 6.477 17.522 2 12 2ZM16.293 6.293L17.707 7.706L16.414 9L17.707 10.293L16.293 11.706L13.586 9L16.293 6.293ZM6.293 7.707L7.707 6.294L10.414 9L7.707 11.707L6.293 10.294L7.586 9L6.293 7.707ZM12 19C9.609 19 7.412 17.868 6 16.043L7.559 14.486C8.555 15.92 10.196 16.831 12 16.831C13.809 16.831 15.447 15.92 16.443 14.481L18 16.04C16.59 17.867 14.396 19 12 19Z"></path></svg>',
            leaf: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.814 8.982C4.539 11.674 4.656 15.591 6.931 18.153L4.034 21.579L5.561 22.87L8.463 19.437C9.569 20.127 10.846 20.513 12.161 20.513C14.231 20.513 16.183 19.607 17.516 18.027C20.069 15.01 20.771 6.945 21 3C17.765 3.876 9.032 6.356 6.814 8.982V8.982ZM8.935 17.331C6.826 15.548 6.56 12.382 8.342 10.272C9.592 8.793 14.904 6.845 18.764 5.698L8.935 17.331V17.331Z"></path></svg>',
            food: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M11 18H13V22H11V18Z"></path><path d="M12 2C8.822 2 7 4.187 7 8V16C7 16.552 7.447 17 8 17H16C16.553 17 17 16.552 17 16V8C17 4.187 15.178 2 12 2ZM11 14.001H10V5.001H11V14.001ZM14 14.001H13V5.001H14V14.001Z"></path></svg>',
            game: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5.66487 5H18.3351C19.9078 5 21.2136 6.21463 21.3272 7.78329L21.9931 16.9774C22.0684 18.0165 21.287 18.9198 20.248 18.9951C20.2026 18.9984 20.1572 19 20.1117 19C18.919 19 17.8785 18.1904 17.5855 17.0342L17.0698 15H6.93015L6.41449 17.0342C6.12142 18.1904 5.08094 19 3.88826 19C2.84645 19 2.00189 18.1554 2.00189 17.1136C2.00189 17.0682 2.00354 17.0227 2.00682 16.9774L2.67271 7.78329C2.78632 6.21463 4.0921 5 5.66487 5ZM14.5 10C15.3284 10 16 9.32843 16 8.5C16 7.67157 15.3284 7 14.5 7C13.6716 7 13 7.67157 13 8.5C13 9.32843 13.6716 10 14.5 10ZM18.5 13C19.3284 13 20 12.3284 20 11.5C20 10.6716 19.3284 10 18.5 10C17.6716 10 17 10.6716 17 11.5C17 12.3284 17.6716 13 18.5 13ZM6.00001 9H4.00001V11H6.00001V13H8.00001V11H10V9H8.00001V7H6.00001V9Z"></path></svg>',
            submarine: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 17H19.725C19.892 16.529 20 16.029 20 15.5C20 13.015 17.985 11 15.5 11H13.5L12.276 8.553C12.107 8.214 11.761 8 11.382 8H7C6.448 8 6 8.447 6 9V11.051C3.753 11.302 2 13.186 2 15.5C2 17.986 4.015 20 6.5 20H15.5C16.563 20 17.527 19.616 18.297 19H22V17ZM6.5 16.75C5.81 16.75 5.25 16.19 5.25 15.5C5.25 14.81 5.81 14.25 6.5 14.25C7.19 14.25 7.75 14.81 7.75 15.5C7.75 16.19 7.19 16.75 6.5 16.75ZM11.5 16.75C10.81 16.75 10.25 16.19 10.25 15.5C10.25 14.81 10.81 14.25 11.5 14.25C12.19 14.25 12.75 14.81 12.75 15.5C12.75 16.19 12.19 16.75 11.5 16.75ZM16.5 16.75C15.81 16.75 15.25 16.19 15.25 15.5C15.25 14.81 15.81 14.25 16.5 14.25C17.19 14.25 17.75 14.81 17.75 15.5C17.75 16.19 17.19 16.75 16.5 16.75Z"></path><path d="M8 7H10C10 5.346 8.654 4 7 4H6V6H7C7.551 6 8 6.449 8 7Z"></path></svg>',
            tea: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18 5.999H17V4.999C17 4.448 16.553 3.999 16 3.999H4C3.447 3.999 3 4.448 3 4.999V12.999C3 14.488 3.47 15.865 4.265 16.999H15.722C16.335 16.122 16.761 15.105 16.92 13.999H18C20.205 13.999 22 12.205 22 9.999C22 7.794 20.205 5.999 18 5.999V5.999ZM18 12H17V8H18C19.104 8 20 8.897 20 10C20 11.102 19.104 12 18 12Z"></path><path d="M2 18H18V20H2V18Z"></path></svg>',
            heart: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 4.001C14.406 4.001 12.93 4.838 12 6.081C11.07 4.838 9.594 4.001 8 4.001C5.243 4.001 3 6.244 3 9.001C3 14.492 11.124 19.633 11.471 19.849C11.633 19.95 11.817 20.001 12 20.001C12.183 20.001 12.367 19.95 12.529 19.849C12.876 19.633 21 14.492 21 9.001C21 6.244 18.757 4.001 16 4.001V4.001Z"></path></svg>',
            flag: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 6.002H14V3.002C14 2.45 13.553 2.002 13 2.002H4C3.447 2.002 3 2.45 3 3.002V22.002H5V14.002H10.586L8.293 16.295C8.007 16.581 7.922 17.011 8.076 17.385C8.23 17.759 8.596 18.002 9 18.002H20C20.553 18.002 21 17.554 21 17.002V7.002C21 6.45 20.553 6.002 20 6.002Z"></path></svg>',
            custom: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>',
            hh: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path class="cls-3" d="M 74 68 L 68.17 50 L 57.42 53.52 L 57.63 54.18 L 63.19 71.32 L 63.24 71.49 L 53.82 78.76 L 46.77 57 L 36.11 60.46 L 41.88 78.33 L 31.22 81.81 L 25.5 64 L 21.94 65.14 L 18.49 54.49 L 22 53.3 L 16.26 35.39 L 26.89 32 L 32.72 50 L 43.45 46.54 L 42.85 44.67 L 37.68 28.68 L 37.62 28.51 L 47.05 21.24 L 54.05 42.99 L 64.72 39.55 L 59 21.66 L 69.65 18.19 L 75.37 36 L 78.93 34.85 L 82.38 45.55 L 78.83 46.73 L 84.61 64.65 L 74 68 Z"></path><ellipse style="fill: rgba(216, 216, 216, 0); stroke-width: 6px; stroke: rgb(255, 255, 255);" cx="50" cy="50" rx="43.5" ry="43.5"></ellipse></svg>',
            gif: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M 10.647 8.65 C 10.657 8.699 10.666 8.762 10.674 8.841 C 10.682 8.919 10.687 9.003 10.688 9.093 C 10.689 9.184 10.686 9.274 10.68 9.364 C 10.673 9.455 10.66 9.537 10.641 9.61 C 10.621 9.683 10.595 9.743 10.562 9.789 C 10.53 9.836 10.492 9.859 10.448 9.859 C 10.375 9.859 10.264 9.817 10.115 9.734 C 9.968 9.651 9.779 9.559 9.548 9.456 C 9.318 9.353 9.043 9.261 8.724 9.178 C 8.404 9.095 8.037 9.053 7.622 9.053 C 7.207 9.053 6.838 9.113 6.515 9.232 C 6.192 9.352 5.908 9.516 5.664 9.723 C 5.42 9.93 5.216 10.175 5.055 10.456 C 4.894 10.737 4.771 11.038 4.686 11.36 C 4.601 11.683 4.557 12.017 4.552 12.364 C 4.548 12.711 4.579 13.052 4.646 13.389 C 4.721 13.765 4.84 14.095 5.004 14.378 C 5.167 14.661 5.369 14.898 5.61 15.088 C 5.85 15.279 6.124 15.423 6.431 15.52 C 6.739 15.618 7.071 15.667 7.428 15.667 C 7.667 15.667 7.899 15.643 8.124 15.594 C 8.348 15.545 8.551 15.471 8.731 15.374 L 8.736 13.184 L 6.949 13.184 C 6.891 13.184 6.84 13.161 6.796 13.114 C 6.752 13.068 6.72 12.994 6.7 12.891 C 6.69 12.842 6.683 12.779 6.677 12.7 C 6.671 12.622 6.669 12.54 6.668 12.455 C 6.669 12.37 6.672 12.283 6.68 12.195 C 6.686 12.107 6.701 12.029 6.724 11.961 C 6.747 11.892 6.776 11.836 6.812 11.792 C 6.847 11.748 6.891 11.726 6.944 11.726 L 10.145 11.726 C 10.307 11.726 10.432 11.78 10.522 11.888 C 10.612 11.995 10.656 12.147 10.656 12.342 L 10.649 16.136 C 10.647 16.229 10.638 16.308 10.622 16.374 C 10.606 16.439 10.579 16.499 10.541 16.553 C 10.499 16.612 10.389 16.681 10.209 16.762 C 10.03 16.843 9.807 16.922 9.542 17 C 9.276 17.078 8.976 17.144 8.64 17.198 C 8.304 17.251 7.955 17.278 7.594 17.278 C 6.915 17.278 6.302 17.2 5.753 17.044 C 5.205 16.887 4.725 16.654 4.314 16.344 C 3.903 16.034 3.563 15.654 3.293 15.205 C 3.023 14.756 2.83 14.239 2.713 13.653 C 2.609 13.126 2.563 12.608 2.577 12.1 C 2.59 11.592 2.666 11.11 2.802 10.653 C 2.939 10.197 3.136 9.775 3.392 9.386 C 3.65 8.998 3.971 8.662 4.357 8.379 C 4.743 8.096 5.191 7.875 5.701 7.716 C 6.212 7.557 6.789 7.478 7.433 7.478 C 7.79 7.478 8.132 7.506 8.461 7.563 C 8.789 7.619 9.087 7.687 9.355 7.768 C 9.623 7.848 9.851 7.935 10.04 8.028 C 10.23 8.121 10.357 8.193 10.424 8.244 C 10.491 8.295 10.54 8.353 10.572 8.416 C 10.603 8.479 10.629 8.557 10.647 8.65 Z M 14.564 16.861 C 14.564 16.91 14.549 16.953 14.517 16.992 C 14.486 17.031 14.433 17.063 14.357 17.088 C 14.281 17.112 14.181 17.13 14.056 17.143 C 13.932 17.155 13.777 17.161 13.592 17.161 C 13.401 17.161 13.245 17.155 13.123 17.143 C 13.001 17.13 12.903 17.112 12.83 17.088 C 12.757 17.063 12.704 17.031 12.671 16.992 C 12.639 16.953 12.626 16.91 12.631 16.861 L 12.643 7.896 C 12.639 7.847 12.653 7.803 12.687 7.764 C 12.72 7.725 12.775 7.693 12.851 7.669 C 12.927 7.644 13.026 7.626 13.148 7.614 C 13.27 7.602 13.424 7.596 13.61 7.596 C 13.795 7.596 13.948 7.602 14.07 7.614 C 14.193 7.626 14.291 7.644 14.367 7.669 C 14.443 7.693 14.495 7.725 14.525 7.764 C 14.555 7.803 14.57 7.847 14.57 7.896 L 14.564 16.861 Z M 21.911 7.947 C 21.917 7.976 21.924 8.029 21.932 8.105 C 21.939 8.18 21.944 8.264 21.945 8.357 C 21.947 8.45 21.945 8.546 21.94 8.647 C 21.936 8.747 21.924 8.84 21.905 8.925 C 21.885 9.01 21.856 9.08 21.817 9.134 C 21.779 9.187 21.728 9.214 21.665 9.214 L 18.567 9.214 L 18.561 11.763 L 21.476 11.763 C 21.544 11.763 21.599 11.79 21.639 11.844 C 21.679 11.897 21.708 11.968 21.725 12.056 C 21.732 12.09 21.738 12.145 21.743 12.221 C 21.748 12.296 21.751 12.379 21.752 12.47 C 21.753 12.56 21.75 12.655 21.743 12.755 C 21.736 12.856 21.722 12.946 21.702 13.026 C 21.681 13.107 21.652 13.174 21.613 13.228 C 21.575 13.281 21.524 13.308 21.461 13.308 L 18.568 13.308 L 18.568 16.846 C 18.569 16.9 18.553 16.946 18.522 16.985 C 18.491 17.024 18.437 17.056 18.362 17.08 C 18.286 17.105 18.186 17.124 18.062 17.139 C 17.938 17.154 17.783 17.161 17.598 17.161 C 17.407 17.161 17.251 17.154 17.128 17.139 C 17.005 17.124 16.907 17.105 16.835 17.08 C 16.761 17.056 16.708 17.024 16.677 16.985 C 16.644 16.946 16.63 16.9 16.634 16.846 L 16.639 8.247 C 16.64 8.032 16.697 7.877 16.811 7.782 C 16.923 7.687 17.06 7.639 17.221 7.639 L 21.66 7.639 C 21.743 7.639 21.8 7.666 21.833 7.72 C 21.866 7.774 21.892 7.85 21.911 7.947 Z" style="fill: rgb(255, 255, 255);"></path></svg>',
            discord: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.8943 4.34399C17.5183 3.71467 16.057 3.256 14.5317 3C14.3396 3.33067 14.1263 3.77866 13.977 4.13067C12.3546 3.89599 10.7439 3.89599 9.14391 4.13067C8.99457 3.77866 8.77056 3.33067 8.58922 3C7.05325 3.256 5.59191 3.71467 4.22552 4.34399C1.46286 8.41865 0.716188 12.3973 1.08952 16.3226C2.92418 17.6559 4.69486 18.4666 6.4346 19C6.86126 18.424 7.24527 17.8053 7.57594 17.1546C6.9466 16.92 6.34927 16.632 5.77327 16.2906C5.9226 16.184 6.07194 16.0667 6.21061 15.9493C9.68793 17.5387 13.4543 17.5387 16.889 15.9493C17.0383 16.0667 17.177 16.184 17.3263 16.2906C16.7503 16.632 16.153 16.92 15.5236 17.1546C15.8543 17.8053 16.2383 18.424 16.665 19C18.4036 18.4666 20.185 17.6559 22.01 16.3226C22.4687 11.7787 21.2836 7.83202 18.8943 4.34399ZM8.05593 13.9013C7.01058 13.9013 6.15725 12.952 6.15725 11.7893C6.15725 10.6267 6.98925 9.67731 8.05593 9.67731C9.11191 9.67731 9.97588 10.6267 9.95454 11.7893C9.95454 12.952 9.11191 13.9013 8.05593 13.9013ZM15.065 13.9013C14.0196 13.9013 13.1652 12.952 13.1652 11.7893C13.1652 10.6267 13.9983 9.67731 15.065 9.67731C16.121 9.67731 16.985 10.6267 16.9636 11.7893C16.9636 12.952 16.1317 13.9013 15.065 13.9013Z" stroke-linejoin="round" style="stroke: rgb(255, 255, 255);"/></svg>'
        }
    }

    function gameFrame()
    {
        //css
        addCss();

        //window resize event
        window.addEventListener('resize', addCss);

        function addCss()
        {
            let css = document.getElementById('HHCLUBCHATPLUSPLUS-CSS');
            if(css === null)
            {
                css = document.createElement('style');
                css.setAttribute('id', 'HHCLUBCHATPLUSPLUS-CSS');
                document.head.appendChild(css);
            }
            else
            {
                for (let i = css.sheet.cssRules.length - 1; i > -1; i--) {
                    css.sheet.deleteRule(i);
                }
            }

            const is_Mobile = isMobile();

            //++
            css.sheet.insertRule('#chat_btn .chat_mix_icn::after {content:"++";position:absolute;width:auto;font-size:' + (is_Mobile ? 46 : 26) + 'px;bottom:-' + (is_Mobile ? 24 : 14) + 'px;right:' + (is_Mobile ? -7 : -6) + 'px;text-shadow:0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000;-moz-transform:rotate(0.05deg);}');

            //KK bug fixed: Position fix for exclamation mark
            css.sheet.insertRule('body div header img.new_notif.chat_btn_notif {left:' + (is_Mobile ? 75 : 43) + 'px !important}');

            //css ping message box
            css.sheet.insertRule('#chat_btn div.ping {display:none;position:absolute;top:' + (is_Mobile ? 70 : 45) + 'px;left:0px;width:150px;border:1px solid #ffb827;border-radius:15px;background-color:rgba(32, 3, 7, 0.7);}');
            css.sheet.insertRule('#chat_btn div.visible {display:block !important;}');
            css.sheet.insertRule('#chat_btn div.ping div {padding:5px 10px 5px 10px;text-align:center;font-size:14px;}');
            css.sheet.insertRule('header {z-index:21 !important;}'); //TODO doesnt work for pachinko
        }

        function getPingNotificationBox()
        {
            let pingNotificationBox = document.getElementById('ping');
            if(pingNotificationBox === null)
            {
                //create ping message box
                let chat_btn = document.getElementById('chat_btn');
                pingNotificationBox = document.createElement('div');
                pingNotificationBox.setAttribute('id', 'ping');
                pingNotificationBox.setAttribute('class', 'ping');
                pingNotificationBox.appendChild(document.createElement('div'));
                chat_btn.appendChild(pingNotificationBox);
            }
            return pingNotificationBox;
        }

        //cross-domain communication
        function receiveMessage(e)
        {
            if(typeof e.data === 'object' && e.data.HHCCPlusPlus === true)
            {
                //console.log('GameFrame-ReceiveMessage', e.data);

                switch (e.data.type) {
                    case 'ping':
                        receivedPing(e);
                        break;
                    case 'heroPagePopup':
                        receivedHeroPagePopup(e);
                        break;
                    case 'disconnected':
                        receivedDisconnected(e);
                        break;
                    default:
                        console.warn('unknown message type: ' + e.data.type);
                        break;
                }
            }
        }

        function receivedPing(e) {
            const pingMessageCount = e.data.pingMessageCount;
            const pingNotificationBox = getPingNotificationBox();
            if(pingMessageCount > 0)
            {
                if(pingMessageCount === 1) {
                    pingNotificationBox.firstChild.innerHTML = 'There is a new message for you!';
                } else {
                    pingNotificationBox.firstChild.innerHTML = 'There are ' + pingMessageCount + ' new messages for you!';
                }

                pingNotificationBox.setAttribute('class', 'ping visible');
            }
            else
            {
                pingNotificationBox.setAttribute('class', 'ping');
            }
        }

        function receivedHeroPagePopup(e) {
            hero_page_popup({id:e.data.playerId});
        }

        function receivedDisconnected(e) {
            let popup_message = document.querySelector('#popup_message div');
            let msgLC = popup_message == null ? null : popup_message.innerHTML.toLowerCase();
            if(msgLC == null || (
                !msgLC.includes('chat server') && //EN
                !msgLC.includes('chatserver') && //DE
                !msgLC.includes('chat serveur') && //FR
                !msgLC.includes('server chat') && //IT
                !msgLC.includes('servidor de chat') && //ES
                !msgLC.includes('チャットサーバー') && //JP
                !msgLC.includes('чат') //RU
            ))
            {
                window.parent.postMessage({ HHCCPlusPlus: true, type: 'fixClubChat' }, '*');
            }
            else
            {
                //KK BUG: if there are multiple popups, only one can be closed. FIX: add onclick handlers to all error popups
                document.querySelectorAll('#popup_message close').forEach(e => { e.setAttribute('onClick', 'this.parentNode.remove()'); });
            }
        }

        if (window.location.pathname === '/harem.html')
        {
            // scrape harem data and send to chat frame
            let girlDict = {};
            Object.values(girlsDataList).forEach((girl) => {
                const {id_girl, name, nb_grades} = girl;
                girlDict[id_girl] = {name: name, grade: nb_grades};
            });
            window.parent.postMessage({ HHCCPlusPlus: true, type: 'girlsUpdate', girls: girlDict }, '*');
        }

        window.addEventListener('message', receiveMessage);
    }

    function inIFrame()
    {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function isMobile()
    {
        return $(window).width() <= 1025; //ClubChat.isMobileSize();
    }
})();
