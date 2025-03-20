import { BrowserRouter, Routes, Route } from "react-router";
import Layout from './layout.tsx';
import Login from './pages/Login';
import Home from './pages/Home';
import './App.css'


const App: React.FC = () => {

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route element={ <Layout />}>
                    <Route path="/" element={<Home />} />
                </Route>
            </Routes>

        </BrowserRouter>
    );
};

export default App;
