chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        if (request.action === "getCurrentPatientId") {
            (async () => {
                const patientId = await getCurrentPatientId()
                sendResponse(patientId);
            })();
            return true;
        }
    }
);


async function getCurrentPatientId() {
    const currentUrl = window.location.href;

    const patientIdmatch = currentUrl.match(/\/patients\/(\d+)/);

    if (patientIdmatch) {
        return patientIdmatch[1];
    }

    return null;
}