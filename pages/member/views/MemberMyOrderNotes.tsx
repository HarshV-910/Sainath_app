
import React, { useState, useMemo, useRef } from 'react';
import { Event, Note } from '../../../types';
import { useAppContext } from '../../../hooks/useAppContext';
import GlassCard from '../../../components/common/GlassCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import { Camera, Trash2, Image, Edit } from 'lucide-react';

interface MemberMyOrderNotesProps {
  event: Event;
}

const MemberMyOrderNotes: React.FC<MemberMyOrderNotesProps> = ({ event }) => {
    const { notes, currentUser, addNote, deleteNote, editNote } = useAppContext();
    const [newNoteContent, setNewNoteContent] = useState('');
    const [noteImageFiles, setNoteImageFiles] = useState<File[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const editFileInputRef = useRef<HTMLInputElement>(null);

    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editingNoteNewFiles, setEditingNoteNewFiles] = useState<File[]>([]);

    const myNotes = useMemo(() => notes.filter(n => n.member_id === currentUser!.id && n.event_id === event.id)
        .sort((a, b) => new Date(b.date_time).getTime() - new Date(a.date_time).getTime()), [notes, currentUser, event.id]);
    
    const handleAddNote = () => {
        if ((newNoteContent.trim() || noteImageFiles.length > 0) && currentUser) {
            addNote(currentUser.id, event.id, newNoteContent, noteImageFiles);
            setNewNoteContent('');
            setNoteImageFiles([]);
        }
    };

    const handleNewNoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNoteImageFiles(prevFiles => [...prevFiles, ...Array.from(e.target.files!)]);
        }
        e.target.value = '';
    };

    const handleEditNoteImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setEditingNoteNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
        e.target.value = '';
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setEditingNoteNewFiles([]);
        setEditModalOpen(true);
    };

    const handleEditNoteSubmit = () => {
        if (editingNote && (editingNote.content.trim() || (editingNote.image_urls && editingNote.image_urls.length > 0) || editingNoteNewFiles.length > 0)) {
            editNote(editingNote.id, editingNote.content, editingNoteNewFiles, editingNote.image_urls);
            setEditModalOpen(false);
            setEditingNote(null);
        }
    };
    
    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-brand-dark">My Order Notes for {event.name} {event.year}</h1>

            <GlassCard>
                <h2 className="text-xl md:text-2xl font-bold text-brand-dark mb-4">Add a Note</h2>
                <textarea
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    placeholder="Type your pre-orders or reminders here..."
                    className="w-full p-3 border rounded-lg bg-white min-h-[100px]"
                />
                 {noteImageFiles.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {noteImageFiles.map((file, index) => (
                            <div key={index} className="relative w-24 h-24">
                                <img src={URL.createObjectURL(file)} alt={`Note preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                <button onClick={() => setNoteImageFiles(prev => prev.filter((_, i) => i !== index))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none"><Trash2 size={14}/></button>
                            </div>
                        ))}
                    </div>
                 )}
                <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()} size="sm" className="flex-1"><Image className="inline-block mr-1 md:mr-2" size={16} /> Attach</Button>
                        <Button variant="secondary" onClick={() => cameraInputRef.current?.click()} size="sm" className="flex-1"><Camera className="inline-block mr-1 md:mr-2" size={16} /> Take Pic</Button>
                    </div>
                    <Button onClick={handleAddNote} className="w-full md:w-auto">Save Note</Button>
                </div>
                 <input type="file" ref={fileInputRef} onChange={handleNewNoteImageUpload} accept="image/*" multiple className="hidden" />
                 <input type="file" ref={cameraInputRef} onChange={handleNewNoteImageUpload} accept="image/*" capture="user" multiple className="hidden" />
            </GlassCard>

            <div className="space-y-4">
                {myNotes.map(note => (
                    <GlassCard key={note.id} className="flex justify-between items-start">
                        <div className="flex-grow">
                            {note.image_urls && note.image_urls.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-2">
                                    {note.image_urls.map((url, index) => (
                                        <img key={index} src={url} alt={`Note attachment ${index + 1}`} className="w-24 h-24 object-cover rounded-lg" />
                                    ))}
                                </div>
                            )}
                            {note.content && <p className="whitespace-pre-wrap">{note.content}</p>}
                            <p className="text-xs text-gray-500 mt-2">{new Date(note.date_time).toLocaleString()}</p>
                        </div>
                        <div className="flex flex-col ml-2">
                            <button onClick={() => openEditModal(note)} className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"><Edit /></button>
                            <button onClick={() => deleteNote(note.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><Trash2 /></button>
                        </div>
                    </GlassCard>
                ))}
                {myNotes.length === 0 && <p className="text-center p-4">You have no notes for this event.</p>}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Note">
                {editingNote && (
                    <div className="space-y-4">
                        <textarea
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            className="w-full p-3 border rounded-lg bg-white min-h-[100px]"
                        />
                         <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => editFileInputRef.current?.click()}>
                                <Image className="inline-block mr-2" /> Add Image
                            </Button>
                        </div>
                        <input type="file" ref={editFileInputRef} onChange={handleEditNoteImageUpload} accept="image/*" multiple className="hidden" />
                        
                        {(editingNote.image_urls || editingNoteNewFiles) && (
                            <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                {editingNote.image_urls?.map((imgSrc, index) => (
                                    <div key={index} className="relative w-24 h-24">
                                        <img src={imgSrc} alt={`Note preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                        <button 
                                            onClick={() => setEditingNote(prev => ({...prev!, image_urls: (prev!.image_urls || []).filter((_, i) => i !== index)}))} 
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none"
                                        ><Trash2 size={14}/></button>
                                    </div>
                                ))}
                                {editingNoteNewFiles.map((file, index) => (
                                     <div key={`new-${index}`} className="relative w-24 h-24">
                                        <img src={URL.createObjectURL(file)} alt={`New note preview ${index + 1}`} className="rounded-lg object-cover w-full h-full" />
                                        <button 
                                            onClick={() => setEditingNoteNewFiles(prev => prev.filter((_, i) => i !== index))} 
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none"
                                        ><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button onClick={handleEditNoteSubmit} className="w-full">Save Changes</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MemberMyOrderNotes;
