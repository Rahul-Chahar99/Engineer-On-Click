
import "./App.css";

import { Outlet } from "react-router-dom";
import Header from "./Components/Header/Header";
import Footer from "./Components/Footer/Footer";

function App() {
  return (
     <div className="min-h-screen flex flex-wrap content-between bg-white">
    <div className="w-full block">
      <Header/>
      <main>
        <Outlet/>
      </main>
      <Footer/>
    </div>
    </div>
  );
}

export default App;
