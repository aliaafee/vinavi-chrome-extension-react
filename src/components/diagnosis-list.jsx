import React from "react";

export default function DiagnosisList({ diagnoses }) {
    if (diagnoses.length < 1) {
        return <div id="diagnoses"></div>;
    }

    return (
        <div id="diagnoses">
            <h2 className="my-2 font-bold">Diagnoses</h2>
            <ul className="rounded-md divide-solid divide-y divide-x-0 bg-gray-100 divide-grey-300">
                {diagnoses.map((diagnosis, index) => (
                    <li
                        key={index}
                        className="grid p-1.5"
                        style={{
                            gridTemplateColumns:
                                "minmax(50px,max-content) minmax(100px, auto)",
                        }}
                    >
                        <span className="font-bold">
                            {diagnosis.attributes["icd-code"].code}
                        </span>
                        <span>{diagnosis.attributes["icd-code"].title}</span>
                        <span className="col-start-2 italic">
                            {diagnosis.attributes.remarks === null
                                ? ""
                                : diagnosis.attributes.remarks}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
