import React, { useState, useRef } from "react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

const AutocompleteExample = () => {
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (!autocompleteRef.current) {
      console.error("Autocomplete not initialized.");
      return;
    }
    const place = autocompleteRef.current.getPlace();
    if (place.geometry) {
      setAddress(place.formatted_address);
      setCoordinates({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
    }
  };

  return (
    <LoadScript googleMapsApiKey="" libraries={["places"]}>
      <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
        <input type="text" placeholder="Type an address" />
      </Autocomplete>
      <div>
        <p>Address: {address}</p>
        <p>Latitude: {coordinates.lat}</p>
        <p>Longitude: {coordinates.lng}</p>
      </div>
    </LoadScript>
  );
};

export default AutocompleteExample;
