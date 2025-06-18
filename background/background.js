browser.runtime.onInstalled.addListener(defaultSettingsChecker);

function defaultSettingsChecker()
{
    const defaultSettings = {
        enableChatroomFooterChanges : true,

        enableAutoColorNicknamesList: true,
        colorForNicknameList: "#ff2d2d",

        enableHostBorder: true,
        colorForHost: "#ce58fd",

        enableModBorder: true,
        colorForMod: "#54d6fd",

        enableVerifiedBorder: true,
        colorForVerified: "#20fc04",

        enableVIPBorder: true,
        colorForVIP: "#ffb404",

        enableOGBorder: true,
        colorForOG: "#02b5af",

        enableFounderBorder: true,
        colorForFounder: "#d89404"        
    };

    const defaultNicknames = ["Akagir"];

    browser.storage.local.get("extensionSettings",(data)=>{
        if ((!data.extensionSettings)&&(!data.nicknames)) {
            // Store default settings if not already set
            browser.storage.local.set({
                extensionSettings: defaultSettings,
                nicknames: defaultNicknames
            },()=>{
                    console.log("Default settings applied:", defaultSettings,defaultNicknames);
                });
        }
        else
        console.log("Default settings already exists!");
    });
}