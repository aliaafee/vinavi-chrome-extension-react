import React, { useState, Children } from "react";

export default function VerticalSplitter({ leftWidth = "200px", children }) {
    const childrenArray = Children.toArray(children);
    return (
        <div
            className="grid grow overflow-auto"
            style={{ gridTemplateColumns: `${leftWidth} 1fr` }}
        >
            <div className="overflow-auto flex">{childrenArray[0]}</div>
            {/* <div
                className="hover:bg-black cursor-col-resize transition-colors duration-500"
                draggable
                style={{ width: "5px", left: leftWidth }}
            ></div> */}
            <div className="overflow-auto flex">{childrenArray[1]}</div>
        </div>
    );
}
