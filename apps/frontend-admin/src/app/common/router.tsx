import React from "react";
import Dashboard from "../components/dashboard";
import Organizations from "../components/organizations";
import Teams from "../components/teams";

const routes = {
  "/": () => <Dashboard />,
  "/organizations": () => <Organizations />,
  "/teams": () => <Teams />
};

export default routes;
