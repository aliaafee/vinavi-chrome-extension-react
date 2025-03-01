chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCurrentPatientNationalId") {
        (async () => {
            const patientId = await getCurrentPatientNationalId();
            sendResponse(patientId);
        })();
        return true;
    }
});

async function getCurrentPatientNationalId() {
    if (!window.location.href.includes("hinai")) {
        return null;
    }

    const infoElement = document.getElementById("patientFlag");

    if (!infoElement) {
        return null;
    }

    const nidElement = infoElement.childNodes[3];

    const nid = nidElement.innerText;

    return nid;
}
