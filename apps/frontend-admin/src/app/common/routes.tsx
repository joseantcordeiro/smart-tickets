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
import CreateOrganization from "../components/organizations/create";
import Channels from "../components/channels";
import CreateChannel from "../components/channels/create";
import Teams from "../components/teams";
import Groups from "../components/groups";
import Profile from "../components/account/profile";
import Accounts from "../components/account/accounts";

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
                    path="/organizations/create"
                    element={
                        <WithSession>
                          <CreateOrganization />
                        </WithSession>
                    }
                />
                <Route
                    path="/channels"
                    element={
                        <WithSession>
                          <Channels />
                        </WithSession>
                    }
                />
                <Route
                    path="/channels/create"
                    element={
                        <WithSession>
                          <CreateChannel />
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
                    path="/groups"
                    element={
                        <WithSession>
                          <Groups />
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
                <Route
                    path="/account/accounts"
                    element={
                        <WithSession>
                          <Accounts />
                        </WithSession>
                    }
                />
            </Route>
        </Routes>
    );
}
