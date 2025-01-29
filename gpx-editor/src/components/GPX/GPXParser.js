import { v4 as uuidv4 } from 'uuid';
import { calculateHaversineDistance, interpolateTrackpointData } from '../../Utilities'; // Ensure interpolateTrackpointData is implemented correctly
import { setMinY, setMaxY, setTrackpoints, setWaypoints, setStageTitle, setTrackpointGeoJSON, setWaypointGeoJSON } from '../../redux/actions/GPXActions';
import store from '../../redux/store';
import { createTrackpointGeoJSON, createWaypointGeoJSON } from './GeoJParser'; // Adjust the path as necessary

// FIRST WE PARSE THE TRACKPOINTS (TRK) FROM THE GPX FILE
const parseTracks = (xmlDoc) => {
    const tracks = [];
    let minY = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    const trkElements = xmlDoc.getElementsByTagName('trk');
    let trackpointIdCounter = 0;
    const allTrackpoints = [];

    // WE ITERATE OVER ALL TRACKS
    for (let i = 0; i < trkElements.length; i++) {
        const trk = trkElements[i];
        const trksegs = trk.getElementsByTagName('trkseg');

        // WE ITERATE OVER ALL TRACKSEGMENTS
        for (let j = 0; j < trksegs.length; j++) {
            const trkseg = trksegs[j];
            const trkpts = trkseg.getElementsByTagName('trkpt');
            let segmentDistance = 0;
            let lastLat = null;
            let lastLon = null;

            // WE ITERATE OVER ALL TRACKPOINTS
            for (let k = 0; k < trkpts.length; k++) {
                const trkpt = trkpts[k];
                const lat = parseFloat(trkpt.getAttribute('lat'));
                const lon = parseFloat(trkpt.getAttribute('lon'));
                let elevation = parseFloat(trkpt.getElementsByTagName('ele')[0]?.textContent);

                if (!isNaN(lat) && !isNaN(lon)) {
                    if (isNaN(elevation)) {
                        elevation = calculateAverageElevation(
                            k > 0 ? parseFloat(trkpts[k - 1].getElementsByTagName('ele')[0]?.textContent) : null,
                            k + 1 < trkpts.length ? parseFloat(trkpts[k + 1].getElementsByTagName('ele')[0]?.textContent) : null
                        );
                    }

                    // WE CALCULATE THE DISTANCE FROM THE LAST TRACKPOINT
                    if (lastLat !== null && lastLon !== null) {
                        segmentDistance += calculateHaversineDistance(lastLat, lastLon, lat, lon);
                    }
                    
                    // WE CALCULATE THE DISTANCE FROM START IN KILOMETRES WITH THREE DIGUTS, EFFECTIVELY ROUNDING TO THE NEAREST METRE
                    const distanceFromStart = +(segmentDistance / 1000).toFixed(3);

                    // WE PUSH THE TRACKPOINT TO THE ALLTRACKPOINTS ARRAY
                    allTrackpoints.push({
                        id: `trackpoint-${trackpointIdCounter++}`,
                        lat: lat,
                        lon: lon,
                        elevation,
                        distanceFromStart,
                        //isWaypoint: false, // Initialize all trackpoints with isWaypoint set to false
                        //waypointID: null // Initialize waypointID as null
                    });

                    // WE UPDATE THE LAST LATITUDE AND LONGITUDE
                    lastLat = lat;
                    lastLon = lon;

                    // WE UPDATE THE MINIMUM AND MAXIMUM ELEVATION
                    minY = Math.min(minY, elevation ?? minY);
                    maxY = Math.max(maxY, elevation ?? maxY);
                }
            }
        }
    }

    // WE DISPATCH THE TRACKPOINTS AND THE MINIMUM AND MAXIMUM ELEVATION TO THE REDUX STORE
    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));

    // WE RETURN THE TRACKS, ALL TRACKPOINTS, THE MINIMUM ELEVATION, AND THE MAXIMUM ELEVATION
    return { /*tracks,*/ allTrackpoints, minY, maxY };
};

const calculateAverageElevation = (prevElevation, nextElevation) => {
    if (prevElevation != null && nextElevation != null) {
        return (prevElevation + nextElevation) / 2;
    }
    return null;
};

const parseWaypoints = (xmlDoc, allTrackpoints) => { // Added allTrackpoints as parameter for dependency
    const waypoints = [];
    const wptElements = xmlDoc.getElementsByTagName('wpt');
    for (let i = 0; i < wptElements.length; i++) {
        const wpt = wptElements[i];
        const lat = parseFloat(wpt.getAttribute('lat'));
        const lon = parseFloat(wpt.getAttribute('lon'));
        const name = wpt.getElementsByTagName('name')[0]?.textContent || 'Unnamed Waypoint';
         // Skip waypoints with names starting with "KM_"
        if (name.startsWith("KM_")) continue;
        const desc = wpt.getElementsByTagName('desc')[0]?.textContent;
        const type = wpt.getElementsByTagName('type')[0]?.textContent || null;

        // Additional attributes like 'distanceFromStart' and 'elevation' are parsed here if provided

        waypoints.push({
            id: uuidv4(),
            lat: lat,
            lon: lon,
            name,
            description: desc,
            type: type,
            elevation: undefined, // To be interpolated or updated
            distanceFromStart: undefined // To be calculated or updated
        });
    }
    return waypoints;
};

