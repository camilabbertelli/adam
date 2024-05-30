import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NavBar from './pages/NavBar';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/Home/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LibraryPage from './pages/Library/LibraryPage';
import DatabasePage from './pages/DatabasePage';

import ErrorBoundary from './pages/ErrorBoundary';

import React, { useEffect, useState } from 'react';
import MobileWarning from './pages/MobileWarning';

import csv_data from "./assets/data.csv"

import * as d3 from "d3"

const App = () => {
	const [showMobileWarning, setShowMobileWarning] = useState(window.innerWidth < 1300)
	const [data, setData] = useState([])
	const [databaseFilterConfiguration, setDatabaseFilterConfiguration] = useState([])
	const [databaseCheckedKeys, setDatabaseCheckedKeys] = useState([])
	const [dashboardFilterConfiguration, setDashboardFilterConfiguration] = useState([])

	useEffect(() => {

		const onResize = () => {
            setShowMobileWarning(window.innerWidth < 1300 || window.innerHeight > window.innerWidth);
        }

        window.addEventListener("resize", onResize);

		d3.csv(csv_data).then(d => {
            setData(d)

        }).catch((error) => {
            console.error('Error fetching data:', error);
            // Display a user-friendly error message
            alert('An error occurred while fetching data.');
        });

		return () => {
            window.removeEventListener("resize", onResize);
        }

	}, [])

	return (
		<div className="App">
			<ErrorBoundary>
				{showMobileWarning && <MobileWarning/>}
				{!showMobileWarning && <BrowserRouter basename='/ist196848/adam'>
					<div className="App">
						<NavBar />
						<div className='pageBody'>
							<Routes >
								<Route path="/" element={<HomePage />} />
								<Route path="/dashboard" element={<DashboardPage data={data}
																				 dashboardFilterConfiguration={dashboardFilterConfiguration}
																				 setDashboardFilterConfiguration={setDashboardFilterConfiguration}/>} />
								<Route path="/database" element={<DatabasePage data={data} 
																			   databaseFilterConfiguration={databaseFilterConfiguration} 
																			   setDatabaseFilterConfiguration={setDatabaseFilterConfiguration}
																			   databaseCheckedKeys={databaseCheckedKeys}
																			   setDatabaseCheckedKeys={setDatabaseCheckedKeys}/>} />
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


