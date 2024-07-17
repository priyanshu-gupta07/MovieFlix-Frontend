import { Routes, Route, } from "react-router-dom";
// import { useAppSelector } from "./hooks/typeHooks";

import Layout from "./Layout/Layout";
import HomePage from "./pages/homepage";
import AuthPage from "./pages/LoginandSignup"
// import  Footer from "./Layout/Footer"

const App = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
