/* eslint-disable no-undef */
/* eslint-disable global-require */
import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Nav from "./nav";
import RequireAuth from "./requireauth";
import Home from "../components/home";
import Dashboard from "../components/dashboard";
import Organizations from "../components/organizations";
import Teams from "../components/teams";
import Profile from "../components/account/profile";

function WithNav() {
  return (
    <>
      <Nav />
      <Outlet />
    </>
  );
}

function WithoutNav() {
  return <Outlet />;
}

function WithSession({ children }: { children: JSX.Element }) {
  return <RequireAuth>{children}</RequireAuth>;
}

export default function AppRoutes() {
    return (
        <Routes>
            {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"))}
            <Route element={<WithoutNav />}>
                <Route
                    path="/"
                    element={
                        <EmailPassword.EmailPasswordAuth>
                            <RequireAuth>
                                <Home />
                            </RequireAuth>
                        </EmailPassword.EmailPasswordAuth>
                    }
                />
            </Route>
            <Route element={<WithNav />}>
                <Route
                    path="/dashboard"
                    element={
                        <WithSession>
                          <Dashboard />
                        </WithSession>
                    }
                />
                <Route
                    path="/organizations"
                    element={
                        <WithSession>
                          <Organizations />
                        </WithSession>
                    }
                />
                <Route
                    path="/teams"
                    element={
                        <WithSession>
                          <Teams />
                        </WithSession>
                    }
                />
                <Route
                    path="/account/profile"
                    element={
                        <WithSession>
                          <Profile />
                        </WithSession>
                    }
                />
            </Route>
        </Routes>
    );
}
