
/*

!!! IMPORTANT !!!

after player login event do this:

    ----> sendPlayerAll3DTextLabels(player);


*/

import * as alt from "alt-server";

export let textlabels = [];

alt.on("create3DTextLabel", create3DTextLabel);
export function create3DTextLabel(text, posX, posY, posZ, drawDistance) {
    textlabels.push({ text, posX, posY, posZ, drawDistance });

    alt.Player.all.forEach(player => {
        if(!player) return; //CHECK IF PLAYER LOGGED IN ???

        alt.emitClientRaw(player, "create3DTextLabel", text, posX, posY, posZ, drawDistance);
    });
}

export function sendPlayerAll3DTextLabels(player) {
    alt.emitClientRaw(player, "sendPlayerAll3DTextLabels", textlabels);
}

alt.on("update3DTextLabel", update3DTextLabel);
export function update3DTextLabel(labelID, text, posX, posY, posZ, drawDistance) {
    if(!textlabels[labelID]) return;

    textlabels[labelID].text = text;
    textlabels[labelID].posX = posX;
    textlabels[labelID].posY = posY;
    textlabels[labelID].posZ = posZ;
    textlabels[labelID].drawDistance = drawDistance;

    alt.Player.all.forEach(player => {
        if(!player) return; //CHECK IF PLAYER LOGGED IN ???

        alt.emitClientRaw(player, "update3DTextLabel", labelID, text, posX, posY, posZ, drawDistance);
    });
}

alt.on("destroy3DTextLabel", destroy3DTextLabel);
export function destroy3DTextLabel(labelID) {
    if(!textlabels[labelID]) return;

    textlabels.splice(labelID, 1);

    alt.Player.all.forEach(player => {
        if(!player) return; //CHECK IF PLAYER LOGGED IN ???

        alt.emitClientRaw(player, "destroy3DTextLabel", labelID);
    });
}

alt.on("resourceStart", () => {
    create3DTextLabel("Test #1", 307.5290832519531, -1547.805908203125, 29.330556869506836, 10.0);
});