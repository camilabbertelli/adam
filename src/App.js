import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import NavBar from './NavBar';

import { BrowserRouter, Routes, Route } from 'react-router-dom'

import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
            <div className="App">
                <NavBar/>
                <div>
                    <Routes >
                        <Route path="/" element={<HomePage/>} />
                        <Route path="/dashboard" element={<DashboardPage/>} />
                        <Route path="/library" element={<LibraryPage/>} />
                        <Route path="*" element={<NotFoundPage/>}/>
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    </div>
  );
}
export default App;


