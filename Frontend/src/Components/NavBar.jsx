import React, { useState } from "react";
import "../../public/Navbar.css";
import { useAuth0 } from "@auth0/auth0-react";

function NavBar() {
  const [openProfile, setOpenProfile] = useState(false);
  const {logout}=useAuth0()
  const {user}=useAuth0()

  const handleLogout = () => {
    logout({
      logoutParams:{
        returnTo:window.location.origin
      }
    })
  };
    const parts= user?.name.trim().split(/\s+/)
    const name=parts[0][0].toUpperCase()+
    (parts.length>1 ?parts[parts.length-1][0].toUpperCase():"") 

  return (
   <div className="profile-menu">

  <div className="profile-avatar">
    {name}
  
  </div>

  <div className="profile-info">
    <p className="profile-name">{user.name}</p>
    <p className="profile-plan">Plus</p>
  </div>

  <div className="profile-divider"></div>

  <button className="logout-btn"
  onClick={()=>handleLogout()}>
    <i className="fa-solid fa-right-from-bracket" ></i>
    Logout
  </button>

</div>
  );
}

export default NavBar;
