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

import csv_data from "./assets/data2.csv"

import * as d3 from "d3"

const App = () => {
	// App
	const [showMobileWarning, setShowMobileWarning] = useState(window.innerWidth < 1300)

	// Global
	const [data, setData] = useState([])
	const [csvNames, setCsvNames] = useState({})
	const [csvIndexes, setCsvIndexes] = useState({})

	// Dashboard
	const [dashboard, setDashboard] = useState({})
	
	// Database
	const [databaseFilterConfiguration, setDatabaseFilterConfiguration] = useState([])
	const [databaseCheckedKeys, setDatabaseCheckedKeys] = useState([])

	useEffect(() => {

		const onResize = () => {
            setShowMobileWarning(window.innerWidth < 1300 || window.innerHeight < 650 ||window.innerHeight > window.innerWidth);
        }

        window.addEventListener("resize", onResize);


		d3.csv(csv_data).then(d => {

			let indexes = {}
			let names = {}
			if (d.length) {
				// needs to have the same key names and order
				names.index = "#"
				names.material_type = "Tipo"
				names.genre = "Género literário"
				names.title = "Título"
				names.description = "Passo do texto"
				names.subject_name = "Nome"
				names.agent = "Posição"
				names.subject_number = "Número"
				names.subject_sex = "Sexo"
				names.nature = "Natureza"
				names.dimension = "Dimensão"
				names.anatomical_part = "Anatomia"
				names.organs = "Órgãos"
				names.subject_qualities = "Qualificativo"
				names.action = "Ação"
				names.causes_group = "Grupo de causas"
				names.causes = "Causa"
				names.latitude = "Latitude"
				names.longitude = "Longitude"
				names.time = "Quando"
				names.place = "Onde"
				names.how = "Como"
				names.intention = "Intenção"
				names.with_name = "Nome_1"
				names.with_sex = "Sexo_1"
				names.with_qualities = "Qualificativo_1"
				names.about_name = "Nome_2"
				names.about_sex = "Sexo_2"
				names.about_qualities = "Qualificativo_2"
				names.object = "Objeto"
				names.value = "Valor"
				names.supernatural_type = "Tipo de sobrenatural"
				names.pp = "PP."

				Object.keys(names).forEach((key, index) => {
					indexes[key] = index
				})
			}

			setCsvNames(names)
			setCsvIndexes(indexes)
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

	function updateDashboard(variable, value){
		let aux = dashboard
		aux[variable] = value
		setDashboard(aux)
	}

	return (
		<div className="App">
			<ErrorBoundary>
				{showMobileWarning && <MobileWarning/>}
				{!showMobileWarning && <BrowserRouter basename='/ist196848/test'>
					<div className="App">
						<NavBar />
						<div className='pageBody'>
							<Routes >
								<Route path="/" element={<HomePage data={data}
																   csvNames={csvNames} csvIndexes={csvIndexes} />} />
								<Route path="/dashboard" element={<DashboardPage data={data}
																				 dashboard={dashboard} updateDashboard={updateDashboard}
																				 csvNames={csvNames} csvIndexes={csvIndexes}
																				 />} />
								<Route path="/database" element={<DatabasePage csvNames={csvNames} data={data} 
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


