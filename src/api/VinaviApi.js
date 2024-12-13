// const apiServer = 'http://127.0.0.1:5000'
const apiServer = "https://vinavi.aasandha.mv";
const apiPath = "/api";

function getApiUrl() {
    return `${apiServer}${apiPath}`;
}

async function vinaviLogin() {
    try {
        const response = await fetch(apiServer);
        if (!response.ok) {
            throw new Error(`Response not ok, ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error, ${error.message}`, {
            cause: null,
        });
    }
}

async function getResource(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `Could not fetch resource, ${response.status} ${response.statusText}`,
                {
                    cause: response,
                }
            );
        }

        return await response.json();
    } catch (error) {
        if (error.cause) {
            throw new Error(
                `Could not fetch resource, ${error.cause.status} ${error.cause.statusText}`,
                {
                    cause: error.cause,
                }
            );
        }
        throw new Error(`Error, ${error.message}`, {
            cause: null,
        });
    }
}

async function postResource(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });

        if (!response.ok) {
            throw new Error(
                `Could not post resource, ${response.status} ${response.statusText}`,
                {
                    cause: response,
                }
            );
        }
    } catch (error) {
        if (error.cause) {
            throw new Error(
                `Could not fetch resource, ${error.cause.status} ${error.cause.statusText}`,
                {
                    cause: error.cause,
                }
            );
        }
        throw new Error(`Error, ${error.message}`, {
            cause: null,
        });
    }
}

async function getAllPaginatedResources(url, page = 1) {
    try {
        const items = await getResource(url + `&page%5Bnumber%5D=${page}`);

        if (items.meta.last_page > items.meta.current_page) {
            const moreItems = await getAllPaginatedResources(url, page + 1);

            return {
                data: items.data.concat(moreItems.data),
                included: items.included.concat(moreItems.included),
                meta: {
                    current_page: 1,
                    last_page: 1,
                },
            };
        }

        return {
            data: items.data,
            included: items.included,
            meta: {
                current_page: 1,
                last_page: 1,
            },
        };
    } catch (error) {
        throw new Error("Failed to get all resources", {
            cause: error.cause,
        });
    }
}

function processRelationshipItem(relationshipItem, includedMap, depth) {
    if (!(relationshipItem.type in includedMap)) {
        return relationshipItem;
    }
    if (!(relationshipItem.id in includedMap[relationshipItem.type])) {
        return relationshipItem;
    }
    const relationshipObject =
        includedMap[relationshipItem.type][relationshipItem.id];

    if (!("relationships" in relationshipObject)) {
        return relationshipObject;
    }

    return {
        ...Object.keys(relationshipObject)
            .filter((key) => key != "relationships")
            .reduce((accumulator, key) => {
                return { ...accumulator, [key]: relationshipObject[key] };
            }, {}),
        relationships: processRelationships(
            relationshipObject.relationships,
            includedMap,
            depth + 1
        ),
    };
}

function processRelationships(relationships, includedMap, depth = 1) {
    if (relationships === null) {
        return relationships;
    }
    if (depth > 3) {
        return relationships;
    }

    return Object.keys(relationships).reduce((accumulator, key) => {
        return {
            ...accumulator,
            [key]: ((relationship) => {
                if (relationship === null) {
                    return null;
                }
                if (Array.isArray(relationship)) {
                    return {
                        data: relationship.map((relationshipItem) => {
                            return processRelationshipItem(
                                relationshipItem,
                                includedMap,
                                depth
                            );
                        }),
                    };
                }
                return {
                    data: processRelationshipItem(
                        relationship,
                        includedMap,
                        depth
                    ),
                };
            })(relationships[key].data),
        };
    }, {});
}

function processDataItem(dataItem, includedMap) {
    return {
        ...Object.keys(dataItem)
            .filter((key) => {
                if (key !== "relationships") {
                    return key;
                }
            })
            .reduce((accumulator, key) => {
                return { ...accumulator, [key]: dataItem[key] };
            }, {}),
        relationships: processRelationships(
            dataItem.relationships,
            includedMap
        ),
    };
}

function processResourceData(data, includedMap) {
    if (data === null) {
        return null;
    }

    if (Array.isArray(data)) {
        return data.map((dataItem) => {
            return processDataItem(dataItem, includedMap);
        });
    }

    return processDataItem(data, includedMap);
}

function createIncludedMap(item) {
    var map = {};

    item.included.forEach((itemIncluded) => {
        if (!(itemIncluded.type in map)) {
            map[itemIncluded.type] = {};
        }
        map[itemIncluded.type][itemIncluded.id] = itemIncluded;
    });

    return map;
}

function processResource(resource) {
    if (resource === null) {
        return null;
    }

    const includedMap = createIncludedMap(resource);

    return {
        meta: resource.meta,
        data: processResourceData(resource.data, includedMap),
    };
}

