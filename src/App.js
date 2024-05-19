import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NavBar from './pages/NavBar';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/Home/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LibraryPage from './pages/Library/LibraryPage';
import DatabasePage from './pages/DatabasePage';

import ErrorBoundary from './ErrorBoundary';

import React, { useEffect, useState } from 'react';
import MobileWarning from './pages/MobileWarning';

const App = () => {
	const [showMobileWarning, setShowMobileWarning] = useState(window.innerWidth < 1300)
	useEffect(() => {

		const onResize = () => {
            setShowMobileWarning(window.innerWidth < 1300 || window.innerHeight > window.innerWidth);
        }

        window.addEventListener("resize", onResize);
    
        return () => {
            window.removeEventListener("resize", onResize);
        }
	}, [])

	return (
		<div className="App">
			<ErrorBoundary>
				{showMobileWarning && <MobileWarning/>}
				{!showMobileWarning && <BrowserRouter basename='/ist196848/build'>
					<div className="App">
						<NavBar />
						<div className='pageBody'>
							<Routes >
								<Route path="/" element={<HomePage />} />
								<Route path="/dashboard" element={<DashboardPage />} />
								<Route path="/database" element={<DatabasePage />} />
								<Route path="/library" element={<LibraryPage />} />
								<Route path="*" element={<NotFoundPage />} />
							</Routes>
						</div>
					</div>
				</BrowserRouter>}
			</ErrorBoundary>
		</div>
	);
}
export default App;


