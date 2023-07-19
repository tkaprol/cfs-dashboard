import { useKeycloak } from "@react-keycloak/web";
//import { Navigate } from "react-router";

const PrivateComponent = ({children}) =>{
    const {keycloak} = useKeycloak();
    const isLoggedIn = keycloak.authenticated;
    return isLoggedIn ? children : null;
}

export default PrivateComponent;