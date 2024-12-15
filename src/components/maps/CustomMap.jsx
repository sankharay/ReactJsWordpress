import { useState } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindow, Autocomplete } from "@react-google-maps/api";
import AddressList from "./AddressList";
import '../../assets/css/CustomMap.css';
import { Info, LocationOn, Search, Place, Route } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';

const containerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 49.126563,
  lng: -122.799900,
};

function CustomMap() {
  const [activeMarker, setActiveMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addresses, setAddresses] = useState([]);

  // This is the handler for address selection
  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const { lat, lng } = place.geometry.location;
        const address = place.formatted_address;

        // Send API request to get nearby locations
        console.log('--------------' + place.geometry.location + '--------------' + lat());
        fetchNearbyLocations(address, lat(), lng());

        // Add marker to the map with a unique ID
        setMarkers((prevMarkers) => [
          ...prevMarkers,
          {
            id: `custom-${Date.now()}`, // Unique ID for custom marker
            position: { lat: lat(), lng: lng() },
            content: `Selected Address: ${address}`,
          },
        ]);
      }
    }
  };

  const fetchNearbyLocations = (address, lat, lng) => {
    // Encode address, lat, and lng to ensure special characters don't break the URL
    const encodedAddress = encodeURIComponent(address);
    const encodedLat = encodeURIComponent(lat);
    const encodedLng = encodeURIComponent(lng);

    console.log(`Sending request with: address=${encodedAddress}, lat=${encodedLat}, lng=${encodedLng}`);

    fetch(`https://isawrisk.com/home/getNearbyLocationsApp?address=${encodedAddress}&lat=${encodedLat}&lng=${encodedLng}&hotline=0&range=20`)
      .then((response) => response.json())
      .then((data) => {
        // Extract latitudes and longitudes from the response and add markers
        const newMarkers = data.map((location, index) => ({
          id: `api-${location.name}-${index}`, // Unique ID for API markers
          position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
          content: location.name,
        }));
        setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
        setAddresses(data);
        console.log("Fetched nearby locations:", data);
      })
      .catch((error) => console.error("Error fetching nearby locations:", error));
  };


  const handleMarkerClick = (marker) => {
    setActiveMarker(marker.id === activeMarker?.id ? null : marker);
  };

  return (
    <>
      <LoadScript
        googleMapsApiKey="AIzaSyBAcgZInamcDOnFcLkBa0pCI6bPJHSSYjY"
        libraries={["places"]} // Make sure to add this line to load the 'places' library
      >
        {/* Autocomplete Input */}
        <div className="autocomplete-container">
          <div className="find-help-block-language">English</div>
          <div className="find-help-block-header"><Info className="icon-colors-top" />Find Help</div>
          <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceChanged}>
            {/* <input type="text" className="findaddress" placeholder="Enter your postel code" /> */}
            <Input  type="text" className="findaddress"
              id="input-with-icon-adornment"
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="start">
                  <Place />
                </InputAdornment>
              }
            />
          </Autocomplete>

          <div className="find-help-block">
            <span className="find-help-hotline"><input type="checkbox" name="hotline" className="hotline-checkbox" />24/7 HOTLINE</span>
            <span className="find-help-distance">Distance</span>
          </div>
        </div>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
          onClick={() => setActiveMarker(null)}
        >
          {/* Markers */}
          {markers.map((marker) => (
            <MarkerF
              key={marker.id} // Ensure the key is unique
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
            >
              {activeMarker?.id === marker.id && (
                <InfoWindow
                  position={marker.position}
                  onCloseClick={() => setActiveMarker(null)}
                >
                  <div>
                    <h4>{marker.content}</h4>
                  </div>
                </InfoWindow>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
      {/* Address List Below the Map */}
      <AddressList addresses={addresses} />
    </>
  );
}

export default CustomMap;
