import React from "react";

import "./../styles/Library.css";

import samplePDF from "./../assets/pdf/essay.pdf";

import { Viewer, Worker } from '@react-pdf-viewer/core';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/page-navigation/lib/styles/index.css';

// Your render function



const LibraryPage = ({layout}) => {
    return (
        <>
        <div className="viewer">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                <Viewer fileUrl={samplePDF} plugins={[layout]} />
            </Worker>
        </div>
        </>
    )
}

export default LibraryPage