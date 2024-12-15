import React from 'react';

const MarkerInfoWindow = ({ marker, onClose }) => {
  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white p-4 border border-gray-300 shadow-lg rounded-md z-50">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
        &times;
      </button>
      <h4 className="font-bold mb-2">{marker.content}</h4>
      <p className="mb-1">Address: {marker.address}</p>
      <p className="mb-1">Phone: {marker.phone}</p>
      <p>
        Website:{' '}
        <a
          href={marker.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700"
        >
          {new URL(marker.website).hostname}
        </a>
      </p>
    </div>
  );
};

export default MarkerInfoWindow;