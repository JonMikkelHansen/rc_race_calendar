// GPXMap.js
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useSelector } from 'react-redux';

mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uaGFuc2VuIiwiYSI6ImNrdXF0cTBsazA2emkyb3A1YTQ4YmlyaXQifQ.FErbZ3mNRznm2BEDfpla_A';

const GPXMap = () => {
    const mapContainerRef = useRef(null);
    const trackpoints = useSelector((state) => state.trackpoints); // Ensure this selector is correct

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11', // Preferable map style
            center: [0, 0], // Initial center, will be adjusted later
            zoom: 2, // Initial zoom
        });

        const resizeMap = () => map.resize(); // Function to resize the map

        map.on('load', () => {
            resizeMap(); // Trigger resize after the map is loaded to ensure tiles load correctly

            if (trackpoints.length > 0) {
                const geojsonData = {
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        geometry: {
                            type: "LineString",
                            coordinates: trackpoints.map(tp => [tp.longitude, tp.latitude]),
                        },
                    }],
                };

                // Adding the source and the layer for the track
                map.addSource('track', { type: 'geojson', data: geojsonData });
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

                // Calculate bounds from the trackpoints and fit the map to these bounds
                const bounds = new mapboxgl.LngLatBounds();
                trackpoints.forEach(tp => bounds.extend(new mapboxgl.LngLat(tp.longitude, tp.latitude)));
                map.fitBounds(bounds, { padding: 20 }); // Adjust the view to the track
            }
        });

        // Set up ResizeObserver to ensure the map resizes with the container
        const resizeObserver = new ResizeObserver(() => resizeMap());
        resizeObserver.observe(mapContainerRef.current);

        // Clean up on unmount
        return () => {
            if (map) {
                map.remove();
            }
            resizeObserver.unobserve(mapContainerRef.current);
        };
    }, [trackpoints]); // Dependency array for re-running the effect when trackpoints change

    // The aspect ratio for 16:9 would be 56.25% (9 / 16 = 0.5625)
    return <div ref={mapContainerRef} style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }} />;
};

export default GPXMap;
