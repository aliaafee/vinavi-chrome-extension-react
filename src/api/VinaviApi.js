function processRelationshipItem(relationshipItem, includedMap, depth) {
    if (!(relationshipItem.type in includedMap)) {
        return relationshipItem;
    }
    if (!(relationshipItem.id in includedMap[relationshipItem.type])) {
        return relationshipItem;
    }
    const relationshipObject = includedMap[relationshipItem.type][relationshipItem.id];

    if (!('relationships' in relationshipObject)) {
        return relationshipObject
    }

    return {
        ...Object.keys(relationshipObject).filter(key => key != 'relationships').reduce((accumulator, key) => {
            return { ...accumulator, [key]: relationshipObject[key] }
        }, {}),
        relationships: processRelationships(relationshipObject.relationships, includedMap, depth + 1)
    }
}

function processRelationships(relationships, includedMap, depth = 1) {
    if (relationships === null) {
        return relationships
    }
    if (depth > 3) {
        return relationships
    }

    return Object.keys(relationships).reduce((accumulator, key) => {
        return {
            ...accumulator, [key]: ((relationship) => {
                if (relationship === null) {
                    return null
                }
                if (Array.isArray(relationship)) {
                    return {
                        data: relationship.map((relationshipItem) => {
                            return processRelationshipItem(relationshipItem, includedMap, depth)
                        })
                    }
                }
                return {
                    data: processRelationshipItem(relationship, includedMap, depth)
                }
            })(relationships[key].data)
        }
    }, {})

}

function processDataItem(dataItem, includedMap) {
    return {
        ...Object.keys(dataItem).filter((key) => { if (key !== 'relationships') { return key } }).reduce((accumulator, key) => {
            return { ...accumulator, [key]: dataItem[key] }
        }, {}),
        relationships: processRelationships(dataItem.relationships, includedMap)
    }
}

function processResourceData(data, includedMap) {
    if (data === null) {
        return null
    }

    if (Array.isArray(data)) {
        return data.map(dataItem => {
            return processDataItem(dataItem, includedMap)
        })
    }

    return processDataItem(data, includedMap);
}

function createIncludedMap(item) {
    var map = {};

    item.included.forEach((itemIncluded) => {
        if (!(itemIncluded.type in map)) {
            map[itemIncluded.type] = {}
        }
        map[itemIncluded.type][itemIncluded.id] = itemIncluded;
    })

    return map;
}

function processResource(resource) {
    if (resource === null) {
        return null
    }

    const includedMap = createIncludedMap(resource);

    return {
        meta: resource.meta,
        data: processResourceData(resource.data, includedMap)
    }
}

async function getActiveTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getCases(patientId, page = 1) {
    const activeTab = await getActiveTab();

    try {
        return processResource(await chrome.tabs.sendMessage(
            activeTab.id,
            {
                "action": "getCases",
                "patientId": patientId,
                "page": page
            }
        ));
    } catch (error) {
        return null
    }
}

async function getAllCases(patientId, page = 1) {
    const cases = await getCases(patientId, page);

    if (cases === null) {
        return null;
    }

    if (cases.meta.last_page > cases.meta.current_page) {
        const moreCases = await getAllCases(patientId, page + 1);

        if (moreCases === null) {
            return {
                data: cases,
                meta: {
                    current_page: 1,
                    last_page: 1
                }
            }
        }

        return {
            data: cases.data.concat(moreCases.data),
            meta: {
                current_page: 1,
                last_page: 1
            }
        }
    }

    return {
        data: cases.data,
        meta: {
            current_page: 1,
            last_page: 1
        }
    }
}

async function getEpisodeDetail(episodeId) {
    const activeTab = await getActiveTab();

    try {
        return processResource(await chrome.tabs.sendMessage(
            activeTab.id,
            {
                "action": "getEpisodeDetail",
                "episodeId": episodeId
            }
        ));
    } catch (error) {
        return null
    }
}

async function getPatient(patientId = null) {
    const activeTab = await getActiveTab();
    try {
        return processResource(await chrome.tabs.sendMessage(
            activeTab.id,
            {
                "action": "getPatient",
                "patientId": patientId
            }
        ));
    } catch (error) {
        return null
    }
}


async function getCurrentPatientId() {
    const activeTab = await getActiveTab();
    try {
        return await chrome.tabs.sendMessage(
            activeTab.id,
            {
                "action": "getCurrentPatientId"
            }
        );
    } catch (error) {
        return null
    }
}

async function searchPatientByNationalIdentification(nationalIdentification) {
    const activeTab = await getActiveTab();
    try {
        return await chrome.tabs.sendMessage(
            activeTab.id,
            {
                "action": "searchPatientByNationalIdentification",
                'nationalIdentification': nationalIdentification
            }
        );
    } catch (error) {
        return null
    }
}

export default {
    getAllCases: getAllCases,
    getCases: getCases,
    getEpisodeDetail: getEpisodeDetail,
    getPatient: getPatient,
    getCurrentPatientId: getCurrentPatientId,
    searchPatientByNationalIdentification: searchPatientByNationalIdentification
}