const assignDistanceToWaypoints = (waypoints, trackpoints) => {
    waypoints.forEach(waypoint => {
        trackpoints.forEach(trackpoint => {
            const distance = calculateHaversineDistance(waypoint.lat, waypoint.lon, trackpoint.lat, trackpoint.lon);
            // Consider a very small distance to account for GPS inaccuracies
            if (distance < 0.05) { // Adjust this threshold based on your accuracy requirements
                // trackpoint.isWaypoint = true;
                // trackpoint.waypointID = waypoint.id;
                // Update waypoint with trackpoint information
                waypoint.distanceFromStart = trackpoint.distanceFromStart;
                waypoint.elevation = trackpoint.elevation;
            }
        });
    });
};

/*
const ensureWaypointTrackpointPairs = (waypoints, allTrackpoints) => {
    waypoints.forEach(waypoint => {
        // Find an existing trackpoint with the same distanceFromStart.
        const trackpointIndex = allTrackpoints.findIndex(tp => tp.distanceFromStart === waypoint.distanceFromStart);
        
        if (trackpointIndex !== -1) {
            // If found, update the existing trackpoint with waypoint's data.
            allTrackpoints[trackpointIndex] = {
                ...allTrackpoints[trackpointIndex],
                lat: waypoint.lat,
                lon: waypoint.lon,
                elevation: waypoint.elevation,
                //isWaypoint: true,
                //waypointID: waypoint.id,
            };
        } else {
            // If not found, create and add a new trackpoint for this waypoint.
            allTrackpoints.push({
                id: uuidv4(),
                lat: waypoint.lat,
                lon: waypoint.lon,
                elevation: waypoint.elevation,
                distanceFromStart: waypoint.distanceFromStart,
                //isWaypoint: true,
                //waypointID: waypoint.id,
            });
        }
    });

    // Sort the allTrackpoints array by distanceFromStart after modification.
    allTrackpoints.sort((a, b) => a.distanceFromStart - b.distanceFromStart);
};
*/

export const parseStandardGPX = (xmlDoc) => {
    const { allTrackpoints, minY, maxY } = parseTracks(xmlDoc);
    const waypoints = parseWaypoints(xmlDoc, allTrackpoints);

    assignDistanceToWaypoints(waypoints, allTrackpoints);
    // ensureWaypointTrackpointPairs(waypoints, allTrackpoints);

    // Check if waypoints are empty or not, if so, add default start and end waypoints
    if (waypoints.length === 0 && allTrackpoints.length > 0) {
        const firstTrackpoint = allTrackpoints[0];
        const lastTrackpoint = allTrackpoints[allTrackpoints.length - 1];
        waypoints.push({
            id: uuidv4(),
            lat: firstTrackpoint.lat,
            lon: firstTrackpoint.lon,
            name: "Start of route",
            description: "",
            type: "start",
            elevation: firstTrackpoint.elevation,
            distanceFromStart: 0
        });
        waypoints.push({
            id: uuidv4(),
            lat: lastTrackpoint.lat,
            lon: lastTrackpoint.lon,
            name: "End of route",
            description: "",
            type: "end",
            elevation: lastTrackpoint.elevation,
            distanceFromStart: lastTrackpoint.distanceFromStart
        });
    }

    // Creating GeoJSON objects for trackpoints and waypoints
    const trackpointGeoJSON = createTrackpointGeoJSON(allTrackpoints);
    const waypointGeoJSON = createWaypointGeoJSON(waypoints);

    // Dispatching GeoJSON to the Redux store
    store.dispatch(setTrackpointGeoJSON(trackpointGeoJSON));
    store.dispatch(setWaypointGeoJSON(waypointGeoJSON));


    const trkElements = xmlDoc.getElementsByTagName('trk');
    let stageTitle = 'Unknown';
    if (trkElements.length > 0 && trkElements[0].getElementsByTagName('name')[0]) {
        stageTitle = trkElements[0].getElementsByTagName('name')[0].textContent;
    }

    store.dispatch(setStageTitle(stageTitle));
    store.dispatch(setMinY(Math.floor(minY / 100) * 100));
    store.dispatch(setMaxY(Math.ceil(maxY / 100) * 100));
    store.dispatch(setTrackpoints(allTrackpoints));
    store.dispatch(setWaypoints(waypoints));

    return { waypoints, allTrackpoints, minY, maxY };
};

export const parseCustomGPX = (xmlDoc) => {
    return parseStandardGPX(xmlDoc);
};