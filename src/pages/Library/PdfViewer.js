import * as React from 'react';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import { Viewer, Worker } from '@react-pdf-viewer/core';

import '@react-pdf-viewer/default-layout/lib/styles/index.css';


const PdfViewer = ({ fileUrl, theme }) => {

    const transform = (slot) => ({
        ...slot,
        Open: () => <></>,
        OpenMenuItem: () => <></>,
        Bookmark: () => <></>,
        Print: () => <></>,
        PrintMenuItem: () => <></>,
        SwitchTheme: () => <></>,
        SwitchThemeMenuItem: () => <></>,
        EnterFullScreen: () => <></>,
    });

    const renderToolbar = Toolbar => (
        <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
        )
    
    let defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0],
        ]
    });
    
    const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer theme={theme} fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>);
};

export default PdfViewer;