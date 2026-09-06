import { useAuth0 } from "@auth0/auth0-react";
import React, { useState } from "react";
import "../../public/LoginPage.css";

function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  const [copied, setCopied] = useState(false);

  const demoPassword = "9a!t!YGsj66sUpy";

  const handleGoogleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "google-oauth2",
      },
    });
  };

  const handleDemoLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        connection: "Username-Password-Authentication",
        login_hint: "demo@gmail.com",
      },
    });
  };

  const handleCopyPassword = async () => {
    try {

      await navigator.clipboard.writeText(
        demoPassword
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          <div className="logo-circle">
            <i className="fa-solid fa-comments"></i>
          </div>
        </div>

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to continue your conversations
        </p>

        <button
          className="google-login-btn"
          onClick={handleGoogleLogin}
        >
          <div className="google-icon">
            G
          </div>

          <span>Continue with Google</span>
        </button>

        <br />

        <button
          className="google-login-btn"
          onClick={handleDemoLogin}
        >
          <span>Login as a Demo User</span>
        </button>


        <div
          className="demo-password"
          onClick={handleCopyPassword}
        >
          <span>
            Demo Password: {demoPassword}
          </span>

          <i
            className={
              copied
                ? "fa-solid fa-check"
                : "fa-regular fa-copy"
            }
          ></i>
        </div>


        {copied && (
          <p className="copied-message">
            Password copied!
          </p>
        )}


        <div className="login-divider">
          <span></span>
          <p>secure login</p>
          <span></span>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;