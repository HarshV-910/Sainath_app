

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import { User } from '../../../types';
import Modal from '../../../components/common/Modal';

const HostProfile: React.FC = () => {
  const { currentUser, users, approveMember, createEvent, changePassword, changeEmail, resetMemberPassword, showNotification } = useAppContext();
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [eventImagePreview, setEventImagePreview] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [isHostPasswordModalOpen, setHostPasswordModalOpen] = useState(false);
  const [isEmailModalOpen, setEmailModalOpen] = useState(false);

  const pendingMembers = useMemo(() => users.filter(u => u.role === 'member' && u.status === 'pending'), [users]);
  const approvedMembers = useMemo(() => users.filter(u => u.role === 'member' && u.status === 'approved'), [users]);
  
  const handleCreateEvent = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const eventName = formData.get('eventName') as string;
    const eventYear = formData.get('eventYear') as string;
    if (eventName && eventYear) {
      createEvent(eventName, parseInt(eventYear, 10), eventImageFile || undefined);
      e.currentTarget.reset();
      setEventImageFile(null);
      setEventImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          setEventImageFile(file);
          setEventImagePreview(URL.createObjectURL(file));
      }
  };
  
  const handleHostPasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPass = (e.currentTarget.elements.namedItem('newPassword') as HTMLInputElement).value;
    const confirmPass = (e.currentTarget.elements.namedItem('confirmPassword') as HTMLInputElement).value;
    if (newPass !== confirmPass) {
        showNotification("Passwords do not match!", 'error');
        return;
    }
    changePassword(newPass);
    setHostPasswordModalOpen(false);
  };
  
  const handleMemberPasswordReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newPass = (e.currentTarget.elements.namedItem('newPassword') as HTMLInputElement).value;
    if (resetUser && newPass) {
        resetMemberPassword(resetUser.id, newPass);
        setResetUser(null);
    }
  };
  
  const handleHostEmailChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newEmail = (e.currentTarget.elements.namedItem('newEmail') as HTMLInputElement).value;
    if (currentUser && newEmail) {
        changeEmail(newEmail);
        setEmailModalOpen(false);
    }
  };

  const inputClasses = "w-full p-2 border rounded-lg bg-white";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">Profile & Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard>
            <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Host Details</h2>
            <p><strong>Name:</strong> {currentUser?.name}</p>
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <div className="flex flex-wrap gap-2 mt-4">
                <Button onClick={() => setHostPasswordModalOpen(true)}>Change Password</Button>
                <Button onClick={() => setEmailModalOpen(true)} variant="secondary">Change Email</Button>
            </div>
        </GlassCard>

        <GlassCard>
            <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Create New Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <input name="eventName" type="text" placeholder="Event Name (e.g., Holi)" required className={inputClasses} />
              <input name="eventYear" type="number" placeholder="Year (e.g., 2026)" required className={inputClasses} />
              <div>
                  <label className="block text-gray-700 font-medium mb-2">Event Photo (optional)</label>
                  <input name="eventPhoto" type="file" accept="image/*" onChange={handleImageUpload} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
              {eventImagePreview && <img src={eventImagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />}
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
        </GlassCard>
      </div>

      <GlassCard>
        <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Member Requests</h2>
        <ul className="space-y-2">
          {pendingMembers.map(member => (
            <li key={member.id} className="flex flex-col md:flex-row justify-between md:items-center p-3 bg-white/70 rounded-lg gap-2">
              <div className='w-full text-left'>
                <p className="font-semibold">{member.name}</p>
                <p className="text-sm text-gray-600">{member.email}</p>
              </div>
              <Button variant="success" onClick={() => approveMember(member.id)} className="w-full md:w-auto">Approve</Button>
            </li>
          ))}
          {pendingMembers.length === 0 && <p className="text-center p-2">No pending member requests.</p>}
        </ul>
      </GlassCard>
      
      <GlassCard>
        <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Manage Members</h2>
        <ul className="space-y-2">
            {approvedMembers.map(member => (
                 <li key={member.id} className="flex flex-col md:flex-row justify-between md:items-center p-3 bg-white/70 rounded-lg gap-2">
                    <div className='w-full text-left'>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-gray-600">{member.email}</p>
                    </div>
                    <div>
                        <Button variant="secondary" size="sm" onClick={() => setResetUser(member)} className="w-full md:w-auto">Reset Password</Button>
                    </div>
                 </li>
            ))}
            {approvedMembers.length === 0 && <p className="text-center p-2">No approved members.</p>}
        </ul>
      </GlassCard>
      
      <Modal isOpen={isHostPasswordModalOpen} onClose={() => setHostPasswordModalOpen(false)} title="Change My Password">
          <form onSubmit={handleHostPasswordChange} className="space-y-4">
              <div>
                  <label className="block font-medium">New Password</label>
                  <input name="newPassword" type="password" required className={inputClasses} />
              </div>
              <div>
                  <label className="block font-medium">Confirm New Password</label>
                  <input name="confirmPassword" type="password" required className={inputClasses} />
              </div>
              <Button type="submit" className="w-full">Update Password</Button>
          </form>
      </Modal>

      <Modal isOpen={!!resetUser} onClose={() => setResetUser(null)} title={`Reset Password for ${resetUser?.name}`}>
          <form onSubmit={handleMemberPasswordReset} className="space-y-4">
              <div>
                  <label className="block font-medium">New Password</label>
                  <input name="newPassword" type="password" required className={inputClasses} />
              </div>
              <Button type="submit" className="w-full">Set New Password</Button>
          </form>
      </Modal>

      <Modal isOpen={isEmailModalOpen} onClose={() => setEmailModalOpen(false)} title="Change My Email">
          <form onSubmit={handleHostEmailChange} className="space-y-4">
              <div>
                  <label className="block font-medium">New Email</label>
                  <input name="newEmail" type="email" required className={inputClasses} />
              </div>
               <p className="text-sm text-gray-600">You will be sent confirmation links to both your old and new email addresses to complete the change.</p>
              <Button type="submit" className="w-full">Update Email</Button>
          </form>
      </Modal>
    </div>
  );
};

export default HostProfile;