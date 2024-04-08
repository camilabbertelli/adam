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

import csv_data from "./assets/data.csv"
import * as d3 from "d3"

class App extends React.Component{

	constructor(props){
		super(props);
		this.state = {
            data: []
        };
	}

	componentDidMount(){
		d3.csv(csv_data).then(d => {
			this.setState({data: d})
		})
	}

	render(){
		let	data = this.state.data
		if (!data.length) return ""

		return (
			<div className="App">
				<ErrorBoundary>
					<BrowserRouter>
						<div className="App">
							<NavBar />
							<div className='pageBody'>
								<Routes >
									<Route path="/" element={<HomePage />} />
									<Route path="/dashboard" element={<DashboardPage data={data}/>} />
									<Route path="/database" element={<DatabasePage />} />
									<Route path="/library" element={<LibraryPage data={data}/>} />
									<Route path="*" element={<NotFoundPage />} />
								</Routes>
							</div>
						</div>
					</BrowserRouter>
				</ErrorBoundary>
			</div>
		);
	}
}
export default App;


