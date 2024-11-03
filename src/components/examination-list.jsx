import React from "react";

export default function ExaminationList({ examinations }) {
    if (examinations.length < 1) {
        return <div id="examinations"></div>;
    }

    return (
        <div id="examinations">
            <h2 className="my-2 font-bold">On Examination</h2>
            <ul className="rounded-md divide-solid divide-y divide-x-0 bg-gray-100 divide-grey-300">
                {examinations.map((examination, index) => (
                    <li key={index} className="grid p-1.5">
                        {examination}
                    </li>
                ))}
            </ul>
        </div>
    );
}
