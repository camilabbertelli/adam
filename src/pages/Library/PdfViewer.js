import * as React from 'react';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import { Button, Position, PrimaryButton, Tooltip, Viewer, Worker } from '@react-pdf-viewer/core';
import {
    highlightPlugin,
    MessageIcon,
} from '@react-pdf-viewer/highlight';

import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { color } from 'd3';


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
    });

    const renderToolbar = Toolbar => (
        <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
        )
    
    let defaultLayoutPluginInstance = defaultLayoutPlugin({
        renderToolbar,
        sidebarTabs: (defaultTabs) => [
            defaultTabs[0],
        ],
        toolbarPlugin: {
            searchPlugin: {
                keyword: ["denny"]
            }
        }
    });
    
    const { renderDefaultToolbar } = defaultLayoutPluginInstance.toolbarPluginInstance;

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer theme={theme} fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>);
};

export default PdfViewer;