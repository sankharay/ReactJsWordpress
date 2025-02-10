import { useState } from "react";
import { GoogleMap, LoadScript, MarkerF, InfoWindow, Autocomplete } from "@react-google-maps/api";
import AddressList from "./AddressList";
import '../../assets/css/CustomMap.css';
import { Info, LocationOn, Search, Place, Language, Phone, QueryBuilder } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import GridViewIcon from '@mui/icons-material/GridView';
import CircularProgress from '@mui/material/CircularProgress'; // For loader

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

function valuetext(value) {
  return `${value} Miles`;
}

function CustomMap() {
  const [activeMarker, setActiveMarker] = useState(null);
  const [autocomplete, setAutocomplete] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState(null); // State for green balloon
  const [hotline, setHotline] = useState(false); // State for checkbox
  const [distance, setDistance] = useState(5); // Default to 5 miles
  const [isLoading, setIsLoading] = useState(false); // State for loader visibility
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const handlePlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const { lat, lng } = place.geometry.location;
        const address = place.formatted_address;

        // Create a unique marker ID for the selected address
        const newMarkerId = `custom-${Date.now()}`;

        // Store the selected address and coordinates
        setSelectedAddress(address);
        setSelectedCoordinates({ lat: lat(), lng: lng() });
        setSelectedMarkerId(newMarkerId);

        // Update the map center to the selected place
        setMarkers((prevMarkers) => [
          ...prevMarkers,
          {
            id: newMarkerId,
            position: { lat: lat(), lng: lng() },
            content: `Selected Address: ${address}`,
          },
        ]);
      }
    }
  };

  const fetchNearbyLocations = () => {
    if (selectedAddress && selectedCoordinates) {
      const encodedAddress = encodeURIComponent(selectedAddress);
      const encodedLat = encodeURIComponent(selectedCoordinates.lat);
      const encodedLng = encodeURIComponent(selectedCoordinates.lng);

      setIsLoading(true); // Show loader when fetching locations

      fetch(`https://isawrisk.com/home/getNearbyLocationsApp?address=${encodedAddress}&lat=${encodedLat}&lng=${encodedLng}&hotline=${hotline ? 1 : 0}&range=${distance}`)
        .then((response) => response.json())
        .then((data) => {
          // Clear existing markers before adding new ones
          const newMarkers = data.map((location, index) => ({
            id: `api-${location.name}-${index}`,
            position: { lat: parseFloat(location.lat), lng: parseFloat(location.lng) },
            name: location.name,
            program: location.program,
            contactNumber: location.contactNumber,
            address: location.address,
            openHours: location.openHours,
            url: location.url,
          }));

          // Clear old markers and set new ones
          setMarkers(newMarkers);
          setAddresses(data);
        })
        .catch((error) => console.error("Error fetching nearby locations:", error))
        .finally(() => setIsLoading(false)); // Hide loader after fetching
    } else {
      console.error("No address or coordinates selected.");
    }
  };

  const handleMarkerClick = (marker) => {
    // Toggle visibility of InfoWindow
    setActiveMarker(activeMarker?.id === marker.id ? null : marker);
  };

  const handleAddressClick = (location) => {
    // Find the marker corresponding to the clicked address
    const marker = markers.find((marker) => marker.address === location.address);
    if (marker) {
      setSelectedMarkerId(marker.id); // Set the selected marker
      setSelectedCoordinates(marker.position); // Center map on selected marker
      setActiveMarker(marker); // Open InfoWindow
    }
  };

  const marks = [
    {
      value: 0,
      label: '0 Miles',
    },
    {
      value: 25,
      label: '25 Miles',
    },
  ];

  return (
    <>
      <LoadScript
        googleMapsApiKey={googleMapsApiKey}
        libraries={["places"]}
      >
        <div className="autocomplete-container">
          <div className="top-header-block">
          <div className="menu-block-header"><GridViewIcon className="icon-colors-top" />Menu</div>
            <div className="find-help-block-header"><Info className="icon-colors-top" />Find Help</div>
            <div className="find-help-block-language"><Language className="icon-colors-top" />ENGLISH</div>
          </div>
          <Autocomplete onLoad={(auto) => setAutocomplete(auto)} onPlaceChanged={handlePlaceChanged}>
            <Input
              type="text"
              className="findaddress"
              id="input-with-icon-adornment"
              placeholder="enter your postel code"
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

            <span className="find-help-distance">
              <div className="top-slider-text">only show me listing within a specific distance</div>
              <Box sx={{ height: 50 }}>
                <Slider
                  aria-label="Distance"
                  defaultValue={5}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="on"
                  step={5}
                  marks={marks}
                  min={5}
                  max={25}
                  value={distance}
                  onChange={(e, value) => setDistance(value)}
                />
              </Box>
            </span>
            <span className="find-help-hotline">
              <input
                type="checkbox"
                name="hotline"
                className="hotline-checkbox"
                checked={hotline}
                onChange={(e) => setHotline(e.target.checked)} // Update checkbox state
              />
              24/7 HOTLINE
            </span>
          </div>
        </div>
        <div className="map-search-button-container">
          <Button
          size="large"
            variant="contained"
            color="primary primarybutton searchbutton"
            onClick={fetchNearbyLocations}
            disabled={!selectedAddress || !selectedCoordinates} // Disable button if no address is selected
          >
            Search
          </Button>
        </div>

        {/* Loader */}
        {isLoading && (
          <div className="loader-container">
            <CircularProgress />
          </div>
        )}
        <div className="google-map-container">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={selectedCoordinates || center} // Update map center when a new address is selected
            zoom={10}
            onClick={() => setActiveMarker(null)} // Close InfoWindow when map is clicked
            options={mapOptions}
          >
            {markers.map((marker) => (
              <MarkerF
                key={marker.id}
                position={marker.position}
                onClick={() => handleMarkerClick(marker)}
                icon={{
                  url: marker.id === selectedMarkerId
                    ? "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
                    : "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  scaledSize: new window.google.maps.Size(40, 40), // Adjust icon size if needed
                }}
                animation={
                  marker.id === selectedMarkerId
                    ? window.google.maps.Animation.BOUNCE
                    : null
                }
              >
                {activeMarker?.id === marker.id && (
                  <InfoWindow
                    position={marker.position}
                    onCloseClick={() => setActiveMarker(null)} // Close the InfoWindow when close is clicked
                  >
                    <div className="marker_addressblock">
                      <ul>
                        <li className="title">{marker.name}</li>
                        <li><Phone className="icon-colors" /> {marker.contactNumber}</li>
                        <li><LocationOn className="icon-colors" /> {marker.address}</li>
                        <li><QueryBuilder className="icon-colors" /> {marker.openHours}</li>
                        <li>
                          {" "}
                          <Language className="icon-colors" />
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
        </div>
      </LoadScript>
      <AddressList addresses={addresses} onAddressClick={handleAddressClick} />
    </>
  );
}

export default CustomMap;