import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import "./../styles/ErrorBoundary.css";

function ErrorPage(props) {
    return (
        <div className={"error-page"}>
            <div className={"messageError"}>Something went wrong...</div>
            <br/>
            {props.resetErrorBoundary && (<button className={"retry-button"} onClick={props.resetErrorBoundary}>
                Go to Home Page
            </button>
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
            }}
            onReset={() => {
                console.log("reloading the page...");
                window.location.reload();
            }}
        >
            {props.children}
        </ReactErrorBoundary>
    );
}