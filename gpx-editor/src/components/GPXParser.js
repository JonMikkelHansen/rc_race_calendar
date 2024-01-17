import { calculateHaversineDistance } from '../Utilities';

const parseWaypoints = (xmlDoc) => {
    const waypoints = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');
    let totalDistance = 0;
    let lastLat = null;
    let lastLon = null;

    for (let i = 0; i < wptElements.length; i++) {
        const wpt = wptElements[i];
        const lat = parseFloat(wpt.getAttribute('lat'));
        const lon = parseFloat(wpt.getAttribute('lon'));

        if (isNaN(lat) || isNaN(lon)) {
            continue;
        }

        if (lastLat !== null && lastLon !== null) {
            totalDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
        }

        const elevation = parseFloat(wpt.getElementsByTagName('ele')[0]?.textContent) || null;
        const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Unnamed Waypoint';

        waypoints.push({
            latitude: lat,
            longitude: lon,
            elevation: elevation,
            name: name,
            distanceFromStart: parseFloat((totalDistance / 1000).toFixed(1))
        });

        lastLat = lat;
        lastLon = lon;
    }

    return waypoints;
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

            for (let k = 0; k < trkpts.length; k++) {
                const trkpt = trkpts[k];
                const lat = parseFloat(trkpt.getAttribute('lat'));
                const lon = parseFloat(trkpt.getAttribute('lon'));
                const elevation = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent) || null;

                if (!isNaN(lat) && !isNaN(lon)) {
                    trackpoints.push({ latitude: lat, longitude: lon, elevation: elevation });
                }
            }

            if (trackpoints.length > 0) {
                segments.push(trackpoints);
            }
        }

        if (segments.length > 0) {
            const name = trk.getElementsByTagName('name')[0]?.textContent || 'Unnamed Track';
            tracks.push({ name, segments });
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
    // This can be expanded based on specific needs
    return parseStandardGPX(xmlDoc);
};
