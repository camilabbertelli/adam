import { Component } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

function ErrorPage(props) {
    return (
        <div className={"error-page"}>
            <div className={"oops"}>Oops!</div>
            <div className={"message"}>Something went wrong...</div>
            {props.resetErrorBoundary && (
                <div>
                    <button className={"retry-button"} onClick={props.resetErrorBoundary}>
                        🔄 Try Again!
                    </button>
                </div>
            )}
        </div>
        
    );
}

export default function ErrorBoundary(props) {
    return (
        <ReactErrorBoundary
            FallbackComponent={ErrorPage}
            fallbackRender={ErrorPage}
            onError={(error, errorInfo) => {
                // log the error
                console.log("Error caught!");
                console.error(error);
                console.error(errorInfo);

                // record the error in an APM tool...
            }}
            onReset={() => {
                // reloading the page to restore the initial state
                // of the current page
                console.log("reloading the page...");
                window.location.reload();

                // other reset logic...
            }}
        >
            {props.children}
        </ReactErrorBoundary>
    );
}