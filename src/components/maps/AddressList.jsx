import React from "react";
import '../../assets/css/AddressList.css';
import { Phone, LocationOn, Language, QueryBuilder, Route } from '@mui/icons-material';

function AddressList({ addresses, onAddressClick }) {
    return (
        <div>
            {addresses.length === 0 ? (
                <p>No addresses found. Search to see results.</p>
            ) : (
                <ul className="addressblock">
                    {addresses
                        .filter((location) => location.name && location.name.trim() !== "")
                        .map((location, index) => (
                            <li key={index} onClick={() => onAddressClick(location)}>
                                <div className="locationname">{location.name} </div>
                                <div className="servicename">{location.program} </div>
                                <div className="contactnumber">
                                    <Phone className="icon-colors"/> {location.contactNumber}
                                </div>
                                <div className="address">
                                    <LocationOn className="icon-colors"/> {location.address}
                                </div>
                                <div className="openhours">
                                    <QueryBuilder className="icon-colors"/>{location.openHours}
                                </div>
                                <div className="website">{" "}
                                    <Language className="icon-colors"/>
                                    <a href={`https://${location.url}`} target="_blank" rel="noopener noreferrer">
                                        {location.url}
                                    </a>{" "}
                                </div>
                                <div className="distance">
                                <Route className="icon-colors"/>{location.distance}
                                </div>
                            </li>
                        ))}
                </ul>
            )}
        </div>
    );
}

export default AddressList;