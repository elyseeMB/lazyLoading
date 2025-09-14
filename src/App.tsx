import { RouterProvider } from "react-router";
import "./App.css";
import { router } from "./route.tsx";
import { Navigation } from "./components/Navigation.tsx";

function App() {
  return (
    <div className="playground">
      <div className="left">
        <Navigation />
      </div>

      <div className="right">
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
