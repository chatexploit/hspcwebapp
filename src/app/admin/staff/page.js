'use client';
import { useState, useEffect } from 'react';

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [roles, setRoles] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '', email: '', password: '', phone: '', base_salary: '', role_id: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = () => {
    const token = localStorage.getItem('token');
    fetch('/api/admin/staff', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.staff) setStaff(data.staff);
        if (data.roles) setRoles(data.roles);
      })
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStaff)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Staff member added successfully!');
        setNewStaff({ name: '', email: '', password: '', phone: '', base_salary: '', role_id: '' });
        fetchStaff();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage('Failed to add staff.');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Staff Management</h1>

      {message && <div className="mb-4 p-2 bg-blue-100 text-blue-800">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Add New Staff</h2>
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-4 rounded shadow-sm">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" required name="name" value={newStaff.name} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input type="email" required name="email" value={newStaff.email} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Password</label>
              <input type="password" required name="password" value={newStaff.password} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input type="text" name="phone" value={newStaff.phone} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Base Salary</label>
              <input type="number" step="0.01" name="base_salary" value={newStaff.base_salary} onChange={handleChange} className="mt-1 block w-full border rounded p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Role</label>
              <select required name="role_id" value={newStaff.role_id} onChange={handleChange} className="mt-1 block w-full border rounded p-2">
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded w-full">Add Staff</button>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Staff List</h2>
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2">Name</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Salary</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="p-2">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-500">{s.email}</div>
                    </td>
                    <td className="p-2">{s.role_name}</td>
                    <td className="p-2">{s.base_salary ? `₹${s.base_salary}` : '-'}</td>
                  </tr>
                ))}
                {staff.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-4 text-center text-gray-500">No staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
