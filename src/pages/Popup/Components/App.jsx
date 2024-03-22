import React, { useEffect, useState } from "react";

import VinaviApi from "../../../api/VinaviApi";
import PatientSearch from "./PatientSearch";
import AuthContext from "./AuthContext";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";
// import SelectedServiceProviderForm from "./SelectServiceProviderForm";

const processUser = (user) => {
    return {
        ...user,
        serviceProviders: user.included
            .filter((included) => included.type === "service-providers")
            .reduce(
                (a, serviceProvider) => ({
                    ...a,
                    [serviceProvider.id]: serviceProvider,
                }),
                {}
            ),
    };
};

export default function App() {
    const [user, setUser] = useState(null);
    const [serviceProvider, setServiceProvider] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setLoading] = useState(false);
    const [waitLoad, setWaitLoad] = useState(false);

    useEffect(() => {
        (async () => {
            setError(null);
            try {
                setLoading(true);

                const loggedUser = processUser(
                    await VinaviApi.getAuthenticatedUser()
                );
                setUser(loggedUser);

                try {
                    const selectedServiceProvider =
                        await VinaviApi.getServiceProvider();
                    setServiceProvider(selectedServiceProvider);
                } catch (error) {}
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // const onSetServiceProvider = (newServiceProviderId) => {
    //     alert(newServiceProviderId);
    //     (async () => {
    //         try {
    //             setLoading(true);

    //             await VinaviApi.setServiceProvider(newServiceProviderId);

    //             const selectedServiceProvider =
    //                 await VinaviApi.getServiceProvider();
    //             setServiceProvider(selectedServiceProvider);
    //         } catch (error) {
    //             setError(error);
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // };

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

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (!(user && serviceProvider)) {
        return (
            <ErrorMessage title="Error" message="Not Authorized.">
                Go to{" "}
                <a
                    target="_blank"
                    href="https://auth.aasandha.mv/auth/login"
                    className="text-blue-600 hover:underline"
                >
                    https://auth.aasandha.mv/auth/login
                </a>{" "}
                to complete login and select service provider.
                {error && (
                    <div className="p-1.5 bg-red-100 rounded-md">
                        {error.message}
                    </div>
                )}
            </ErrorMessage>
        );
    }

    if (error) {
        return <ErrorMessage title="Error" message={error.message} />;
    }

    // if (!serviceProvider) {
    //     console.log(Object.entries(user.serviceProviders));
    //     return (
    //         <SelectedServiceProviderForm
    //             serviceProviders={user.serviceProviders}
    //             onSave={onSetServiceProvider}
    //         />
    //     );
    // }

    return (
        <AuthContext.Provider
            value={{ user: user, serviceProvider: serviceProvider }}
        >
            <PatientSearch />
        </AuthContext.Provider>
    );
}
