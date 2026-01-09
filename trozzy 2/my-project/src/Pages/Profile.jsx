import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
    },
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  useEffect(() => {
    const a = user?.address || {};
    setProfileForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      address: {
        line1: a.line1 || '',
        line2: a.line2 || '',
        city: a.city || '',
        state: a.state || '',
        postalCode: a.postalCode || '',
        country: a.country || '',
      },
    });
  }, [user]);

  const onProfileChange = (key, value) => {
    setProfileForm((p) => ({ ...p, [key]: value }));
  };

  const onAddressChange = (key, value) => {
    setProfileForm((p) => ({ ...p, address: { ...p.address, [key]: value } }));
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    setProfileMsg('');
    try {
      const res = await apiClient.put('/auth/me', {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        address: profileForm.address,
      });
      const updated = res?.data?.data;
      if (updated) {
        updateUser(updated);
      }
      setProfileMsg('Profile updated successfully');
    } catch (e) {
      setProfileMsg('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setSavingPassword(true);
    setPasswordMsg('');
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        setPasswordMsg('Please fill current and new password');
        return;
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        setPasswordMsg('New password and confirm password do not match');
        return;
      }
      await apiClient.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('Password updated successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (e) {
      setPasswordMsg('Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">First Name</p>
            <input
              value={profileForm.firstName}
              onChange={(e) => onProfileChange('firstName', e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Last Name</p>
            <input
              value={profileForm.lastName}
              onChange={(e) => onProfileChange('lastName', e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-base font-medium text-gray-900">{user?.email || '-'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <input
              value={profileForm.phone}
              onChange={(e) => onProfileChange('phone', e.target.value)}
              className="mt-1 w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Address Line 1</p>
              <input value={profileForm.address.line1} onChange={(e) => onAddressChange('line1', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Address Line 2</p>
              <input value={profileForm.address.line2} onChange={(e) => onAddressChange('line2', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">City</p>
              <input value={profileForm.address.city} onChange={(e) => onAddressChange('city', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">State</p>
              <input value={profileForm.address.state} onChange={(e) => onAddressChange('state', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Postal Code</p>
              <input value={profileForm.address.postalCode} onChange={(e) => onAddressChange('postalCode', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Country</p>
              <input value={profileForm.address.country} onChange={(e) => onAddressChange('country', e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
            {profileMsg ? <p className="text-sm text-gray-600">{profileMsg}</p> : null}
          </div>
        </div>

        <div className="mt-10 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Current Password</p>
              <input type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">New Password</p>
              <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirm New Password</p>
              <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={changePassword}
              disabled={savingPassword}
              className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-black disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
            {passwordMsg ? <p className="text-sm text-gray-600">{passwordMsg}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
