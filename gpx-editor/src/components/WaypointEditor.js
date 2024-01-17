import React, { useState } from 'react';

export const WaypointList = ({ waypoints, onEdit }) => {
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);

  const handleEditClick = (waypoint) => {
    setSelectedWaypoint(waypoint);
  };

  return (
    <div>
      <ol>
        {waypoints.map((wpt, index) => (
          (wpt.name && !wpt.name.startsWith('KM')) && (
            <li key={index}>
              {wpt.name} - {wpt.distance.toFixed(1)} km
              <button onClick={() => handleEditClick(wpt)}>Edit</button>
            </li>
          )
        ))}
      </ol>
      {selectedWaypoint && (
        <WaypointEditor waypoint={selectedWaypoint} onSave={onEdit} />
      )}
    </div>
  );
};

export const WaypointEditor = ({ waypoint, onSave }) => {
  const [name, setName] = useState(waypoint?.name || '');
  const [description, setDescription] = useState(waypoint?.description || '');
  const [height, setHeight] = useState(waypoint?.height || 0);
  const [distance, setDistance] = useState(waypoint?.distance || 0);
  const [type, setType] = useState(waypoint?.type || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedWaypoint = { ...waypoint, name, description, height, distance, type };
    onSave(updatedWaypoint);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form inputs for editing waypoint details */}
      {/* Name, Description, Height, Distance, Type */}
    </form>
  );
};

export default WaypointEditor;
