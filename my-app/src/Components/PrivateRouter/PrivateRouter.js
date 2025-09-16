import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getUserRol, isAuthentication, rolAuth } from "../../utils/auth";

const  roleFallback = (role)=>{
    switch(role){
        case 1: return "/admin"
        case 2: return "/supervisor"
        case 3: return "/tecnico"
        default: return "/"
    }
}

export const PrivateRouter = ({ children, allowedRoles = [] }) => {
  const location = useLocation();

  if (!isAuthentication()) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  const userRol = parseInt(getUserRol(), 10);

  if (allowedRoles.includes(userRol)) {
    return children;
  }

  // si el rol no tiene permiso → redirige a su dashboard correspondiente
  return <Navigate to={roleFallback(userRol)} replace />;
};