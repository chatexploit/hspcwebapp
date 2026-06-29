'use client';
import { useState, useEffect } from 'react';

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    gst_enabled: false,
    razorpay_enabled: false,
    razorpay_key: '',
    razorpay_secret: '',
    travel_rate_per_km: 3.00,
    company_name: '',
    company_logo_url: '',
    company_address: '',
    company_gstin: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    // In a real app, retrieve token from state or cookie
    const token = localStorage.getItem('token');
    fetch('/api/admin/settings', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.settings) setSettings(data.settings);
      })
      .catch(err => console.error(err));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Settings updated successfully!');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to update settings.');
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      {message && <div className="mb-4 p-2 bg-primary-50 text-primary-800">{message}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="gst_enabled" checked={settings.gst_enabled || false} onChange={handleChange} />
            <span>Enable GST</span>
          </label>
        </div>
        <div>
          <label className="flex items-center space-x-2">
            <input type="checkbox" name="razorpay_enabled" checked={settings.razorpay_enabled || false} onChange={handleChange} />
            <span>Enable Razorpay</span>
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium">Travel Rate Per KM</label>
          <input type="number" step="0.01" name="travel_rate_per_km" value={settings.travel_rate_per_km || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Company Name</label>
          <input type="text" name="company_name" value={settings.company_name || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Company Address</label>
          <textarea name="company_address" value={settings.company_address || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Company GSTIN</label>
          <input type="text" name="company_gstin" value={settings.company_gstin || ''} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
        </div>
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">Save Settings</button>
      </form>
    </div>
  );
}
