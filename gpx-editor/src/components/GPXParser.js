import { calculateHaversineDistance } from '../Utilities';
import { setMinY, setMaxY } from '../redux/actions/GPXActions';
import store from '../redux/store'; // Adjust this import based on your actual store path

const parseWaypoints = (xmlDoc) => {
    // ... existing waypoint parsing logic ...
};

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

const parseTracks = (xmlDoc) => {
    const tracks = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const trkElements = xmlDoc.getElementsByTagName('trk');

    for (let i = 0; i < trkElements.length; i++) {
        const trk = trkElements[i];
        const trksegs = trk.getElementsByTagName('trkseg');
        const segments = [];

        for (let j = 0; j < trksegs.length; j++) {
            const trkseg = trksegs[j];
            const trkpts = trkseg.getElementsByTagName('trkpt');
            const trackpoints = [];
            let segmentDistance = 0;
            let lastLat = null;
            let lastLon = null;

            for (let k = 0; k < trkpts.length; k++) {
                const trkpt = trkpts[k];
                const lat = parseFloat(trkpt.getAttribute('lat'));
                const lon = parseFloat(trkpt.getAttribute('lon'));
                let elevation = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent);

                if (!isNaN(lat) && !isNaN(lon)) {
                    if (isNaN(elevation)) {
                        console.log(`Invalid elevation found at trackpoint ${k + 1} in segment ${j + 1} of track ${i + 1}`);

                        let prevElevation = k > 0 ? trackpoints[k - 1].elevation : null;
                        let nextElevation = null;
                        if (k + 1 < trkpts.length) {
                            nextElevation = parseFloat(trkpts[k + 1].getElementsByTagName('ele')[0]?.textContent);
                            if (isNaN(nextElevation)) {
                                nextElevation = null;
                            }
                        }
                        elevation = calculateAverageElevation(prevElevation, nextElevation);

                        if (elevation != null) {
                            console.log(`Adjusted elevation at trackpoint ${k + 1} in segment ${j + 1} of track ${i + 1}: ${elevation}m`);
                        }
                    }

                    if (lastLat !== null && lastLon !== null) {
                        segmentDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
                    }

                    trackpoints.push({ 
                        latitude: lat, 
                        longitude: lon, 
                        elevation: elevation, 
                        distanceFromStart: segmentDistance 
                    });

                    lastLat = lat;
                    lastLon = lon;

                    if (elevation != null) {
                        minY = Math.min(minY, elevation);
                        maxY = Math.max(maxY, elevation);
                    }
                } else {
                    console.log(`Invalid trackpoint encountered in segment ${j + 1} of track ${i + 1}`);
                }
            }

            if (trackpoints.length > 0) {
                segments.push(trackpoints);
            } else {
                console.log(`Skipping segment ${j + 1} of track ${i + 1} due to no valid trackpoints`);
            }
        }

        if (segments.length > 0) {
            const name = trk.getElementsByTagName('name')[0]?.textContent || 'Unnamed Track';
            tracks.push({ name, segments });

            const lastSegment = segments[segments.length - 1];
            const lastPointDistance = lastSegment[lastSegment.length - 1].distanceFromStart;
            console.log(`Distance of the last point in track '${name}': ${lastPointDistance} meters`);
        } else {
            console.log(`Skipping track ${i + 1} due to no valid segments`);
        }
    }

    if (minY !== Number.POSITIVE_INFINITY && maxY !== Number.NEGATIVE_INFINITY) {
        store.dispatch(setMinY(Math.floor(minY / 100) * 100));
        store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));
    }

    return tracks;
};

export const parseStandardGPX = (xmlDoc) => {
    return {
        waypoints: parseWaypoints(xmlDoc),
        tracks: parseTracks(xmlDoc),
    };
};

export const parseCustomGPX = (xmlDoc) => {
    // Placeholder for custom GPX parsing logic
    // Currently, it just calls parseStandardGPX
    // This can be expanded in the future to handle specific custom GPX formats
    return parseStandardGPX(xmlDoc);
};
