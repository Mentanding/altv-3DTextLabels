import alt from "alt-client";
import * as native from "natives";

alt.loadRmlFont("./fonts/roboto_medium.ttf", "sampfont", false, true);

const document = new alt.RmlDocument("./textlabel.rml");
const container = document.getElementByID("textlabelContainer");
document.show();

let textlabels = [];

alt.on("create3DTextLabel", create3DTextLabel);
alt.onServer("create3DTextLabel", create3DTextLabel);
function create3DTextLabel(text, posX, posY, posZ, drawDistance) {
    alt.log(`[create3DTextLabel] posX: ${posX}, posY: ${posY}, posZ: ${posZ}, drawDistance: ${drawDistance}`);

    const label = document.createElement("div");
    label.addClass("textlabel");
    container.appendChild(label);

    textlabels.push({ label, text, posX, posY, posZ, drawDistance });
}

alt.onServer("sendPlayerAll3DTextLabels", sendPlayerAll3DTextLabels);
function sendPlayerAll3DTextLabels(data) {
    for(let i = 0; i < data.length; i++) {
        create3DTextLabel(
            data[i].text,
            data[i].posX,
            data[i].posY,
            data[i].posZ,
            data[i].drawDistance
        );
    }
}

alt.onServer("update3DTextLabel", update3DTextLabel);
function update3DTextLabel(arrayID, text, posX, posY, posZ, drawDistance) {
    alt.log(`[update3DTextLabel] arrayID: ${arrayID}, text: ${text}, posX: ${posX}, posY: ${posY}, posZ: ${posZ}, drawDistance: ${drawDistance}`);

    if(arrayID > textlabels.length) return;
    
    textlabels[arrayID].text = text;
    textlabels[arrayID].posX = posX;
    textlabels[arrayID].posY = posY;
    textlabels[arrayID].posZ = posZ;
    textlabels[arrayID].drawDistance = drawDistance;
}

alt.onServer("destroy3DTextLabel", destroy3DTextLabel);
function destroy3DTextLabel(arrayID) {
    alt.log(`[destroy3DTextLabel] arrayID: ${arrayID}`);

    if(arrayID > textlabels.length) return;

    container.removeChild(textlabels[arrayID].label);
    textlabels[arrayID].label.destroy();

    textlabels.splice(arrayID, 1);
}

alt.everyTick(() => {
    for (const [arrayID, textlabel] of textlabels.entries()) {

        const x = textlabel.posX;
        const y = textlabel.posY;
        const z = textlabel.posZ;

        const playerDist = distance(alt.Player.local.pos, new alt.Vector3(x, y, z));

        if (native.isSphereVisible(x, y, z, 0.0099999998)
            && playerDist <= textlabel.drawDistance) {

            const screen = alt.worldToScreen(x, y, z);

            //textlabel
            textlabel.label.removeClass("hide");
            textlabel.label.setProperty("left", `${screen.x - (parseInt(textlabel.label.offsetWidth) / 2)}px`);
            textlabel.label.setProperty("top", `${screen.y}px`);
            textlabel.label.innerRML = `[debug] labelID: ${arrayID}<br/><br/>${textlabel.text}`;
        } else {
            textlabel.label.addClass("hide");
        }
    }
});

function distance(vector1, vector2) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('AddVector => vector1 or vector2 is undefined');
    }
    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2));
}