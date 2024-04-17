import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NavBar from './NavBar';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/Home/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LibraryPage from './pages/Library/LibraryPage';
import DatabasePage from './pages/DatabasePage';

import ErrorBoundary from './ErrorBoundary';

import React from 'react';

const App = () => {

	return (
		<div className="App">
			{/* <ErrorBoundary> */}
				<BrowserRouter>
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
				</BrowserRouter>
			{/* </ErrorBoundary> */}
		</div>
	);
}
export default App;


