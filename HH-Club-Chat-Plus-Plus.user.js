// ==UserScript==
// @name         HH Club Chat++
// @version      0.1
// @description  Upgrade Club Chat with various features and bug fixes
// @author       -MM-
// @match        https://*.hentaiheroes.com/
// @run-at       document-end
// @namespace    https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus
// @updateURL    https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js
// @downloadURL  https://github.com/HH-GAME-MM/HH-Club-Chat-Plus-Plus/raw/main/HH-Club-Chat-Plus-Plus.user.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hentaiheroes.com
// @grant        GM_info
// ==/UserScript==

(function() {
    //TODO
    //empty

    //definitions
    'use strict';
    /*global ClubChat,club_tabs*/

    console.log('HH Club Chat++ Script v' + GM_info.script.version);

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
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.active_light {display:inline-block;width:.75rem;height:.75rem;margin:0px 4px 4px 11px;transform:rotate(45deg);border:1px solid #000;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info span.chat-msg-sender span.HHCCPlusPlus {color:white;font-size:20px;line-height:1;margin:0px 2px 0px 5px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info {pointer-events: none;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-info * {pointer-events: auto;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt a {color:white;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt img {max-width:200px;max-height:100px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt img.emoji {max-width:24px;max-height:24px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh {width:300px;background-color:#2f3136;padding:7px;border-radius:7px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.left {float:left;width:70%;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.right {float:right;width:30%;text-align:right;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh div.clear {clear:both;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.hh img {width:80px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses {display:inline-block;background-color:#2f3136;padding:7px;border-radius:7px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses a {padding:0px 10px 0px 10px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt div.poses span {padding:0px 10px 0px 10px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping {background-color:#4e4d73;padding:0px 3px 0px 3px;border-radius:3px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping-invalid {background-color:#4e4d73;padding:0px 3px 0px 3px;border-radius:3px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.ping-invalid:after {color:#4e4d73;background-image:url("https://hh2.hh-content.com/ic_new.png");background-size:8px auto;background-repeat:no-repeat;background-position:1px 1px;content:"_";}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler {background:#202225;padding:0px 3px 0px 3px;border-radius:3px;color:transparent;cursor:pointer;user-select:none;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler * {background:#202225;padding:0px;border-radius:0px;color:transparent;cursor:pointer;user-select:none;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler img {padding:0px 3px 0px 3px;border-radius:3px;max-width:1px;max-height:1px;filter:opacity(0%);}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible {background:#4a4d53;padding:0px 3px 0px 3px;border-radius:3px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible * {background:#4a4d53;padding:0px;border-radius:0px;}');
    css.sheet.insertRule('div.chat-msg div.chat-msg-txt span.spoiler-visible img {padding:0px 3px 0px 3px;border-radius:3px;}');
    css.sheet.insertRule('input.club-chat-input-custom {width:100%;height:38px;color:#fff;font-size:16px;padding-left:12px;border:1px solid #ffa23e;background-color:rgba(0,0,0,.3);box-shadow:0 2px 0 #c61f52,0 0 13px rgba(159,7,58,.6),0 0 13px rgba(159,7,58,.95);border-radius:4px;font-family:Tahoma,Helvetica,Arial,sans-serif;padding-right:40px;}');
    css.sheet.insertRule('button.club-chat-send-custom {position:absolute;top:7px;right:1px;border:none;background-color:transparent;outline:0;cursor:pointer;}');

    //css members online/offline
    let cssOnline = document.createElement('style');
    document.head.appendChild(cssOnline);

    //chat variables
    const HHCLUBCHATPLUSPLUS_INDICATOR = '\u200D';
    let playerName = null;
    let playerNamePing = null;
    let clubLeaderPlayerId = -1;
    let pingValidList = [];
    let pingMessageCount = 0;
    let lastMsgTimestamp = 0;
    let lastMsgTimestampSeen = loadLastMsgTimestampSeen(); //we cant use ClubChat.lastSeenMessage because its not available when we receive the first messages
    let mapGIFs = getMapGIFs();
    let mapEmojis = getMapEmojis();

    //observe chat messages
    const observerMessages = new MutationObserver((mutations, observer) => {

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
        clubLeaderPlayerId = ClubChat.chatVars.CLUB_INFO.leader_id;

        //get pingValidList
        if(pingValidList.length == 0 && document.querySelectorAll('div.chat-members-list div.member p.name-member').length != 0)
        {
            pingValidList.push('@club');
            document.querySelectorAll('div.chat-members-list div.member p.name-member').forEach(e => pingValidList.push('@' + e.innerHTML.toLowerCase().replaceAll(' ', '_')));
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
                if(sentByHHCCPlusPlus) html = html.substr(0, html.length - 1);
                let htmlLC = html.toLowerCase();

                //DEBUG
                /*if(html == 'x')
                {
                    html = ':kek: :pikaponder: :am: :koban: :energy: :cordy: :cordys: :datingtoken: :blackgem: :black:';
                }
                else if(html == 'x')
                {
                    html = 'https://www.google.com';
                }
                else if(html == 'x')
                {
                    html = '/spoiler :kek: :pikaponder:';
                }
                else if(html == 'x')
                {
                    html = '!hh 797015676';
                }
                else if(html == 'x')
                {
                    html = '!gm @mm';
                }
                else if(html == 'x')
                {
                    html = '@MMM @MM test ping 1';
                }
                else if(html == 'x')
                {
                    html = '*correct';
                }
                else if(html == 'x')
                {
                    html = '*it al ic* **b o l d** __under line__ ~~strike through~~';
                    //html = '*it al ic **b o l d*** __under line ~~strike through~~__';
                }
                htmlLC = html.toLowerCase();*/

                //update and save last (seen) message timestamp in localstore
                lastMsgTimestamp = msgIdTimestampMs;
                if(chatWindowVisible && lastMsgTimestampSeen < lastMsgTimestamp)
                {
                    lastMsgTimestampSeen = lastMsgTimestamp;
                    saveLastMsgTimestampSeen();
                }

                //change the nickname color: club leader red, members blue
                let nodeSpanMsgSender = node.querySelector('div.chat-msg-info span.chat-msg-sender');
                nodeSpanMsgSender.setAttribute('style', 'color:' + (msgIdPlayerId == clubLeaderPlayerId ? '#f33c3d' : '#8a8ae6'));

                //add the online icon
                let nodeSpanMsgSender_active_light = document.createElement('span');
                nodeSpanMsgSender_active_light.setAttribute('class', 'active_light');
                nodeSpanMsgSender_active_light.setAttribute('title', 'Online Status');
                nodeSpanMsgSender.appendChild(nodeSpanMsgSender_active_light);

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

                if(htmlLC == '!help')
                {
                    //did THIS user invoke the command !help ?
                    if(msgIdPlayerId == playerId)
                    {
                        forceScrollDown = true;
                        let gifs = '';
                        mapGIFs.forEach((value, key) => { if(value.length == 1) gifs += key + ' '; });
                        let gifsRandom = '';
                        mapGIFs.forEach((value, key) => { if(value.length != 1) gifsRandom += key + ' '; });
                        let emojis = '';
                        mapEmojis.forEach((value, key) => { emojis += key + ' '; });
                        htmlNew.push({ isValid: true, value: '!help = show this help (hidden for other script users)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">PING</span><br/>' +
                                      '@club = ping all club members<br/>' +
                                      '@<span style="font-style:italic;">&lt;membername&gt;</span> = ping a club member<br/>' +
                                      'Note 1: Club members will receive a notification outside of the chat, when the chat is not open<br/>' +
                                      'Note 2: Replace spaces with underscores. E.g. to ping John Doe write @John_Doe<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">SPOILER</span><br/>' +
                                      '/spoiler <span style="font-style:italic;">&lt;text / images&gt;</span> = hide text and images<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">LINKS / IMAGES / GIRL POSES</span><br/>' +
                                      'Links and images are clickable and open in a new tab. Post a URL to an image or a girl pose and it will be embedded in the chat.<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">COMMANDS</span><br/>' +
                                      '!hh <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link for a girl (HH++ required, EN only)<br/>' +
                                      '!poses <span style="font-style:italic;">&lt;girl name / girl id&gt;</span> = post a wiki link and all poses of a girl (HH++ required, EN only)<br/>' +
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
                                      'Note: Only one GIF allowed at the start of your post. It is possible to add more things (e.g. ping)<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">EMOJIS</span><br/>' +
                                      'The following emojis are available: ' + emojis + '<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">MISCELLANEOUS</span><br/>' +
                                      '- The nickname color is changed. The Club Leader is red and all members are blue<br/>' +
                                      '- Online/Offline status added behind the nickname (with auto refresh)<br/>' +
                                      '- ++ added behind the nickname (indicates who is using this script)<br/>' +
                                      '- Chat window remains in its position and size<br/>' +
                                      '- Auto Scrolling fixed. It scrolls only if the scrollbar is close to the bottom<br/>' +
                                      '- Bug Fixes: "Idle/Disconnect", "Chat disabled until click a menu", "Firefox: Member list outside the window"<br/>' +
                                      '- Avatars are a bit bigger<br/>' +
                                      '<br/>' +
                                      '<span style="font-weight:bold;">CREDITS</span><br/>' +
                                      'Script coded by -MM- and tested in Mozilla Firefox (Desktop), Google Chrome (Desktop & Android)' });
                    }
                    else
                    {
                        //hide other players !help
                        node.setAttribute('style', 'display:none;');
                    }
                }
                else if(htmlLC.startsWith('!hh ') && htmlLC.length > 4)
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
                        let url = girlName != 'Unknown Girl' ? 'https://harem-battle.club/wiki/Harem-Heroes/HH:' + girlName.replaceAll(' ','-').replaceAll('.','') : null;
                        htmlNew.push({ isValid: true, value: '<div class="hh"><div class="left">' + (url != null ? '<a href="' + url + '" target="_blank">' + girlName + '</a>' : 'Girl ID: ' + girlId) + '<br/><br/>' + (url != null ? 'All' : 'No') + ' infos about her!</div><div class="right">' + (url != null ? '<a href="' + url + '" target="_blank">' : '') + '<img title="' + girlName + '" src="https://hh2.hh-content.com/pictures/girls/'+girlId+'/ico0-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">' + (url != null ? '</a>' : '') + '</div><div class="clear"></div></div>' + (url != null ? '<br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
                    }
                }
                else if(htmlLC.startsWith('!poses ') && htmlLC.length > 7)
                {
                    let param1 = html.substr(7).trim();
                    let girlId = -1;
                    let girlName = null;
                    let girlGrade = 0;

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
                        let htmlPoses = '';
                        if(girlGrade < 1) girlGrade = 6; //use 6 girl poses if we have the girl but no girl grade
                        for(let k = 0; k <= girlGrade; k++)
                        {
                            htmlPoses += '<a href="https://hh2.hh-content.com/pictures/girls/' + girlId + '/ava' + k + '-1200x.webp?v=5" target="_blank"><img title="Pose ' + k + '" src="https://hh2.hh-content.com/pictures/girls/' + girlId + '/ava' + k + '-300x.webp?v=5" onload="ClubChat.resizeNiceScrollAndUpdatePosition()" onerror="this.parentNode.style.display=\'none\'"></a>';
                        }

                        let url = girlName != 'Unknown Girl' ? 'https://harem-battle.club/wiki/Harem-Heroes/HH:' + girlName.replaceAll(' ','-').replaceAll('.','') : null;
                        htmlNew.push({ isValid: true, value: '<div class="poses">' + (url != null ? '<a href="' + url + '" target="_blank">' + girlName + '</a>' : '<span>Girl ID: ' + girlId) + '</span><br/><br/>' + htmlPoses + '</div>' + (url != null ? '<br/><br/><a href="' + url + '" target="_blank">' + url + '</a>' : '') });
                    }
                }
                else if(htmlLC.startsWith('/plain '))
                {
                    htmlNew.push({ isValid: true, value: html.substr(7) });
                }
                else if(htmlLC == '/dice')
                {
                    htmlNew.push({ isValid: true, value: '/dice<br/>Result: You rolled a ' + (msgIdTimestampMs % 6 + 1) });
                }
                else
                {
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
                    //TODO add || as spoiler
                    for(let k = 0; k < htmlSplits.length; k++)
                    {
                        let word = htmlSplits[k];
                        let wordLC = word.toLowerCase();

                        //gifs (only allowed as first "word" to allow putting more things after it, e.g. ping)
                        if(k == 0 && wordLC.startsWith('!') && mapGIFs.has(wordLC))
                        {
                            let imgSrcArray = mapGIFs.get(wordLC);
                            let imgSrc = imgSrcArray[msgIdTimestampMs % imgSrcArray.length];
                            htmlNew.push({ isValid: true, value: '<img src="' + (imgSrc.startsWith('https://') ? imgSrc : 'https://c.tenor.com/' + imgSrc) + '" title="' + htmlLC + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()">' });
                        }
                        else if(wordLC.startsWith('https://')) //links / images
                        {
                            //is it an image?
                            if( wordLC.endsWith('.gif') || wordLC.endsWith('.jpg') || wordLC.endsWith('.jpeg') || wordLC.endsWith('.png') || wordLC.endsWith('.webp') ||
                               (wordLC.length > 8 && wordLC.lastIndexOf('.webp?v=') == wordLC.length - 9)
                              )
                            {
                                htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank"><img src="' + word + '" onload="ClubChat.resizeNiceScrollAndUpdatePosition()"></a>' });
                            }
                            else //its a link
                            {
                                htmlNew.push({ isValid: true, value: '<a href="' + word + '" target="_blank" onclick="return confirm(\'Do you really want to open this link?\')">' + word + '</a>' });
                            }
                        }
                        else if(word.startsWith('@') && word.length != 1) //ping
                        {
                            //ignore one comma, one dot, one exclamation mark or one question mark at the end
                            if([',', '.', '!', '?'].includes(wordLC[wordLC.length - 1])) wordLC = wordLC.substr(0, wordLC.length - 1);

                            //shortform of nicknames for club "Hērōēs Prāvī Forī [EN]"
                            if(msgIdClubId == 1898)
                            {
                                switch(wordLC)
                                {
                                    case '@mm': wordLC = '@-mm-'; break;
                                    case '@holy': wordLC = '@holymolly'; break;
                                    case '@epic': wordLC = '@epicbacon'; break;
                                    case '@finder': wordLC = '@finderkeeper'; break;
                                    case '@finds': wordLC = '@finderkeeper'; break;
                                    case '@yoyo': wordLC = '@yoyowhan'; break;
                                    case '@hvj': wordLC = '@hvjkzv'; break;
                                    case '@mugzy': wordLC = '@mugzylol'; break;
                                    case '@chuck':
                                    case '@maximus':
                                    case '@master': wordLC = '@master_maximus'; break;
                                    case '@mars': wordLC = '@marsome'; break;
                                    case '@ckiller': wordLC = '@cuntkiller'; break;
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
                        else if(wordLC.length > 2 && wordLC.startsWith(':') && wordLC.endsWith(':') && mapEmojis.has(wordLC)) //emojis
                        {
                            //Note: we dont need onload="ClubChat.resizeNiceScrollAndUpdatePosition()" bc emojis are small
                            htmlNew.push({ isValid: true, value: '<img class="emoji" src="https://cdn.discordapp.com/emojis/' + mapEmojis.get(wordLC) + '.webp?size=24&quality=lossless" title="' + wordLC + '">' });
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

                            //add the word
                            if(cutterL != 0 || cutterR != 0)
                            {
                                htmlNew[wordIndex].value = word.substr(cutterL, word.length - cutterL - cutterR);
                            }
                            else
                            {
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
                        htmlNew.unshift({ isValid: true, value: '<span class="spoiler" title="click to reveal spoiler" onClick="this.setAttribute(\'class\',\'spoiler-visible\');this.setAttribute(\'title\',\'\')">' });
                        htmlNew.push({ isValid: true, value: '</span>' });
                    }
                }

                if(htmlNew.length != 0)
                {
                    //add new html
                    let htmlNewStr = '';
                    htmlNew.forEach(e => { htmlNewStr += e.isValid ? e.value : e.invalidValue });
                    node.lastElementChild.innerHTML = htmlNewStr;

                    //scrolling
                    ClubChat.resizeNiceScrollAndUpdatePosition();
                    if(forceScrollDown) scrollDown();
                }
            }
        }
    });
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

                    //scroll down in the chat when chat turns visible
                    scrollDown();
                }
            }
            else if(mutations[i].attributeName == 'style')
            {
                //chat moved/resized
                saveLastChatWindowPositionAndSize(mutations[i].target);
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
                    clubChatDisconnected = 1;
                }
            }
        }

        //scroll down in the chat after init (or disconnect), if the scrollbar is at the top
        if(clubChatDisconnected == 0 && ClubChat.$msgHolder[0].scrollTop == 0)
        {
            scrollDown();
        }
        //if the chat disconnects after init, we try to reconnect
        else if(clubChatDisconnected == 1 && ClubChat.hasInit && !ClubChat.isConnected)
        {
            ClubChat.hasInit = false;
            fixClubChat();
        }
    });
    observerSendMsg.observe(document.querySelector('input.club-chat-input'), { attributes:true });
    observerSendMsg.observe(document.querySelector('button.club-chat-send'), { attributes:true });

    //iFrame onload event
    document.getElementById("hh_game").onload = function() {

        //get iFrame
        let iFrame = getIFrame();

        let cssIFrame = iFrame.createElement('style');
        iFrame.head.appendChild(cssIFrame);
        cssIFrame.sheet.insertRule('#chat_btn .chat_mix_icn::after {content:"++";position:absolute;width:auto;bottom:-14px;right:-8px;text-shadow:0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000,0 0 1px #000;-moz-transform:rotate(0.05deg);font-size:26px;}');

        //do we still have new ping messages? if yes, display the ping notification box again
        if(pingMessageCount != 0)
        {
            let pingNotificationBox = getPingNotificationBox(iFrame);
            pingUpdateText(pingNotificationBox);
            pingVisible(pingNotificationBox);
        }
    };

    function createNewInputAndSendButton()
    {
        //create new input and send button
        let container = document.querySelector('div.send-block-container');
        let input = document.createElement("input");
        input.setAttribute('class', 'club-chat-input-custom');
        if(document.querySelector('input.club-chat-input').getAttribute('disabled') != null) input.setAttribute('disabled', 'disabled');
        input.addEventListener("keyup", onInputKeyUp_HHCCPlusPLus);
        container.appendChild(input);

        let btnSend = document.createElement('button');
        btnSend.setAttribute('class', 'club-chat-send-custom');
        btnSend.setAttribute('maxlength', '499'); //real maxlength is 500 (499 + HHCLUBCHATPLUSPLUS_INDICATOR = 500)
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
                let input = document.querySelector('input.club-chat-input');
                input.value = inputCustom.value + HHCLUBCHATPLUSPLUS_INDICATOR;
                inputCustom.value = '';
                ClubChat.send_msg();
            }
        }

        function onInputKeyUp_HHCCPlusPLus(evt)
        {
            if (evt.key == 'Enter') send_msg_HHCCPlusPLus();
        }
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

                //did it work?
                if(ClubChat.hasInit)
                {
                    //update club id to prevent wrong call to unPinMsg()
                    ClubChat.club_id = ClubChat.chatVars.CLUB_INFO.id_club;

                    //bug fix for Mozilla Firefox: The member list is outside the window at the first click
                    if(typeof ClubChat.hasFirstInit == 'undefined')
                    {
                        fixTabs_MozillaFirefox();
                        ClubChat.hasFirstInit = true;
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
            if (ClubChat.$msgHolder[0].scrollTop > getScrollTopMax() - 300)
            {
                scrollDown();
            }
        }

        //add new scroll function
        ClubChat.resizeNiceScrollAndUpdatePosition = function() {

            ClubChat.$msgHolder.getNiceScroll().resize();
            ClubChat.updateScrollPosition();
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

    function getIFrame()
    {
        let iFrame = document.getElementById("hh_game");
        iFrame = (iFrame.contentWindow || iFrame.contentDocument);
        if (iFrame.document) iFrame = iFrame.document;
        return iFrame;
    }

    function getPingNotificationBox(iFrame)
    {
        let pingNotificationBox = iFrame.getElementById('ping');
        if(pingNotificationBox == null)
        {
            //create ping message box
            let cssIFrame = iFrame.createElement('style');
            iFrame.head.appendChild(cssIFrame);
            cssIFrame.sheet.insertRule('#chat_btn div.ping {display:none;position:absolute;top:' + (isMobile() ? 70 : 45) + 'px;left:0px;width:150px;border:1px solid #ffb827;border-radius:15px;background-color:rgba(32, 3, 7, 0.7);}');
            cssIFrame.sheet.insertRule('#chat_btn div.visible {display:block !important;}');
            cssIFrame.sheet.insertRule('#chat_btn div.ping div {padding:5px 10px 5px 10px;text-align:center;font-size:14px;}');
            cssIFrame.sheet.insertRule('header {z-index:21 !important;}'); //TODO doesnt work for pachinko

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
            let nameLC = name.toLowerCase();
            for (let [key, value] of girlDictionary) if(value.name.toLowerCase() == nameLC) return key;
        }
        return -1;
    }

    function getGirlGradeById(id, girlDictionary)
    {
        return girlDictionary != null && girlDictionary.has(id.toString()) ? girlDictionary.get(id.toString()).grade : -1;
    }

    function getHHPlusPlusGirlDictionary()
    {
        let girlDictJSON = localStorage.getItem('HHPlusPlusGirlDictionary');
        return girlDictJSON != null ? new Map(JSON.parse(girlDictJSON)) : new Map();
    }

    function isMobile()
    {
        const {is_mobile, is_tablet} = window;
        return is_mobile && is_mobile() || is_tablet && is_tablet();
    }

    function strIsInt(s)
    {
        if (typeof s != 'string') return false
        return !isNaN(s) && !isNaN(parseInt(s));
    }

    function getMapGIFs()
    {
        return new Map([
            ['!moar', ['dStuVKgo6kwAAAAC/crumch-game-grumps.gif', 'Ft71uoGyHLEAAAAC/cat-moar.gif', 'XnYJ-WoYGyMAAAAC/ln_strike-kylo-ren.gif']],
            ['!both', ['odyVsZbC-OYAAAAC/why-not-both-why-not.gif', 'ZjqPAZpKWAUAAAAC/the-road-to-el-dorado-both.gif']],
            ['!heyhey', ['iOG-xvGrcVQAAAAC/hayasaka-kaguya.gif']],
            ['!hehe', ['s6axyeNl4HMAAAAC/fate-ubw.gif']],
            ['!gm', ['YnY4gUjy8JQAAAAC/fate-stay-night-rin-tohsaka.gif']],
            ['!gn', ['n6xhcPW4zDcAAAAC/saber-goodnight.gif', 'AeCpJ0xNKKcAAAAC/anime-foodwars.gif']],
            ['!sad', ['Up7hRFmFY9AAAAAC/anime-sad-anime-pout.gif']],
            ['!doit', ['NZXtIRvja5cAAAAC/doit-shialabeouf.gif']],
            ['!dejavu', ['CqoEATCG-1wAAAAC/déjàvu-drift.gif']],
            ['!wtf', ['https://i.ytimg.com/vi/XjVKHZ_F4zo/maxresdefault.jpg']],
            ['!whale', ['https://cdn.discordapp.com/attachments/344734413600587776/463933711193473044/Whale.png']],
            ['!new', ['C52JpqHPWcYAAAAC/friends-phoebe.gif']],
            ['!why', ['o2CYGlMLADUAAAAC/barack-obama-why.gif', 'OPbFPRevcv4AAAAC/ajholmes-why.gif', '1Vh0XBrPM7MAAAAC/why-whats-the-reason.gif', 'y0Up9A_bTPwAAAAd/nph-why.gif', 'KjJTBQ9lftsAAAAC/why-huh.gif']],
            ['!legit', ['JwI2BNOevBoAAAAC/sherlock-martin-freeman.gif']],
            ['!rng', ['https://imgs.xkcd.com/comics/random_number.png', 'c6drTKdM9ZEAAAAS/rng-excalibur.gif', 'mACda5RzcAcAAAAd/destiny.gif']],
            ['!gz', ['xDHCe07zrocAAAAC/congrats-minions.gif', '2Di8n4U2wJUAAAAC/yay-congrats.gif']],
            ['!thx', ['35hmBwYHYikAAAAC/the-office-bow.gif', 'xCQSK3wG0OQAAAAC/my-hero.gif']],
            ['!fail', ['sAdlyyKDxogAAAAC/bart-simpson-the-simpsons.gif', 'FOzbM2mVKG0AAAAC/error-windows-xp.gif']],
        ]);
    }

    function getMapEmojis()
    {
        return new Map([
            [':kek:', '588599124312457217'],
            [':pikaponder:', '862672993720336394'],

            [':energy:', '864645021561782332'],
            [':combativity:', '848991758301265990'],
            [':fisting:', '848991758301265990'],
            [':kiss:', '860659467876302889'],
            [':league:', '860659427950460930'],
            [':worship:', '902508422988169226'],
            [':ticket:', '596905784160419876'],

            [':ymen:', '294927828972208128'],
            [':money:', '294927828972208128'],
            [':koban:', '294927828682801153'],

            [':flowers:', '860867149009780757'],
            [':spellbook:', '923655294381359104'],
            [':book:', '923655294381359104'],

            [':kk:', '915301903561265194'],
            [':kinkoid:', '915301903561265194'],

            [':sandalwood:', '917383948408086529'],
            [':perfume:', '917383948408086529'],
            [':memories:', '917383948554862632'],
            [':atm:', '917383948554862632'],
            [':ginseng:', '917383948387115018'],
            [':cordy:', '917383948512919552'],
            [':cordys:', '917383948512919552'],
            [':cordyceps:', '917383948512919552'],
            [':am:', '917383948496154675'],
            [':allmastery:', '917383948496154675'],

            [':ep:', '677981592706088982'],
            [':ep10:', '904111725299765268'],
            [':gp10:', '938587821755744316'],
            [':magazine:', '923655467140542544'],

            [':dating:', '849076003882926100'],
            [':datingtoken:', '849076003882926100'],

            [':blackgem:', '910701075361845288'],
            [':redgem:', '910701075420557412'],
            [':greengem:', '910701075550576720'],
            [':orangegem:', '910701075181469737'],
            [':yellowgem:', '910701075852591144'],
            [':bluegem:', '910701075345068034'],
            [':whitegem:', '910701075672232016'],
            [':purplegem:', '910701077568040990'],
            [':allgem:', '918072869043458048'],

            [':rainbow:', '901254800690278491'],
            [':balanced:', '901254800690278491'],
            [':black:', '901255133004976149'],
            [':red:', '901254872429637682'],
            [':green:', '901254909276602418'],
            [':orange:', '901254970542788628'],
            [':yellow:', '901255043871830016'],
            [':blue:', '901255091665895424'],
            [':white:', '901255190433370192'],
            [':purple:', '901255233773137991'],
        ]);
    }
})();
