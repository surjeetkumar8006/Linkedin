import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { loginUser, registerUser } from "../../config/redux/action/authAction/index";
import styles from "./style.module.css";
import UserLayout from "@/layout/userLayout";
import Head from "next/head";


export default function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (authState.loggedIn) {
      router.push('/dashboard'); // If logged in, redirect to dashboard
    }
  }, [authState.loggedIn, router]);

  const [isLoginMethod, setIsLoginMethod] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    username: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (isLoginMethod) {
      const { email, password } = formData;
      if (!email || !password) {
        setError("Please fill all fields");
        return;
      }
      dispatch(loginUser({ email, password }));
    } else {
      const { email, password, fullName, username } = formData;
      if (!email || !password || !fullName || !username) {
        setError("Please fill all fields");
        return;
      }
      dispatch(registerUser({ fullName, username, email, password }));
    }
  };

  const toggleLoginMethod = () => {
    setIsLoginMethod(!isLoginMethod);
    setFormData({ email: "", password: "", fullName: "", username: "" });
  };

  if (authState.loggedIn) {
    return <div>Redirecting to dashboard...</div>; // Show a loading message while redirecting
  }

  return (
    <UserLayout>
      <Head>
  <title>{isLoginMethod ? "Login" : "Sign Up"} | My App</title>
  <meta
    name="description"
    content={isLoginMethod ? "Login to your account" : "Create a new account"}
  />
</Head>

      <div className={styles.loginContainer}>
        <div className={styles.loginContainer_left}>
          <div className={styles.welcomeText}>
            <h1>Welcome to Our Platform</h1>
            <p>
              {isLoginMethod
                ? "Sign in to continue exploring all the features."
                : "Sign up to start your journey with us!"}
            </p>
          </div>

          {isLoginMethod ? (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className={styles.input}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className={styles.submitButton}>
                Sign In
              </button>
            </form>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                name="fullName"
                placeholder="Enter your full name"
                className={styles.input}
                value={formData.fullName}
                onChange={handleInputChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className={styles.input}
                value={formData.email}
                onChange={handleInputChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className={styles.input}
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <input
                type="text"
                name="username"
                placeholder="Enter a username"
                className={styles.input}
                value={formData.username}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className={styles.submitButton}>
                Sign Up
              </button>
            </form>
          )}

          {(authState.message || error) && (
            <p
              className={
                authState.isError || error ? styles.error : styles.success
              }
            >
              {error || authState.message}
            </p>
          )}

          <div className={styles.toggleOption}>
            {isLoginMethod ? (
              <p>
                Don't have an account?{" "}
                <span onClick={toggleLoginMethod} className={styles.toggleLink}>
                  Sign Up
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span onClick={toggleLoginMethod} className={styles.toggleLink}>
                  Sign In
                </span>
              </p>
            )}
          </div>
        </div>

        <div className={styles.loginContainer_right}>
          <h2>Welcome to Our Platform</h2>
          <p>
            Here, we connect people, build opportunities, and create a
            community.
          </p>
          <p>
            Sign in to start exploring and connecting with professionals
            worldwide.
          </p>
        </div>
      </div>
    </UserLayout>
  );
}
