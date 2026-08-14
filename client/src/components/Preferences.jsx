import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Preferences.css';

const PREFERENCES = [
    { id:"punjabi", label:"Punjabi", type:"Language", image:"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop" },
    { id:"bhojpuri", label:"Bhojpuri", type:"Language", image:"https://images.unsplash.com/photo-1604849329105-b8af32bfe8ab?w=800&auto=format&fit=crop" },
    { id:"marathi", label:"Marathi", type:"Language", image:"https://images.unsplash.com/photo-1605640840605-14ac1855827b?w=800&auto=format&fit=crop" },
    { id:"gujarati", label:"Gujarati", type:"Language", image:"https://images.unsplash.com/photo-1617155093758-158b23e0e5d6?w=800&auto=format&fit=crop" },
    { id:"bengali", label:"Bengali", type:"Language", image:"https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800&auto=format&fit=crop" },
    { id:"tamil", label:"Tamil", type:"Language", image:"https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop" },
    { id:"telugu", label:"Telugu", type:"Language", image:"https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop" },
    { id:"rajasthani", label:"Rajasthani", type:"Language", image:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&auto=format&fit=crop" },
    { id:"bollywood", label:"Bollywood", type:"Genre", image:"https://images.unsplash.com/photo-1616046229478-9901c5536a45?w=800&auto=format&fit=crop" },
    { id:"hollywood", label:"Hollywood", type:"Genre", image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop" },
    { id:"lofi", label:"Lo-Fi", type:"Genre", image:"https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800&auto=format&fit=crop" },
    { id:"hiphop", label:"Hip-Hop", type:"Genre", image:"https://images.unsplash.com/photo-1601643157091-ce5c665179ab?w=800&auto=format&fit=crop" },
    { id:"indie", label:"Indie", type:"Genre", image:"https://images.unsplash.com/photo-1459233313842-cd392ee2c388?w=800&auto=format&fit=crop" },
    { id:"devotional", label:"Devotional", type:"Genre", image:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&auto=format&fit=crop" },
    { id:"kpop", label:"K-Pop", type:"Genre", image:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop" },
    { id:"jazz", label:"Jazz & Blues", type:"Genre", image:"https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?w=800&auto=format&fit=crop" },
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
