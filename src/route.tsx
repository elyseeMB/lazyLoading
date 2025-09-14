import { createBrowserRouter, type RouteObject } from "react-router";
import Home from "./pages/Home.tsx";
import { createLazy } from "./tools/react-lazy.tsx";
import { Simulator } from "./utils/Simulator.tsx";

declare global {
  interface Window {
    testDeploy: any;
  }
}

const chunkSimulator = new Simulator();

const routes = [
  {
    path: "/",
    Component: createLazy(() => import("./pages/Home.tsx")),
  },
  {
    path: "/faile",
    // Component: createLazy(
    //   () =>
    //     new Promise<{ default: ComponentType<any> }>((resolve) => {
    //       setTimeout(() => {
    //         resolve({
    //           default: Home,
    //         });
    //       }, 2000);
    //     })
    // ),

    Component: createLazy(() =>
      Promise.reject(
        setTimeout(() => {
          new Error("Error laod");
        }, 2000)
      )
    ),
  },
  {
    path: "/test",
    loader: () => chunkSimulator.deploy(),
    Component: createLazy(() => chunkSimulator.simulatorImport("voiture")),
  },
] satisfies RouteObject[];

window.testDeploy = () => {
  chunkSimulator.deploy();
  console.log("deploy");
};

export const router = createBrowserRouter(routes);
