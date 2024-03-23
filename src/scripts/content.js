chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getCurrentPatientId") {
        (async () => {
            const patientId = await getCurrentPatientId();
            sendResponse(patientId);
        })();
        return true;
    }

    if (request.action === "getCurrentPatientNationalId") {
        (async () => {
            const patientId = await getCurrentPatientNationalId();
            sendResponse(patientId);
        })();
        return true;
    }
});

async function getCurrentPatientId() {
    if (!window.location.href.includes("vinavi")) {
        return null
    }

    const patientIdmatch = window.location.href.match(/\/patients\/(\d+)/);

    if (patientIdmatch) {
        return patientIdmatch[1];
    }

    return null;
}

async function getCurrentPatientNationalId() {
    if (!window.location.href.includes("hinai")) {
        return null
    }

    const infoElement = document.getElementById("patientFlag");
    
    if (!infoElement) {
        return null;
    }

    const nidElement = infoElement.childNodes[3]

    const nid = nidElement.innerText

    return nid;
}
