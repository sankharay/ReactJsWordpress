import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const useGoogleMapsScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loader = new Loader({
      apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      version: "weekly",
    });

    loader.load().then(() => {
      setIsLoaded(true);
    });
  }, []);

  return isLoaded;
};

export default useGoogleMapsScript;