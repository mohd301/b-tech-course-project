import "bootstrap/dist/css/bootstrap.css";
import "./styles/styles.css";

// User
import Login from "./comps/Login";
import Footer from "./comps/Footer";
import Header from "./comps/Header";
import Register from "./comps/Register";
import Home from "./comps/Home";

// Priviliged User
import PrivLogin from "./compsPriv/LoginPriv";
import AdminHome from "./compsAdmin/HomeAdmin";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import Store from "./store/Store";

function App() {
  return (
    <Provider store={Store}>
      <Header />

      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />}></Route>
          <Route path='/regUser' element={<Register />}></Route>
          <Route path='/logPriv' element={<PrivLogin />}></Route>
          <Route path='/homeAdmin' element={<AdminHome />}></Route>
          <Route path="/Home" element={<Home/>}></Route>
        </Routes>
      </BrowserRouter>

      <Footer />
    </Provider>
  );
}

export default App;
