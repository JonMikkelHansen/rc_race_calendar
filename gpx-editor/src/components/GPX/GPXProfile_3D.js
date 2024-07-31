// GPXProfile_3D.js
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const GPXProfile_3D = () => {
  const containerRef = useRef();
  const trackpointGeoJSON = useSelector(state => state.trackpointGeoJSON);

  useEffect(() => {
    if (!trackpointGeoJSON || !trackpointGeoJSON.features.length) {
      console.log('No trackpointGeoJSON data available');
      return;
    }

    const coordinates = trackpointGeoJSON.features[0].geometry.coordinates;
    const scene = new THREE.Scene();
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    const geometry = new THREE.BufferGeometry();
    const positions = [];

    let cumulativeDistance = 0;
    const haversineDistance = (coords1, coords2) => {
      const [lon1, lat1] = coords1;
      const [lon2, lat2] = coords2;
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    coordinates.forEach(([lon, lat, elevation], index) => {
      if (index > 0) {
        cumulativeDistance += haversineDistance(coordinates[index - 1], [lon, lat]);
      }
      positions.push(cumulativeDistance, elevation, 0); // x (distance), y (elevation), z (fixed at 0)
    });

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5).normalize();
    scene.add(light);

    camera.position.z = 100;
    camera.position.y = 50;

    const animate = function () {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      controls.dispose();
    };
  }, [trackpointGeoJSON]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default GPXProfile_3D;