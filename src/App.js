import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NavBar from './NavBar';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/Home/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import DatabasePage from './pages/DatabasePage';

import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';

function App() {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  
  return (
    <div className="App">
      <BrowserRouter>
            <div className="App">
                <NavBar/>
                  <div className='pageBody'>
                      <Routes >
                          <Route path="/" element={<HomePage/>} />
                          <Route path="/dashboard" element={<DashboardPage/>} />
                          <Route path="/database" element={<DatabasePage/>} />
                          <Route path="/library" element={<LibraryPage layout={defaultLayoutPluginInstance}/>} />
                          <Route path="*" element={<NotFoundPage/>}/>
                      </Routes>
                  </div>
            </div>
        </BrowserRouter>
    </div>
  );
}
export default App;


