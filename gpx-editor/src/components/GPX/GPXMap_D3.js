import React, { useEffect, useRef } from 'react';
import { convertTrackpointsToGeoJSON, convertWaypointsToGeoJSON, combineGeoJSONFeatures } from '../../Utilities';
import L from 'leaflet';
import 'leaflet.heightgraph';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
/* Add this to your existing styled-components */
const MapContainerDiv = styled.div`
  height: 400px; /* or any other fixed height */
  width: 100%;
`;

const GPXMap_D3 = () => {
    const trackpoints = useSelector(state => state.trackpoints); // Ensure this selector is correct
    const waypoints = useSelector(state => state.waypoints); // Assuming you have waypoints in your Redux store
    const mapRef = useRef(null);

    const Heightgraph = () => {
        const map = useMap();

        useEffect(() => {
            if (map && trackpoints.length > 0 && activeProfileMapComponent === 'map') {
                // Use the combined GeoJSON for trackpoints and waypoints
                const combinedGeoJSON = combineGeoJSONFeatures(trackpoints, waypoints);
                
                // Log the combined GeoJSON to inspect its structure
                console.log("Combined GeoJSON:", JSON.stringify(combinedGeoJSON, null, 2));

                // Initialize the Heightgraph control if it doesn't already exist
                if (!mapRef.current) {
                    mapRef.current = new L.Control.Heightgraph({
                        width: 800,
                        height: 200,
                        margins: {
                            top: 10,
                            right: 30,
                            bottom: 55,
                            left: 50
                        },
                        position: "bottomright",
                    });
                    mapRef.current.addTo(map);
                }

                // Add data to the Heightgraph plugin
                try {
                    mapRef.current.addData([combinedGeoJSON]);

                    // Create a Leaflet GeoJSON layer (but do not add it to the map)
                    // to use for getting the bounds to fit the map view
                    const geoJSONLayer = L.geoJSON(combinedGeoJSON);

                    // Fit the map's view to the bounds of the GeoJSON data with padding
                    map.fitBounds(geoJSONLayer.getBounds(), {
                        padding: [50, 50] // Adjust padding as needed
                    });
                    map.invalidateSize();
                } catch (error) {
                    console.error("Error adding data to Heightgraph:", error);
                }
            }
        }, [map, trackpoints, waypoints]); // Add waypoints as a dependency

        return null;
    };

    // Specify a fallback center and zoom for the initial render
    const fallbackCenter = [0, 0]; // Default to (0, 0) or your preferred starting location
    const fallbackZoom = 2; // Default zoom level

// Inside your GPXMap_D3 component
    return (
        <MapContainerDiv>
        <MapContainer center={[0, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Heightgraph />
        </MapContainer>
        </MapContainerDiv>
    );
  
};

export default GPXMap_D3;
