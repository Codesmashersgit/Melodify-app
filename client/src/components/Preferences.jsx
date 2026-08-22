import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Preferences.css';

const PREFERENCES = [
    { id:"hindi", label:"Hindi", type:"Language", image:"https://images.unsplash.com/photo-1593530752179-847201c10776?w=800&auto=format&fit=crop" },
    { id:"punjabi", label:"Punjabi", type:"Language", image:"https://images.unsplash.com/photo-1591873133543-85f0ef6631b3?w=800&auto=format&fit=crop" },
    { id:"bhojpuri", label:"Bhojpuri", type:"Language", image:"https://images.unsplash.com/photo-1533221350175-680456108169?w=800&auto=format&fit=crop" },
    { id:"marathi", label:"Marathi", type:"Language", image:"https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop" },
    { id:"gujarati", label:"Gujarati", type:"Language", image:"https://images.unsplash.com/photo-1632731818290-7815cf1b9cf2?w=800&auto=format&fit=crop" },
    { id:"bengali", label:"Bengali", type:"Language", image:"https://images.unsplash.com/photo-1604169990817-21a48c40ff42?w=800&auto=format&fit=crop" },
    { id:"tamil", label:"Tamil", type:"Language", image:"https://images.unsplash.com/photo-1582502660021-8728a38a715a?w=800&auto=format&fit=crop" },
    { id:"telugu", label:"Telugu", type:"Language", image:"https://images.unsplash.com/photo-1595181534005-4f32a5170d47?w=800&auto=format&fit=crop" },
    { id:"rajasthani", label:"Rajasthani", type:"Language", image:"https://images.unsplash.com/photo-1540898555-467475355609?w=800&auto=format&fit=crop" },
    { id:"bollywood", label:"Bollywood", type:"Genre", image:"https://images.unsplash.com/photo-1603813735163-fdf466a9d18b?w=800&auto=format&fit=crop" },
    { id:"hollywood", label:"Hollywood", type:"Genre", image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop" },
    { id:"lofi", label:"Lo-Fi", type:"Genre", image:"https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=800&auto=format&fit=crop" },
    { id:"hiphop", label:"Hip-Hop", type:"Genre", image:"https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=800&auto=format&fit=crop" },
    { id:"indie", label:"Indie", type:"Genre", image:"https://images.unsplash.com/photo-1459233313842-cd392ee2c388?w=800&auto=format&fit=crop" },
    { id:"devotional", label:"Devotional", type:"Genre", image:"https://images.unsplash.com/photo-1515005886638-348df13b299e?w=800&auto=format&fit=crop" },
    { id:"kpop", label:"K-Pop", type:"Genre", image:"https://images.unsplash.com/photo-1543787798-25f02c67c5dc?w=800&auto=format&fit=crop" },
    { id:"jazz", label:"Jazz & Blues", type:"Genre", image:"https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop" },
    { id:"classical", label:"Classical", type:"Genre", image:"https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800&auto=format&fit=crop" },
    { id:"sufi", label:"Sufi", type:"Genre", image:"https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop" },
    { id:"dance", label:"Dance/Electronic", type:"Genre", image:"https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&auto=format&fit=crop" },
    { id:"romantic", label:"Romantic", type:"Genre", image:"https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&auto=format&fit=crop" },
];

const Preferences = () => {
    const { user, updatePreferences } = useAuth();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(user?.preferences || []);
    const [saving, setSaving] = useState(false);

    const togglePreference = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updatePreferences(selected);
            navigate('/');
        } catch (error) {
            console.error("Failed to save preferences", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="preferences-container fade-in">
            <div className="preferences-header">
                <h1 className="preferences-title">What do you <span className="text-orange">like?</span></h1>
                <p className="preferences-subtitle">Pick your favorite languages and genres to get better music recommendations.</p>
            </div>

            <div className="preferences-grid">
                {PREFERENCES.map(pref => {
                    const isSelected = selected.includes(pref.id);
                    return (
                        <div 
                            key={pref.id}
                            className={`pref-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => togglePreference(pref.id)}
                            style={{ backgroundImage: `url(${pref.image})` }}
                        >
                            <div className="pref-card-overlay">
                                <span className="pref-type">{pref.type}</span>
                                <span className="pref-label">{pref.label}</span>
                                {isSelected && (
                                    <div className="pref-check">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="preferences-footer">
                <div className="pref-count">
                    {selected.length === 0 ? "Select at least one" : `${selected.length} selected`}
                </div>
                <button 
                    className="pref-save-btn" 
                    onClick={handleSave}
                    disabled={selected.length === 0 || saving}
                >
                    {saving ? "Saving..." : "Continue"}
                </button>
            </div>
        </div>
    );
};

export default Preferences;
