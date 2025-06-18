// Checking page loading state
document.onreadystatechange = function () {
    if (document.readyState === "complete")
        startExtension();
    else if (document.readyState === "loading" || 
                document.readyState === "interactive")
        console.log("Website loading...");
    else
        console.log("State change is stuck!");
};

let lastUrl = location.href;
function handleURLChange(){
    if (location.href !== lastUrl){
        console.log("URL changed!");
        lastUrl = location.href;
        startExtension();
    }
}

// Listen for browser navigation events
window.addEventListener("popstate", () => {
    console.log("popstate event fired");
    handleURLChange();
});
  
window.addEventListener("pushstate", () => {
    console.log("pushstate event fired");
    handleURLChange();
});

// Detect manual URL changes
setInterval(()=>{
    if (location.href !== lastUrl){
        console.log("URL changed via script!");
        lastUrl = location.href;
        startExtension();
    }
},300000);

// Get locally stored data
function getAllData(callback)
{
    browser.storage.local.get({ extensionSettings: {}, nicknames: [] },(data)=>{
        callback(data);
    });
}

// Start extonsion for DOM
function startExtension()
{
    console.log("kickImprover started working!");
    getAllData((data)=>{

        console.log("Current data:",data);

        const messageObserver = new MutationObserver((messagesList)=>{
            messagesList.forEach((message)=>{
                if(message)
                    checkNewMessage(message,data);
            })
        })

        const channelChatroom = document.getElementById("channel-chatroom");
        if(channelChatroom){
            if(data.extensionSettings.enableChatroomFooterChanges)
                footerChange(channelChatroom);

            const messageHolder = channelChatroom.querySelector(".no-scrollbar");
            if(messageHolder)
                messageObserver.observe(messageHolder,config);
        }
    });
}

function footerChange(channelChatroom)
{
    const chatroomFooter = channelChatroom.querySelector("#chatroom-footer");
    if(chatroomFooter){

        const innerFooter = chatroomFooter.querySelector(".z-common.flex");
        if(innerFooter){
            innerFooter.classList.replace("lg:px-5","lg:px-4");

            const editorInput = innerFooter.querySelector(".editor-input");
            if(editorInput){
                editorInput.style.minHeight = "auto";
            }
        }
    }
}

// Get inner group of lastly added message
function checkNewMessage(message,data)
{
    let lastMessage = message.addedNodes[message.addedNodes.length-1];
    if(lastMessage){
        if(!lastMessage.classList.contains("message-checked")){
            // console.log("Checking lastMessage!");
            lastMessage.classList.add('message-checked');
            let innerGroup = lastMessage.querySelector(".break-words");
            if(innerGroup)
                checkInnerGroup(innerGroup,data);
        }
    }   
}

// Check inner group
function checkInnerGroup(innerGroup,data)
{
    let senderGroup = innerGroup.querySelector(".flex-nowrap");
    if(senderGroup){
        let senderNick = senderGroup.querySelector(".inline").getAttribute("title");
        if(data.nicknames.length > 0){
            // Check if sender nick is included in nickname data
            if(data.nicknames.includes(senderNick)){
                let senderColor = senderGroup.querySelector(".inline").style.color;
                
                if(data.extensionSettings.enableAutoColorNicknamesList)
                    addBorderToGroup(innerGroup,senderColor);
                else
                    addBorderToGroup(innerGroup,data.extensionSettings.colorForNicknamesList);
            }
            else
                checkSenderBadges(senderGroup,innerGroup,data);
        }
        else
            checkSenderBadges(senderGroup,innerGroup,data);
    }
}

function checkSenderBadges(senderGroup,innerGroup,data)
{
    // console.log("Checking senderBadges!");
    let senderSVGChecked = false;
    let senderSVGList = senderGroup.querySelectorAll("svg");
    senderSVGList.forEach((senderSVG)=>{
        if(senderSVG && !senderSVGChecked){
            let senderPATH = senderSVG.querySelector("path");
            if(senderPATH){
                // Add border to message by sender badge
                switch(senderPATH.getAttribute('fill'))
                {
                    case 'url(#HostBadgeA)':                        //for Hosts
                        if(data.extensionSettings.enableHostBorder)
                            addBorderToGroup(innerGroup,data.extensionSettings.colorForHost);
                        break;
                    case '#00C7FF':                                 //for Mods
                        if(data.extensionSettings.enableModBorder)
                            addBorderToGroup(innerGroup,data.extensionSettings.colorForMod);
                        break;
                    case '#1EFF00':                                 //for Verified
                        if(data.extensionSettings.enableVerifiedBorder)
                            addBorderToGroup(innerGroup,data.extensionSettings.colorForVerified);
                        break;
                    case 'url(#VIPBadgeA)':                         //for VIPs
                        if(data.extensionSettings.enableVIPBorder)
                            addBorderToGroup(innerGroup,data.extensionSettings.colorForVIP);
                        break;
                    case 'url(#OGBadgeB)':                          //for OGs
                        if(data.extensionSettings.enableOGBorder)
                            addBorderToGroup(innerGroup,data.extensionSettings.colorForOG);
                        break;
                    case 'url(#FounderBadgeB)':                     //for Founders
                    if(data.extensionSettings.enableFounderBorder)
                        addBorderToGroup(innerGroup,data.extensionSettings.colorForFounder);
                        break;
                }
                senderSVGChecked = true;
            }
        }
    });
}


function addBorderToGroup(innerGroup,color)
{
    innerGroup.style.border = "1px solid " + color;
}

const config = {
    attributes: true,       // Monitor attribute changes
    childList: true,        // Monitor addition/removal of child elements
    subtree: true,          // Monitor changes in descendant nodes
    characterData: true,    // Monitor changes to text content
};