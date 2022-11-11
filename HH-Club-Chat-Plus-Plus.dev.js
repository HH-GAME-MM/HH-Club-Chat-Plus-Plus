// ==UserScript==
// @name         HH Club Chat++
// @version      0.37
// @description  Upgrade Club Chat with various features and bug fixes
// @author       -MM-
// @match        https://*.hentaiheroes.com/
// @match        https://*.hentaiheroes.com/?*
// @match        https://*.hentaiheroes.com/#*
// @match        https://*.comixharem.com/
// @match        https://*.comixharem.com/?*
// @match        https://*.comixharem.com/#*
// @match        https://*.pornstarharem.com/
// @match        https://*.pornstarharem.com/?*
// @match        https://*.pornstarharem.com/#*
// @run-at       document-end
// @namespace    https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus
// @updateURL    https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js
// @downloadURL  https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant        GM_info
// ==/UserScript==

//CHANGELOG: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/blob/main/CHANGELOG.md

(function() {
    //definitions
    'use strict';
    /*global ClubChat,club_tabs*/

    console.log('HH Club Chat++ Script v' + GM_info.script.version);

    const HHCLUBCHATPLUSPLUS_URL_DOWNLOAD = 'https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js';
    const HHCLUBCHATPLUSPLUS_URL_RES = 'https://raw.githubusercontent.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/main/res/';
    const HHCLUBCHATPLUSPLUS_INDICATOR = ' \u200D';

    //check push version
    checkPushVersion();

    //create new input and send button
    createNewInputAndSendButton();

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
    css.sheet.insertRule('div.chat-msg div.chat-msg-avatar img.icon {width:36px !important;height:36px !important;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt {margin-top:-16px !important;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-time {margin-top:-2px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.playername {cursor:pointer;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.member {color:#8a8ae6;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.coleader {color:#f3a03c;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.leader {color:#f33c3d;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.self {color:#ffd700;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.active_light {display:inline-block;width:.75rem;height:.75rem;margin:0px 4px 4px 11px;transform:rotate(45deg);border:1px solid #000;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.HHCCPlusPlus {color:white;font-size:20px;line-height:1;margin:0px 2px 0px 5px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info {pointer-events: none;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info * {pointer-events: auto;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt a {color:white;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt img {max-width:200px;max-height:100px;}');
    css.sheet.insertRule('div.club-chat-messages div.chat-msg div.chat-msg-txt img.emoji {max-width:24px;max-height:24px;}');
    css.sheet.insertRule('div.club-chat-messages div.chat-msg div.chat-msg-txt img.emoji-only {max-width:36px;max-height:36px;}');
    css.sheet.insertRule('div.pinned-block div.chat-msg div.chat-msg-txt img.emoji {max-width:16px;max-height:16px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh {width:300px;background-color:#2f3136;padding:7px;border-radius:7px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.left {float:left;width:70%;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.right {float:right;width:30%;text-align:right;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.clear {clear:both;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh img {width:80px;}');
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

    //chat variables
    let playerName = null;
    let playerNamePing = null;
    let pingValidList = [];
    let pingMessageCount = 0;
    let lastMsgTimestamp = 0;
    let lastMsgTimestampSeen = loadLastMsgTimestampSeen(); //we cant use ClubChat.lastSeenMessage because its not available when we receive the first messages
    const mapGIFs = getMapGIFs();
    const mapEmojis = getMapEmojis();
    const mapCustomEmojiGifHosts = getMapCustomEmojiGifHosts();
    const mapCustomEmojiGifFileExtensions = getMapCustomEmojiGifFileExtensions();

    //EmojiKeyboard
    let emojiKeyboard;
    initEmojiKeyboard();

    //observe chat messages
    function observerMessagesFunction(mutations, observer) {

        //get iFrame
        let iFrame = getIFrame();

        //chat visible?
        let chatWindowVisible = document.querySelector('#resize-chat-box').classList.contains('visible');

        //get playername
        if(playerName == null && iFrame.querySelector('.square-avatar-wrapper') != null)
        {
            playerName = iFrame.querySelector('.square-avatar-wrapper').getAttribute('title');
            playerNamePing = '@' + playerName.toLowerCase().replaceAll(' ', '_');
        }

        //get playerId
        let playerId = ClubChat.id_member;

        //get playerId of club leader
        let clubLeaderPlayerId = parseInt(ClubChat.chatVars.CLUB_INFO.leader_id);

        //get playerId of club co-leaders
        let clubCoLeadersPlayerId = [];
        ClubChat.chatVars.CLUB_INFO.co_leaders.forEach(e => { clubCoLeadersPlayerId.push(parseInt(e)) });

        //get pingValidList
        if(pingValidList.length == 0 && document.querySelectorAll('div.chat-members-list div.member p.name-member').length != 0)
        {
            pingValidList.push('@club');
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
                let html = node.lastElementChild.innerHTML;
                let sentByHHCCPlusPlus = html.endsWith(HHCLUBCHATPLUSPLUS_INDICATOR);
                if(sentByHHCCPlusPlus) html = html.substr(0, html.length - HHCLUBCHATPLUSPLUS_INDICATOR.length);
                let htmlLC = html.toLowerCase();
                let isPinnedMsg = (mutations[i].pinnedBlock == true);

                //update and save last (seen) message timestamp in localstore
                if(lastMsgTimestamp < msgIdTimestampMs)
                {
                    lastMsgTimestamp = msgIdTimestampMs;
                }
                if(chatWindowVisible && lastMsgTimestampSeen < lastMsgTimestamp)
                {
                    lastMsgTimestampSeen = lastMsgTimestamp;
                    saveLastMsgTimestampSeen();
                }

                //change the playername color (self gold, club leader red, club co leaders orange, members blue) and add "click to ping"
                let nodeSpanMsgSender = node.querySelector('div.chat-msg-info span.chat-msg-sender');
                let nodeSpanMsgSender_nickname = document.createElement('span');
                nodeSpanMsgSender_nickname.setAttribute('class', 'playername ' + (msgIdPlayerId == playerId ? 'self' : (msgIdPlayerId == clubLeaderPlayerId ? 'leader' : (clubCoLeadersPlayerId.includes(msgIdPlayerId) ? 'coleader' : 'member'))));
                nodeSpanMsgSender_nickname.setAttribute('onClick', 'ClubChat.insertPingToInput(this)');
                nodeSpanMsgSender_nickname.innerHTML = nodeSpanMsgSender.innerHTML;
                nodeSpanMsgSender.innerHTML = '';
                nodeSpanMsgSender.appendChild(nodeSpanMsgSender_nickname);

                //add the online icon
                if(!isPinnedMsg)
                {
                    let nodeSpanMsgSender_active_light = document.createElement('span');
                    nodeSpanMsgSender_active_light.setAttribute('class', 'active_light');
                    nodeSpanMsgSender_active_light.setAttribute('title', 'Online Status');
                    nodeSpanMsgSender.appendChild(nodeSpanMsgSender_active_light);
                }

                //mark message as sent by HH Club Chat++
                if(sentByHHCCPlusPlus)
                {
                    let nodeSpanMsgSender_HHCCPlusPlus = document.createElement('span');
                    nodeSpanMsgSender_HHCCPlusPlus.setAttribute('class', 'HHCCPlusPlus');
                    nodeSpanMsgSender_HHCCPlusPlus.setAttribute('title', 'HH Club Chat++');
                    nodeSpanMsgSender_HHCCPlusPlus.innerHTML = '++';
                    nodeSpanMsgSender.appendChild(nodeSpanMsgSender_HHCCPlusPlus);
                }

                //new html
                let htmlNew = [];
                let forceScrollDown = false;
                let emojiOnly = false; //emojis can be larger if the message contains nothing else

                if(htmlLC == '!help' && !isPinnedMsg)
                {
                    //did THIS user invoke the command !help ?
                    if(msgIdPlayerId == playerId)
                    {
                        forceScrollDown = true;
                        let gifs = '';
                        mapGIFs.forEach((value, key) => { if((Array.isArray(value) && value.length == 1) || (!Array.isArray(value) && mapGIFs.get(value).length == 1)) gifs += key + ' '; });
                        let gifsRandom = '';
                        mapGIFs.forEach((value, key) => { if((Array.isArray(value) && value.length != 1) || (!Array.isArray(value) && mapGIFs.get(value).length != 1)) gifsRandom += key + ' '; });
                        let emojis = '';
                        mapEmojis.forEach((value, key) => { emojis += key + ' '; });
                        htmlNew.push({ isValid: true, value: '!help = show this help (hidden for other script users)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">PING</span><br/>' +
                                      '@club = ping all club members<br/>' +
                                      '@<span style="font-style:italic;">&lt;membername&gt;</span> = ping a club member<br/>' +
                                      'Note 1: Club members will receive a notification outside of the chat, when the chat is not open<br/>' +
                                      'Note 2: Replace spaces with underscores. E.g. to ping John Doe write @John_Doe<br/>' +
                                      'Note 3: Click on a nickname to ping<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">SPOILER</span><br/>' +
                                      '/spoiler <span style="font-style:italic;">&lt;text / images&gt;</span> = hide text and images in a spoiler block<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">LINKS / IMAGES / GIRL POSES</span><br/>' +
                                      'Links and images are clickable and open in a new tab. Post a URL to an image or a girl pose and it will be embedded in the chat.<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">COMMANDS</span><br/>' +
                                      '!hh <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link for a girl (HH++ required)<br/>' +
                                      '!poses <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link and all poses of a girl in a spoiler block (HH++ required)<br/>' +
                                      '!script <span style="font-style:italic;">&lt;optional text&gt;</span> = post the script links with an optional text (user friendly for non-script users)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">DICE</span><br/>' +
                                      '/dice = roll a dice (D6, 1-6)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">TEXT FORMATTING</span><br/>' +
                                      '*italic* = <span style="font-style:italic;">italic</span><br/>' +
                                      '**bold** = <span style="font-weight:bold;">bold</span><br/>' +
                                      '__underline__ = <span style="text-decoration:underline;">underlined</span><br/>' +
                                      '~~strikethrough~~ = <span style="text-decoration:line-through;">strikethrough</span><br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">PLAINTEXT</span><br/>' +
                                      '/plain <span style="font-style:italic;">&lt;text&gt;</span> = post text without text formatting<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">GIFS</span><br/>' +
                                      'The following gifs are available: ' + gifs + '<br/>' +
                                      'The following random gifs are available: ' + gifsRandom + '<br/>' +
                                      'Note: Only one GIF per message allowed. GIF code can be used anywhere in the text<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">EMOJIS</span><br/>' +
                                      'The following emojis are available: ' + emojis + '<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">MISCELLANEOUS</span><br/>' +
                                      '- The nickname color is changed. Your nickname is gold, the club leader is red, the club co leaders are orange and all members are blue<br/>' +
                                      '- Online/Offline status added behind the nickname (with auto refresh)<br/>' +
                                      '- ++ added behind the nickname (indicates who is using this script)<br/>' +
                                      '- Added Emojis / GIFs Picker "EmojiKeyboard"<br/>' +
                                      '- Chat window remains in its position and size<br/>' +
                                      '- Auto Scrolling fixed. It scrolls only if the scrollbar is close to the bottom<br/>' +
                                      '- Bug Fixes: "Idle/Disconnect", "Chat disabled until click a menu", "Firefox: Member list outside the window"<br/>' +
                                      '- Avatars are a bit bigger<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">CREDITS</span><br/>' +
                                      'Script coded by -MM- and tested with club mates "Hērōēs Prāvī Forī [EN]"<br/>' +
                                      'Compatible with Mozilla Firefox (Desktop), Google Chrome (Desktop & Android), Firefox Nightly (Android)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">SPONSORS</span><br/>' +
                                      'Uxio and lep - Thanks for sponsoring!<br/>' +
                                      'If you would like to support me, you can do so here: <a href="https://www.buymeacoffee.com/HHMM" target="_blank">https://www.buymeacoffee.com/HHMM</a><br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">SCRIPT INFORMATION</span><br/>' +
                                      'HH Club Chat++ Script v' + GM_info.script.version + '<br/>' +
                                      '<a href="https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/blob/main/CHANGELOG.md" target="_blank">https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/blob/main/CHANGELOG.md</a>' });
                    }
                    else
                    {
                        //hide other players !help
                        node.setAttribute('style', 'display:none;');
                    }
                }
                else if(htmlLC.startsWith('!hh ') && htmlLC.length > 4 && !isPinnedMsg)
                {
                    let param1 = html.substr(4).trim();
                    let girlId = -1;
                    let girlName = null;

                    //is it a girl id or a girl name?
                    let girlDictionary = getHHPlusPlusGirlDictionary();
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
                        let url = girlName != 'Unknown Girl' ? 'https://harem-battle.club/wiki/Harem-Heroes/HH:' + girlName.replaceAll(' ', '-').replaceAll('.', '').replaceAll('’', '') : null;
                        htmlNew.push({ isValid: true, value: '<div class="hh"><div class="left">' + (url != null ? '<a href="' + url + '" target="_blank">' + girlName + '</a>' : 'Girl ID ' + girlId) + '<br/><br/>' + (url != null ? 'All' : 'No') + ' infos about her!</div><div class="right">' + (url != null ? '<a href="' + url + '" target="_blank">' : '') + '<img title="' + girlName + '" src="https://hh2.hh-content.com/pictures/girls/'+girlId+'/ico0-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">' + (url != null ? '</a>' : '') + '</div><div class="clear"></div></div>' + (url != null ? '<br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
                    }
                }
                else if(htmlLC.startsWith('!poses ') && htmlLC.length > 7 && !isPinnedMsg)
                {
                    let param1 = html.substr(7).trim();
                    let girlId = -1;
                    let girlName = null;
                    let girlGrade = -1;

                    //is it a girl id or a girl name?
                    let girlDictionary = getHHPlusPlusGirlDictionary();
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
                        let htmlPoses = '<span class="spoiler" title="click to reveal spoiler" onClick="this.setAttribute(\'class\',\'spoiler-visible\');this.setAttribute(\'title\',\'\');ClubChat.resizeNiceScroll()">';
                        if(girlGrade == -1) girlGrade = 6; //use 6 girl poses if we have the girl but no girl grade
                        for(let k = 0; k <= girlGrade; k++)
                        {
                            htmlPoses += '<a href="https://hh2.hh-content.com/pictures/girls/' + girlId + '/ava' + k + '-1200x.webp?v=5" target="_blank"><img title="Pose ' + k + '" src="https://hh2.hh-content.com/pictures/girls/' + girlId + '/ava' + k + '-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()" onerror="this.parentNode.style.display=\'none\'"></a>';
                        }
                        htmlPoses += '</span>';

                        let url = girlName != 'Unknown Girl' ? 'https://harem-battle.club/wiki/Harem-Heroes/HH:' + girlName.replaceAll(' ', '-').replaceAll('.', '').replaceAll('’', '') : null;
                        htmlNew.push({ isValid: true, value: '<div class="poses">' + (url != null ? '<a href="' + url + '" target="_blank">Poses: ' + girlName + '</a>' : '<span>Poses: Girl ID ' + girlId) + '</span><br/><br/>' + htmlPoses + '</div>' + (url != null ? '<br/><br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
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
                            if((fileExtension.endsWith('.gif') || fileExtension.endsWith('.jpg') || fileExtension == '.jpeg' || fileExtension.endsWith('.png') || fileExtension == '.webp') && !isPinnedMsg)
                            {
                                htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank"><img src="' + word + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()"></a>' });
                            }
                            else //its a link
                            {
                                htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank" onclick="return confirm(\'Do you really want to open this link?\')">' + word + '</a>' });
                            }
                        }
                        else if(word.startsWith('@') && word.length != 1 && !isPinnedMsg) //ping
                        {
                            //ignore some characters at the end
                            if([',', '.', '!', '?', ':', ')'].includes(wordLC[wordLC.length - 1])) wordLC = wordLC.substr(0, wordLC.length - 1);

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
                                    case '@safi': wordLC = '@safi_the_orca'; break;
                                    case '@fakemm':
                                    case '@hpfcc': wordLC = '@hērōēs_prāvī_forī_cc'; break;
                                }
                            }

                            //ping valid?
                            if(pingValidList.includes(wordLC))
                            {
                                //format the ping word
                                htmlNew.push({ isValid: true, value: '<span class="ping">' + word + '</span>' });

                                //is the ping for this user?
                                if(!pingReceived && (wordLC == '@club' || (playerNamePing != null && wordLC == playerNamePing)))
                                {
                                    //only one ping per message
                                    pingReceived = true;

                                    //highlight the message
                                    node.setAttribute('style', 'background-color:#49443c');

                                    //if the chat window is not visible and if its a new unread ping message, we notify the user about it
                                    if(!chatWindowVisible && lastMsgTimestampSeen < msgIdTimestampMs)
                                    {
                                        pingMessageCount++;
                                        let pingNotificationBox = getPingNotificationBox(iFrame);
                                        pingUpdateText(pingNotificationBox);
                                        pingVisible(pingNotificationBox);
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
                            if(wordLC.length > 2 && wordLC.startsWith(':') && wordLC.endsWith(':') && mapEmojis.has(wordLC))
                            {
                                let emojiId = mapEmojis.get(wordLC);
                                if(emojiId.startsWith(':')) emojiId = mapEmojis.get(emojiId); //emoji alias
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
                            else if(!hasGif && wordLC.startsWith('!') && (mapGIFs.has(wordLC) || isCustomGifCode(word) || (wordLC.includes('_') && mapGIFs.has(wordLC.substr(0, wordLC.indexOf('_'))))) && !isPinnedMsg) //gifs (only one gif per message allowed)
                            {
                                emojiOnly = false;
                                hasGif = true;

                                let imgSrc;
                                if(isCustomGifCode(word))
                                {
                                    wordLC = '!CustomGif';
                                    imgSrc = convertCustomGifCodeToUrl(word);
                                }
                                else
                                {
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

                                let htmlGif = '<img src="' + (imgSrc.startsWith('https://') ? imgSrc : 'https://media.tenor.com/' + imgSrc) + '" title="' + wordLC + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">';

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
                    node.lastElementChild.innerHTML = htmlNewStr;

                    //scrolling
                    ClubChat.resizeNiceScrollAndUpdatePosition();
                    if(forceScrollDown) scrollDown();
                }
            }
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

        let iFrame = getIFrame();

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
                        pingInvisible(getPingNotificationBox(iFrame));
                    }

                    //update position and size of emojiKeyboard
                    updateEmojiKeyboardPositionAndSize(mutations[i].target);

                    //scroll down in the chat when chat turns visible
                    scrollDown();
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
            let iFrame = getIFrame();
            let popup_message = iFrame.querySelector('#popup_message div');
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
                pingMessageCount = 0; //reset ping counter, as we will receive all chat messages again after successful reconnection
                ClubChat.hasInit = false;
                fixClubChat();
            }
            else
            {
                //KK BUG: if there are multiple popups, only one can be closed. FIX: add onclick handlers to all error popups
                iFrame.querySelectorAll('#popup_message close').forEach(e => { e.setAttribute('onClick', 'this.parentNode.remove()'); });
            }
        }
    });
    observerSendMsg.observe(document.querySelector('input.club-chat-input'), { attributes:true });
    observerSendMsg.observe(document.querySelector('button.club-chat-send'), { attributes:true });

    //iFrame onload event
    document.getElementById("hh_game").onload = function() {

        //get iFrame
        let iFrame = getIFrame();

        //css iFrame
        addIFrameCss(iFrame);

        //do we still have new ping messages? if yes, display the ping notification box again
        if(pingMessageCount != 0)
        {
            let pingNotificationBox = getPingNotificationBox(iFrame);
            pingUpdateText(pingNotificationBox);
            pingVisible(pingNotificationBox);
        }
    };

    //window resize event
    window.addEventListener('resize', function() {

        //get iFrame
        let iFrame = getIFrame();

        //css iFrame
        addIFrameCss(iFrame);

        //update position and size of emojiKeyboard
        updateEmojiKeyboardPositionAndSize(document.getElementById('resize-chat-box'));
    });

    function createNewInputAndSendButton()
    {
        //create new input and send button
        let container = document.querySelector('div.send-block-container');
        let input = document.createElement("input");
        input.setAttribute('class', 'club-chat-input-custom');
        input.setAttribute('maxlength', 500 - HHCLUBCHATPLUSPLUS_INDICATOR.length); //real maxlength is 500
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

                //change the commands !hh and !poses to make them language independent
                let cmd = null;
                if(textLC.startsWith('!hh ') && textLC.length > 4) cmd = '!hh ';
                else if(textLC.startsWith('!poses ') && textLC.length > 7) cmd = '!poses ';
                if(cmd != null)
                {
                    let param1 = text.substr(cmd.length).trim();

                    //is it a girl name?
                    if(!strIsInt(param1))
                    {
                        let girlId = getGirlIdByName(param1, getHHPlusPlusGirlDictionary());
                        if(girlId != -1) text = cmd + girlId; //change the girl name to the girl id
                    }
                }
                else if(textLC.startsWith('!script'))
                {
                    //send the !script text without HHCLUBCHATPLUSPLUS_INDICATOR
                    let param1 = text.substr(7);
                    input.value = param1 + ' Club Chat++ description and installation instructions: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus';
                    ClubChat.send_msg();
                    input.value = param1 + ' Club Chat++ direct link: https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js';
                    ClubChat.send_msg();
                    return;
                }

                input.value = text + HHCLUBCHATPLUSPLUS_INDICATOR;
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
                if(oldText != newText) document.querySelector('input.club-chat-input-custom').value = newText.substr(0, newText.length - HHCLUBCHATPLUSPLUS_INDICATOR.length);
            }
        }

        //add new function
        ClubChat.insertPingToInput = function(e) {

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
        img.src = 'https://raw.githubusercontent.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/main/pushVersion.gif?' + Date.now() + '#' + Date.now();
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
                a.setAttribute('style', 'color:red');
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
        if(!ClubChat.hasInit)
        {
            if(attempts < 10)
            {
                attempts++;
                if(ClubChat.chatVars != null) //dont do it at the beginning
                {
                    ClubChat.init();
                }
            }
            else
            {
                return;
            }
        }

        //did it work?
        if(ClubChat.hasInit)
        {
            //update club id to prevent wrong call to unPinMsg()
            ClubChat.club_id = ClubChat.chatVars.CLUB_INFO.id_club;

            //run this code once when the chat is ready
            if(typeof ClubChat.hasFirstInit == 'undefined')
            {
                ClubChat.hasFirstInit = true;

                //parse pinned messages
                ClubChat.socket.on("pin", parsePinnedMessage);
                //parse the pinned message if there already is one
                if(document.querySelector('div.pinned-block div.container div') != null) parsePinnedMessage();

                //bug fix for Mozilla Firefox: The member list is outside the window at the first click
                fixTabs_MozillaFirefox();
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
                setTimeout(fixClubChat, 60000);
            }
        }
    }

    function fixTabs_MozillaFirefox()
    {
        //bug fix for Mozilla Firefox: The member list is outside the window at the first click
        club_tabs.switchTab("chat_members_list", "chat-tabs", "chat-container");
        club_tabs.switchTab("chat_block", "chat-tabs", "chat-container");
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

    function parsePinnedMessage(data = null)
    {
        let mr = {addedNodes: [document.querySelector('div.pinned-block div.container div')], target: document.querySelector('div.pinned-block div.container'), pinnedBlock: true};
        observerMessagesFunction([mr], observerMessages);
    }

    function getIFrame()
    {
        let iFrame = document.getElementById("hh_game");
        iFrame = (iFrame.contentWindow || iFrame.contentDocument);
        if (iFrame.document) iFrame = iFrame.document;
        return iFrame;
    }

    function addIFrameCss(iFrame)
    {
        let cssIFrame = iFrame.getElementById('cssIFrame');
        if(cssIFrame == null) cssIFrame = iFrame.createElement('style');
        iFrame.head.appendChild(cssIFrame);
        cssIFrame.setAttribute('id', 'cssIFrame');

        let is_Mobile = isMobile();
        cssIFrame.sheet.insertRule('#chat_btn .chat_mix_icn::after {content:"++";position:absolute;width:auto;font-size:' + (is_Mobile ? 46 : 26) + 'px;bottom:-' + (is_Mobile ? 24 : 14) + 'px;right:-8px;text-shadow:0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000;-moz-transform:rotate(0.05deg);}');

        //css ping message box
        cssIFrame.sheet.insertRule('#chat_btn div.ping {display:none;position:absolute;top:' + (is_Mobile ? 70 : 45) + 'px;left:0px;width:150px;border:1px solid #ffb827;border-radius:15px;background-color:rgba(32, 3, 7, 0.7);}');
        cssIFrame.sheet.insertRule('#chat_btn div.visible {display:block !important;}');
        cssIFrame.sheet.insertRule('#chat_btn div.ping div {padding:5px 10px 5px 10px;text-align:center;font-size:14px;}');
        cssIFrame.sheet.insertRule('header {z-index:21 !important;}'); //TODO doesnt work for pachinko
    }

    function getPingNotificationBox(iFrame)
    {
        let pingNotificationBox = iFrame.getElementById('ping');
        if(pingNotificationBox == null)
        {
            //create ping message box
            let chat_btn = iFrame.getElementById('chat_btn');
            pingNotificationBox = iFrame.createElement('div');
            pingNotificationBox.setAttribute('id', 'ping');
            pingNotificationBox.setAttribute('class', 'ping');
            pingNotificationBox.appendChild(iFrame.createElement('div'));
            chat_btn.appendChild(pingNotificationBox);
        }
        return pingNotificationBox;
    }

    function pingUpdateText(pingNotificationBox)
    {
        if(pingMessageCount == 1)
        {
            pingNotificationBox.firstChild.innerHTML = 'There is a new message for you!';
        }
        else
        {
            pingNotificationBox.firstChild.innerHTML = 'There are ' + pingMessageCount + ' new messages for you!';
        }
    }

    function pingVisible(pingNotificationBox)
    {
        pingNotificationBox.setAttribute('class', 'ping visible');
    }

    function pingInvisible(pingNotificationBox)
    {
        pingNotificationBox.setAttribute('class', 'ping');
    }

    function loadLastMsgTimestampSeen()
    {
        let lastMsgTimestampSeenLS = localStorage.getItem('HHClubChatPlusPlus_LastMsgTimestampSeen');
        return lastMsgTimestampSeenLS == null ? 0 : parseInt(lastMsgTimestampSeenLS);
    }

    function saveLastMsgTimestampSeen()
    {
        localStorage.setItem('HHClubChatPlusPlus_LastMsgTimestampSeen', lastMsgTimestampSeen);
    }

    function loadLastChatWindowPositionAndSize(chatWnd)
    {
        //disabled on mobile
        if(!isMobile())
        {
            let vars = localStorage.getItem('HHClubChatPlusPlus_PositionAndSize');
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
            localStorage.removeItem('HHClubChatPlusPlus_PositionAndSize');
        }
    }

    function saveLastChatWindowPositionAndSize(chatWnd)
    {
        //disabled on mobile
        if(!isMobile()) localStorage.setItem('HHClubChatPlusPlus_PositionAndSize', chatWnd.style.left + ',' + chatWnd.style.top + ',' + chatWnd.style.width + ',' + chatWnd.style.height);
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

    function getHHPlusPlusGirlDictionary()
    {
        let girlDictJSON = localStorage.getItem('HHPlusPlusGirlDictionary');
        return girlDictJSON != null ? new Map(JSON.parse(girlDictJSON)) : new Map();
    }

    function isMobile()
    {
        return ClubChat.isMobileSize();
    }

    function strIsInt(s)
    {
        if (typeof s != 'string') return false
        return !isNaN(s) && !isNaN(parseInt(s));
    }

    function initEmojiKeyboard()
    {
        //fuse.js
        let fuseJsFile = document.createElement('script');
        fuseJsFile.src = 'https://cdn.jsdelivr.net/npm/fuse.js/dist/fuse.js';
        fuseJsFile.onload = function() { initEmojiKeyboard_OnLoad(); }
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
        emojiKeyboard.callback = (emoji, closed) => {

            //DeleteMode for custom Emojis/Gifs enabled?
            if(emojiKeyboard.customEmojiGifDeleteMode > 0)
            {
                let isEmoji = isCustomEmojiCode(emoji.emoji);
                let isGif = false;
                let ret = false;
                if(isEmoji)
                {
                    ret = removeCustomEmojiFromLocalStore(emoji.emoji);
                }
                else
                {
                    isGif = isCustomGifCode(emoji.emoji);
                    if(isGif) ret = removeCustomGifFromLocalStore(emoji.emoji);
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

        //add emojis to emojiKeyboard
        let emojiKeyboardEmojis = emojiKeyboard.emojis.get('Emojis');
        mapEmojis.forEach((value, key) => {
            //is it not an alias?
            if(!value.startsWith(':'))
            {
                emojiKeyboardEmojis.push({
                    url: value.startsWith('res:') ? HHCLUBCHATPLUSPLUS_URL_RES + 'emojis/' + value.substr(4) : 'https://cdn.discordapp.com/emojis/' + value + '.webp?size=48&quality=lossless',
                    name: key,
                    emoji: key,
                    unicode: key
                });
            }
        });

        //add custom emojis to emojiKeyboard
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

.emojikb-categ .emojikb-emoji.selected, .emojikb-categ .emojikb-emoji.lazy {
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
            let urlWithGif = url.endsWith('.gif');
            let customEmojiGifCode = convertUrlToCustomEmojiGifCode(url, urlWithGif);
            if(customEmojiGifCode != null && isEmoji != urlWithGif)
            {
                let ret = (isEmoji ? addCustomEmojiToLocalStore(customEmojiGifCode) : addCustomGifToLocalStore(customEmojiGifCode));
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
            if(confirm('Do you want to delete custom emojis / gifs?'))
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

    function addCustomEmojiToLocalStore(newCustomEmoji)
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

    function removeCustomEmojiFromLocalStore(customEmoji)
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

    function loadCustomEmojisFromLocalStorage()
    {
        let json = localStorage.getItem('HHClubChatPlusPlus_CustomEmojis');
        if(json == null) json = '[]';
        return JSON.parse(json);
    }

    function saveCustomEmojisToLocalStorage(customEmojis)
    {
        localStorage.setItem('HHClubChatPlusPlus_CustomEmojis', JSON.stringify(customEmojis));
    }

    function addCustomGifToLocalStore(newCustomGif)
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

    function removeCustomGifFromLocalStore(customGif)
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

    function loadCustomGifsFromLocalStorage()
    {
        let json = localStorage.getItem('HHClubChatPlusPlus_CustomGifs');
        if(json == null) json = '[]';
        return JSON.parse(json);
    }

    function saveCustomGifsToLocalStorage(customGifs)
    {
        localStorage.setItem('HHClubChatPlusPlus_CustomGifs', JSON.stringify(customGifs));
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
            ['!thx', ['35hmBwYHYikAAAAC/the-office-bow.gif', 'xCQSK3wG0OQAAAAC/my-hero.gif', 'Qc9cm8By46YAAAAd/doggo-dog.gif']],
            ['!ty', '!thx'],
            ['!thanks', '!thx'],
            ['!whale', ['https://cdn.discordapp.com/attachments/344734413600587776/463933711193473044/Whale.png', 'Gb_N7yXyB-UAAAAC/marin-kitagawa-marin.gif', 'f_G-jdId4fkAAAAd/whale-gold.gif', 'id2Lsryg60cAAAAC/unusual-whales-unusual-whales-rain-money.gif']],
            ['!what', ['eAqD-5MDzFAAAAAC/mai-sakurajima-sakurajima-mai.gif', 'Q0yIxNX0L-kAAAAC/wait-what-what.gif']],
            ['!why', ['o2CYGlMLADUAAAAC/barack-obama-why.gif', 'OPbFPRevcv4AAAAC/ajholmes-why.gif', '1Vh0XBrPM7MAAAAC/why-whats-the-reason.gif', 'y0Up9A_bTPwAAAAd/nph-why.gif', 'KjJTBQ9lftsAAAAC/why-huh.gif']],
            ['!wtf', ['https://i.ytimg.com/vi/XjVKHZ_F4zo/maxresdefault.jpg']],
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
            [':happy_rin:', '953395143510224957'],
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

            [':energy:', '864645021561782332'],
            [':combativity:', '848991758301265990'],
            [':fisting:', ':combativity:'],
            [':kiss:', '860659467876302889'],
            [':league:', '860659427950460930'],
            [':worship:', '902508422988169226'],
            [':ticket:', '596905784160419876'],

            [':ymen:', '294927828972208128'],
            [':money:', ':ymen:'],
            [':koban:', '294927828682801153'],
            [':kobans:', ':koban:'],

            [':potion_endurance:', '948310353735987240'],
            [':potion_love:', '948310353828282408'],
            [':potion_lust:', '948310353979252786'],
            [':crystal:', '999279877834428416'],
            [':crystal_token:', ':crystal:'],

            [':shard:', '540690525238591518'],
            [':shards:', ':shard:'],

            [':flowers:', '860867149009780757'],
            [':book:', '923655294381359104'],
            [':spellbook:', ':book:'],

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

            [':ep:', '677981592706088982'],
            [':ep10:', '904111725299765268'],
            [':gp10:', '938587821755744316'],
            [':magazine:', '923655467140542544'],

            [':datingtoken:', '849076003882926100'],
            [':dating:', ':datingtoken:'],

            [':kk:', '915301903561265194'],
            [':kinkoid:', ':kk:'],

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
    ['Emojis', []]
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
        let closed = (!event.shiftKey && emojiKeyboard.customEmojiGifDeleteMode == 0);
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
            target = event.target.nodeName == "path" ? event.target.parentNode : event.target;
        } else target = event;
        $('#emojikb-leftlist>svg.selected').removeClass('selected');
        target.classList.add("selected");
        if (!stay) { // scroll to the corresponding category
            const categ = target.dataset.emojikb_categ;
            const targets = target.ownerDocument.querySelectorAll('div.emojikb-categname[data-emojikb_categ="' + categ + '"]');
            if (!targets[0]) return;
            targets[0].parentNode.scrollIntoView(true, { behavior: "instant" }); // let's not trigger hundreds of lazy loading
            targets[0].parentNode.parentNode.scrollTop++; // make sure the observator is triggered
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
                        url: "https://twemoji.maxcdn.com/v/13.0.1/72x72/" + emoji.unicode.replace(/ /g, '-').toLowerCase() + ".png",
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
            [SVG_HTML.custom, 'Emojis'],
            [SVG_HTML.custom, 'GIFs'],
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
            if(v[0] == SVG_HTML.custom)
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
            }
            categ_div.appendChild(categ_name);
            let emojis_sorted = (v[1] != 'Emojis' && v[1] != 'GIFs' ? this.emojis.get(v[1]).sort((a, b) => a.unicode.localeCompare(b.unicode)) : this.emojis.get(v[1])); //do not sort custom emojis / gifs
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
                if(v[1] != 'Emojis' && v[1] != 'GIFs') //no error handler for custom emojis / gifs
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
    custom: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/></svg>'
}
})();
