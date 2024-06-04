import React, { useState, useEffect } from 'react';

const CameraManagement = () => {
  const [cameraIp, setCameraIp] = useState('');
  const [cameras, setCameras] = useState([]);
  const [currentStream, setCurrentStream] = useState('');

  useEffect(() => {
    async function fetchData() {
      const storedCameras = await window.context.storeGet('cameras') || [];
      setCameras(storedCameras);
    }
    fetchData();
  }, []);

  const handleAddCamera = async () => {
    const newCameras = [...cameras, cameraIp];
    setCameras(newCameras);
    await window.context.storeSet('cameras', newCameras);
    setCameraIp('');
  };

  const handleStartStream = async (ip) => {
    const streamUrl = await window.context.startStream(ip);
    setCurrentStream(streamUrl);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Camera Management</h2>
      <div className="mb-4">
        <label className="block mb-2">Camera IP:</label>
        <input
          type="text"
          value={cameraIp}
          onChange={(e) => setCameraIp(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <button onClick={handleAddCamera} className="bg-blue-500 text-white p-2 rounded">
        Add Camera
      </button>
      <div className="mt-4">
        <h3 className="text-xl font-semibold">Added Cameras</h3>
        <ul className="list-disc list-inside">
          {cameras.map((ip, index) => (
            <li key={index}>
              {ip} <button onClick={() => handleStartStream(ip)} className="ml-2 bg-green-500 text-white p-1 rounded">Stream</button>
            </li>
          ))}
        </ul>
      </div>
      {currentStream && (
        console.log(`Current Stream: ${currentStream}`),
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Current Stream</h3>
          <video id="video" controls width="100%">
            <source src={currentStream} type="application/vnd.apple.mpegurl" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      )}
    </div>
  );
};

export default CameraManagement;
