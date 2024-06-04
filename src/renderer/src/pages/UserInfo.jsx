import { useState, useEffect } from 'react';

const UserInfo = () => {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    async function fetchData() {
      const storedEmail = await window.context.storeGet('email');
      const storedPhone = await window.context.storeGet('phone');
      setEmail(storedEmail || '');
      setPhone(storedPhone || '');
    }
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    await window.context.storeSet('email', email);
    await window.context.storeSet('phone', phone);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Information</h2>
      <div className="mb-4">
        <label className="block mb-2">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Phone:</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      <button onClick={handleSaveSettings} className="bg-blue-500 text-white p-2 rounded">
        Save Settings
      </button>
    </div>
  );
};

export default UserInfo;
