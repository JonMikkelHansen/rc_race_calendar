import { calculateHaversineDistance } from '../Utilities';

const parseWaypoints = (xmlDoc) => {
    // ... existing waypoint parsing logic ...
};

const parseTracks = (xmlDoc) => {
    const tracks = [];
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
                const elevation = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent) || null;

                if (!isNaN(lat) && !isNaN(lon)) {
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
                }
            }

            if (trackpoints.length > 0) {
                segments.push(trackpoints);
            }
        }

        if (segments.length > 0) {
            const name = trk.getElementsByTagName('name')[0]?.textContent || 'Unnamed Track';
            tracks.push({ name, segments });

            // Log the distance of the last point in the last segment of the track
            const lastSegment = segments[segments.length - 1];
            const lastPointDistance = lastSegment[lastSegment.length - 1].distanceFromStart;
            console.log(`Distance of the last point in track '${name}': ${lastPointDistance} meters`);
        }
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
    // Custom parsing logic for GPX files with extensions
    return parseStandardGPX(xmlDoc);
};