async function getActiveTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

async function getCases(patientId, page = 1) {
    try {
        return processResource(
            await getResource(
                `${getApiUrl()}/patients/${patientId}/patient-cases?include=episodes,doctor&page%5Bnumber%5D=${page}&sort=-created_at`
            )
        );
    } catch (error) {
        throw new Error(`Could not get cases, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function getEpisodeDetail(episodeId) {
    try {
        return processResource(
            await getResource(
                `${getApiUrl()}/episodes/${episodeId}?include=patient,doctor,prescriptions.medicines.preferred-medicine,prescriptions.consumables.preferred-consumable,prescriptions.professional,requested-services.service.service-professions,requested-services.professional,requested-services.documents,diagnoses.icd-code,vitals,vitals.professional,admission,requested-admission,eev-referrals,current-eev-referral,notes.professional,diagnoses.professional,service-provider`
            )
        );
    } catch (error) {
        throw new Error(`Could not get episode detail, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function getPatient(patientId = null) {
    try {
        return processResource(
            await getResource(
                `${getApiUrl()}/patients/${patientId}?include=current-admission,current-eev-referral,admission-request,address.island.atoll,blocked-patient`
            )
        );
    } catch (error) {
        throw new Error(`Could not get patient, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function searchPatientByNationalIdentification(nationalIdentification) {
    try {
        return await getResource(
            `${getApiUrl()}/patients/search/${nationalIdentification}`
        );
    } catch (error) {
        throw new Error(`Could not search for patient, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function getAuthenticatedUser() {
    try {
        return await getResource(
            `${getApiUrl()}/users/authenticated?include=employee,professional.service-providers,permissions,roles.permissions`
        );
    } catch (error) {
        throw new Error(`Could not get authenticated user, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function getServiceProvider() {
    try {
        return await getResource(`${apiServer}/service-provider`);
    } catch (error) {
        throw new Error(`Could not get service provider, ${error.message}`, {
            cause: error.cause,
        });
    }
}

async function getAllCases(patientId) {
    try {
        return processResource(
            await getAllPaginatedResources(
                `${getApiUrl()}/patients/${patientId}/patient-cases?include=episodes,doctor&sort=-created_at`
            )
        );
    } catch (error) {
        throw new Error(`Could not get cases, ${error.message}`, {
            cause: error.cause,
        });
    }
}

// async function getAllCases(patientId, page = 1) {
//     try {
//         const cases = await getCases(patientId, page);

//         if (cases.meta.last_page > cases.meta.current_page) {
//             const moreCases = await getAllCases(patientId, page + 1);

//             return {
//                 data: cases.data.concat(moreCases.data),
//                 meta: {
//                     current_page: 1,
//                     last_page: 1,
//                 },
//             };
//         }

//         return {
//             data: cases.data,
//             meta: {
//                 current_page: 1,
//                 last_page: 1,
//             },
//         };
//     } catch (error) {
//         throw new Error("Failed to get all cases", {
//             cause: error.cause,
//         });
//     }
// }

async function setCurrentServiceProvider(serviceProviderId) {
    if (!serviceProviderId) {
        throw new Error("No valid service provider Id Given");
    }

    postResource(`${apiServer}/service-provider`, {
        data: { id: serviceProviderId },
    });
}

const titleFromProfessionalType = (professionalType) => {
    if (professionalType === "doctor") {
        return "Dr. ";
    }
    return professionalType[0].toUpperCase() + professionalType.slice(1);
};

const getProfessionalFullname = (caseItem) => {
    if (
        "relationships" in caseItem &&
        "doctor" in caseItem.relationships &&
        "data" in caseItem.relationships.doctor &&
        "attributes" in caseItem.relationships.doctor.data &&
        "fullname" in caseItem.relationships.doctor.data.attributes
    ) {
        return `${titleFromProfessionalType(
            caseItem.relationships.doctor.data.attributes.professional_type
        )} ${caseItem.relationships.doctor.data.attributes.fullname}`;
    }
    return "?";
};

const extractExaminations = (episode) => {
    // For some inconciviable reasion the exminations field is stored in the
    // diagnosis list. Dont ask me why. The database designer thought this was
    // the best way to do it.
    console.log(episode);
    return episode.data.relationships.diagnoses.data
        .map((diagnosis) => diagnosis.attributes.on_examination)
        .filter((exam) => exam !== null);
};

export {
    apiServer,
    getActiveTab,
    getAllCases,
    getCases,
    getEpisodeDetail,
    getPatient,
    searchPatientByNationalIdentification,
    getAuthenticatedUser,
    getServiceProvider,
    setCurrentServiceProvider,
    getAllPaginatedResources,
    getResource,
    getProfessionalFullname,
    extractExaminations,
    vinaviLogin,
};
