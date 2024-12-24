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
  const [distance, setDistance] = useState(10); // State for slider
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

      fetch(`https://isawrisk.com/home/getNearbyLocationsApp?address=${encodedAddress}&lat=${encodedLat}&lng=${encodedLng}&hotline=${hotline ? 1 : 0}&range=${distance}`)
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
            url: location.url,
          }));
          setMarkers((prevMarkers) => [...prevMarkers, ...newMarkers]);
          setAddresses(data);
        })
        .catch((error) => console.error("Error fetching nearby locations:", error));
    } else {
      console.error("No address or coordinates selected.");
    }
  };

  const handleMarkerClick = (marker) => {
    // Toggle visibility of InfoWindow
    setActiveMarker(activeMarker?.id === marker.id ? null : marker);
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
            <span className="find-help-distance">
              <Box>
                <Slider
                  aria-label="Distance"
                  defaultValue={10}
                  getAriaValueText={valuetext}
                  valueLabelDisplay="on"
                  step={5}
                  marks={marks}
                  min={0}
                  max={25}
                  value={distance}
                  onChange={(e, value) => setDistance(value)} // Update slider state
                />
              </Box>
            </span>
          </div>
        </div>

        <Button
          variant="contained"
          color="primary"
          onClick={fetchNearbyLocations}
          disabled={!selectedAddress || !selectedCoordinates} // Disable button if no address is selected
        >
          Fetch Nearby Locations
        </Button>

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
      </LoadScript>
      <AddressList addresses={addresses} />
    </>
  );
}

export default CustomMap;