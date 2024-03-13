// GPXMap.js
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uaGFuc2VuIiwiYSI6ImNrdXF0cTBsazA2emkyb3A1YTQ4YmlyaXQifQ.FErbZ3mNRznm2BEDfpla_A';

const GPXMap = () => {
    const mapContainerRef = useRef(null);
    // Assuming trackpoints are stored in a similar structure as used in GPXProfile.js
    const trackpoints = useSelector((state) => state.trackpoints);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11', // Choose the style you prefer
            center: [0, 0], // This will be adjusted to fit the track
            zoom: 2,
        });

        map.on('load', () => {
            if (trackpoints.length > 0) {
                const geojsonData = {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: trackpoints.map(tp => [tp.longitude, tp.latitude]),
                        },
                        properties: {},
                    }],
                };

                map.addSource('track', {
                    type: 'geojson',
                    data: geojsonData,
                });

                map.addLayer({
                    id: 'track',
                    type: 'line',
                    source: 'track',
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#007cbf',
                        'line-width': 4,
                    },
                });

                // Fit map to track bounds
                const bounds = new mapboxgl.LngLatBounds();
                geojsonData.features[0].geometry.coordinates.forEach(coord => bounds.extend(coord));
                map.fitBounds(bounds, {
                    padding: 20,
                });
            }
        });

        return () => map.remove(); // Cleanup on unmount
    }, [trackpoints]); // Dependency array includes trackpoints to update map when they change

    return <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />;
};

export default GPXMap;
