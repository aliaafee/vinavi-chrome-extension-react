import React, { useEffect, useState } from "react";

export default function WaitLoad({ children }) {
    const [waitLoad, setWaitLoad] = useState(true);

    if (waitLoad) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center">
                <button
                    className="w-12 p-1.5 rounded-md bg-red-300 border-0 focus:outline-2 focus:outline-red-300 hover:bg-red-400"
                    onClick={() => setWaitLoad(false)}
                >
                    Start
                </button>
            </div>
        );
    }

    return children;
}
