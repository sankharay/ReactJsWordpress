import { useState } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindow, Autocomplete } from "@react-google-maps/api";
import AddressList from "./AddressList";
import '../../assets/css/CustomMap.css';
import { Info, LocationOn, Search, Place, Language, Phone, QueryBuilder } from '@mui/icons-material';
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

const mapOptions = {
  streetViewControl: false, 
  mapTypeControl: false, 
  fullscreenControl: false, 
};

function CustomMap() {
  const [activeMarker, setActiveMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;


  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const { lat, lng } = place.geometry.location;
        const address = place.formatted_address;

        fetchNearbyLocations(address, lat(), lng());

        setMarkers((prevMarkers) => [
          ...prevMarkers,
          {
            id: `custom-${Date.now()}`,
            position: { lat: lat(), lng: lng() },
            content: `Selected Address: ${address}`,
          },
        ]);
      }
    }
  };

  const fetchNearbyLocations = (address, lat, lng) => {
    const encodedAddress = encodeURIComponent(address);
    const encodedLat = encodeURIComponent(lat);
    const encodedLng = encodeURIComponent(lng);

    fetch(`https://isawrisk.com/home/getNearbyLocationsApp?address=${encodedAddress}&lat=${encodedLat}&lng=${encodedLng}&hotline=0&range=20`)
      .then((response) => response.json())
      .then((data) => {
        const newMarkers = data.map((location, index) => ({
          id: `api-${location.name}-${index}`,
          position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
          name: location.name,
          program: location.program,
          contactNumber: location.contactNumber,
          address: location.address,
          openHours: location.openHours,
          url: location.url
        }));
        setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
        setAddresses(data);
      })
      .catch((error) => console.error("Error fetching nearby locations:", error));
  };

  const handleMarkerClick = (marker) => {
    // Toggle visibility of InfoWindow
    setActiveMarker(activeMarker?.id === marker.id ? null : marker);
  };

  return (
    <>
      <LoadScript
        googleMapsApiKey= {googleMapsApiKey}
        libraries={["places"]}
      >
        <div className="autocomplete-container">
          <div className="find-help-block-language"><Language className="icon-colors-top" />English</div>
          <div className="find-help-block-header"><Info className="icon-colors-top" />Find Help</div>
          <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceChanged}>
            <Input
              type="text"
              className="findaddress"
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
          onClick={() => setActiveMarker(null)} // Close InfoWindow when map is clicked
          options={mapOptions}
        >
          {markers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={marker.position}
              onClick={() => handleMarkerClick(marker)}
            >
              {activeMarker?.id === marker.id && (
                <InfoWindow
                  position={marker.position}
                  onCloseClick={() => setActiveMarker(null)} // Close the InfoWindow when close is clicked
                >
                  <div className="marker_addressblock">
                  <ul>
                      <li className="title">{marker.name}</li>
                      <li><Phone className="icon-colors"/> {marker.contactNumber}</li>
                      <li><LocationOn className="icon-colors"/> {marker.address}</li>
                      <li><QueryBuilder className="icon-colors"/> {marker.openHours}</li>
                      <li>
                        {" "}
                          <Language className="icon-colors"/>
                          <a href={`https://${marker.url}`} target="_blank" rel="noopener noreferrer">
                              {marker.url}
                          </a>{" "}
                      </li>
                  </ul>
                  </div>
                </InfoWindow>
              )}
            </MarkerF>
          ))}
        </GoogleMap>
      </LoadScript>
      <AddressList addresses={addresses} />
    </>
  );
}

export default CustomMap;