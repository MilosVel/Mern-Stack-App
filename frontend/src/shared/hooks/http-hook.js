import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]); // umesto useRef moze da se koristi i varijabla izvan useHttpClient

  const sendRequest = useCallback(async (url, method = 'GET', body = null, headers = {}) => {

    setIsLoading(true);

    const httpAbortCtrl = new AbortController();
    activeHttpRequests.current.push(httpAbortCtrl);

    try {
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: httpAbortCtrl.signal
      });

      const responseData = await response.json();

      activeHttpRequests.current = activeHttpRequests.current.filter(reqCtrl => reqCtrl !== httpAbortCtrl);
      // ovim se uklanja abortcontroler koji se odnosi na ovaj sprecificni request kada je request completed. Drugim recima, ovim se cuva svaki abortcontroler osim abort contolera koji se koristi za ovaj request.

 
      if (!response.ok) { // ovo je jako bitno zbog responsea 400th i 500th -> jer je resposne.ok === false 
        throw new Error(responseData.message);
      }

      setIsLoading(false);

      return responseData;
    } catch (err) {
      // console.log('Greska uhvacena u http custom hook je: ',err)
      setError(err.message);
      setIsLoading(false);
      throw err; 
      // throw new Error(err.message)  // prilicno slicno kao i gornja linija koda
      //  throw new Error('Prosledjujem bas ovaj tekst greske u grugu komponentu')  
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      // console.log('CELAN UP FUNKCIJA za Http request u returnu UseEffect-a') 
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};


