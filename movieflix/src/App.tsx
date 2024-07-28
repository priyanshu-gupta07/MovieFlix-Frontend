import { Routes, Route,useLocation, Navigate} from "react-router-dom";
import { useAppSelector } from "./hooks/typeHooks";

import Layout from "./Layout/Layout";
import HomePage from "./pages/homepage";
import AuthPage from "./pages/LoginandSignup"
import Movies from "./pages/Movies"
import NotFoundPage from "./pages/Notfound"
import SingleMoviePage from "./pages/SingleMovie"

const App = () => {
  const user = useAppSelector((state) => state.auth.user);

  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const redirectUrl = queryParams.get("callback")|| '/'
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/auth"
          element={!user ? <AuthPage /> : <Navigate to={redirectUrl} />}
        />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movies/:id" element={<SingleMoviePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
};

export default App;
