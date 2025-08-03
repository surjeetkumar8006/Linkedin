import { Provider } from "react-redux";
import '../styles/globals.css';
import store from '../config/redux/store';

import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }) {
  const [isClient, setIsClient] = useState(false); 
    const router = useRouter();
    useEffect(() => {
      setIsClient(true);
    }, []);
    

  if (!isClient) {
    return null;
  }

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}
