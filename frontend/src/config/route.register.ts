import React from "react";
import Preferences from "../pages/Preferences";
import { RouteRegistry } from "./routeRegistry";
import UserListPage from "../pages/Users";
import RoleListPage from "../pages/role";
import RoleFormPage from "../pages/role/roleForm";
import MenuListPage from "../pages/Menu";
import MenuFormPage from "../pages/Menu/form";
import AppSettingPage from "../pages/AppSettings";
import AppLauncher from "../pages/Launcher";
import DefaultPage from "../pages/DefaultPage";
import DepartmentListPage from "../pages/Departments";
import DepartmentFormPage from "../pages/Departments/form";
import UserFormTabs from "../pages/Users/UserFormTabs";

export function registerRoutes() {
  RouteRegistry.register(
    "/pages/default",
    "Empty",
    React.createElement(DefaultPage)
  );

  RouteRegistry.register(
    "/pages/launcher",
    "default app launcher",
    React.createElement(AppLauncher)
  );

  RouteRegistry.register(
    "/pages/app-settings",
    "app settings",
    React.createElement(AppSettingPage)
  );

  RouteRegistry.register(
    "/pages/preferences",
    "preferences",
    React.createElement(Preferences)
  );

  RouteRegistry.register(
    "/pages/departmemts",
    "list departments",
    React.createElement(DepartmentListPage)
  );

  RouteRegistry.register(
    "/departments/create",
    "add new departments",
    React.createElement(DepartmentFormPage)
  );

  RouteRegistry.register(
    "/departments/:id/edit",
    "edit department",
    React.createElement(DepartmentFormPage)
  );

  RouteRegistry.register(
    "/pages/users",
    "list users",
    React.createElement(UserListPage)
  );
  RouteRegistry.register(
    "/user/create",
    "create user",
    React.createElement(UserFormTabs)
  );

  RouteRegistry.register(
    "/user/:id/edit",
    "create user",
    React.createElement(UserFormTabs)
  );

  RouteRegistry.register(
    "/pages/roles",
    "Edit User",
    React.createElement(RoleListPage)
  );
  RouteRegistry.register(
    "/roles/create",
    "create roles",
    React.createElement(RoleFormPage)
  );
  RouteRegistry.register(
    "/roles/:id/edit",
    "edit roles",
    React.createElement(RoleFormPage)
  );

  RouteRegistry.register(
    "/pages/menu",
    "list menu",
    React.createElement(MenuListPage)
  );
  RouteRegistry.register(
    "/menu/create",
    "create menu",
    React.createElement(MenuFormPage)
  );
  RouteRegistry.register(
    "/menu/:id/edit",
    "edit menu",
    React.createElement(MenuFormPage)
  );
}
