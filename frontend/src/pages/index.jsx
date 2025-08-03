import Head from "next/head";
import { useRouter } from "next/router";
import styles from "../styles/Home.module.css";
import UserLayout from "../layout/userLayout";

export default function Home() {
  const router = useRouter();

  const handleJoinNow = () => {
    router.push("/login");
  };

  const handleSignIn = () => {
    router.push("/login");
  };

  return (
    <UserLayout>
      <Head>
        <title>Welcome to LinkedIn | Connect & Grow</title>
        <meta
          name="description"
          content="Connect with professionals, build your career, and explore new opportunities."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.fullPage}>
        {/* Welcome Section */}
        <section className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.left}>
              <h1 className={styles.mainTitle}>
                Welcome to your professional community
              </h1>

              <div className={styles.signInOptions}>
                <button className={styles.signInEmail} onClick={handleSignIn}>
                  Sign in with email
                </button>
              </div>

              <p className={styles.infoText}>
                By clicking Continue to join or sign in, you agree to LinkedIn's{" "}
                <a href="#" className={styles.link}>User Agreement</a>,{" "}
                <a href="#" className={styles.link}>Privacy Policy</a>, and{" "}
                <a href="#" className={styles.link}>Cookie Policy</a>.
              </p>

              <p className={styles.newToLinkedIn}>
                New to LinkedIn?
                <button onClick={handleJoinNow} className={styles.joinNowLink}>
                  Join now
                </button>
              </p>
            </div>

            <div className={styles.right}>
              <img
                src="/images/connection.jfif"
                alt="Connect with professionals"
                className={styles.image}
              />
            </div>
          </div>
        </section>

        {/* Collaborative Articles Section */}
        <section className={styles.section}>
          <h2>Explore collaborative articles</h2>
          <p>
            We’re unlocking community knowledge in a new way. Experts add
            insights directly into each article, started with the help of AI.
          </p>
          <div className={styles.bubbleContainer}>
            <span className={styles.bubble}>Marketing</span>
            <span className={styles.bubble}>Public Administration</span>
            <span className={styles.bubble}>Healthcare</span>
            <span className={styles.bubble}>Engineering</span>
            <span className={styles.bubble}>IT Services</span>
            <span className={styles.bubble}>Sustainability</span>
            <span className={styles.bubble}>Business Admin</span>
            <span className={styles.bubble}>Telecommunications</span>
            <span className={styles.bubble}>HR Management</span>
            <span className={styles.bubble}>Show all</span>
          </div>
        </section>

        {/* Job Categories Section */}
        <section className={styles.section} style={{ backgroundColor: "#fff" }}>
          <h2>Find the right job or internship for you</h2>
          <div className={styles.bubbleContainer}>
            <span className={styles.bubble}>Engineering</span>
            <span className={styles.bubble}>Business Development</span>
            <span className={styles.bubble}>Finance</span>
            <span className={styles.bubble}>Administrative Assistant</span>
            <span className={styles.bubble}>Retail Associate</span>
            <span className={styles.bubble}>Customer Service</span>
            <span className={styles.bubble}>Operations</span>
            <span className={styles.bubble}>Information Technology</span>
            <span className={styles.bubble}>Marketing</span>
            <span className={styles.bubble}>Human Resources</span>
          </div>
        </section>
      </main>
    </UserLayout>
  );
}
