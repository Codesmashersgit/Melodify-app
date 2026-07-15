import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Preferences.css';

const PREFERENCES = [
    { id:"hindi", label:"Hindi", type:"Language", image:"https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800" },
    { id:"english", label:"English", type:"Language", image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800" },
    { id:"punjabi", label:"Punjabi", type:"Language", image:"https://images.unsplash.com/photo-1501386761578-eac5c94b800f?w=800" },
    { id:"bhojpuri", label:"Bhojpuri", type:"Language", image:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id:"marathi", label:"Marathi", type:"Language", image:"https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=800" },
    { id:"gujarati", label:"Gujarati", type:"Language", image:"https://images.unsplash.com/photo-1599661046827-dacde6976549?w=800" },
    { id:"bengali", label:"Bengali", type:"Language", image:"https://images.unsplash.com/photo-1558431382-27e303142255?w=800" },
    { id:"tamil", label:"Tamil", type:"Language", image:"https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800" },
    { id:"telugu", label:"Telugu", type:"Language", image:"https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800" },
    { id:"rajasthani", label:"Rajasthani", type:"Language", image:"https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800" },
    { id:"bollywood", label:"Bollywood", type:"Genre", image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800" },
    { id:"hollywood", label:"Hollywood", type:"Genre", image:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800" },
    { id:"lofi", label:"Lo-Fi", type:"Genre", image:"https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800" },
    { id:"hiphop", label:"Hip-Hop", type:"Genre", image:"https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800" },
    { id:"indie", label:"Indie", type:"Genre", image:"https://images.unsplash.com/photo-1482443462550-d2c99314ab6a?w=800" },
    { id:"devotional", label:"Devotional", type:"Genre", image:"https://images.unsplash.com/photo-1582560469796-03517174dbbd?w=800" },
    { id:"kpop", label:"K-Pop", type:"Genre", image:"https://images.unsplash.com/photo-1588196621287-c2cd174d84f7?w=800" },
    { id:"jazz", label:"Jazz & Blues", type:"Genre", image:"https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800" },
    { id:"classical", label:"Classical", type:"Genre", image:"https://images.unsplash.com/photo-1507838153428-9d992a9a7b97?w=800" },
    { id:"sufi", label:"Sufi", type:"Genre", image:"https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=800" },
    { id:"dance", label:"Dance/Electronic", type:"Genre", image:"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800" },
    { id:"romantic", label:"Romantic", type:"Genre", image:"https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800" }
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
            navigate(-1);
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
