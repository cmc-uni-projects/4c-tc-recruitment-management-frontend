import {Routes, Route } from "react-router-dom";
import HomePage from "./pages/Home/HomePage";
import LoginPage from "./pages/Login/LoginPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
         <Route path="/login" element={<LoginPage />} />
      </Routes>
  );
}

export default App;
