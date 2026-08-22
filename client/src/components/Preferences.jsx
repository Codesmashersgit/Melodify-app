import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Preferences.css';

const PREFERENCES = [
    { id:"punjabi", label:"Punjabi", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0rFkJzDuJ43OHD639UR8x1yhwRJy6wlNR2oE00MaseA&s=10" },
    { id:"bhojpuri", label:"Bhojpuri", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXhVhVxf6jTHoLpdZphE-ADnAdQljPjIeOpIIMoZWwiw&s" },
    { id:"marathi", label:"Marathi", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIGl3BczHAuwknhBQqu3Ao53MFmNhZNsQUFEESMvz0iw&s=10" },
    { id:"gujarati", label:"Gujarati", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHoQuATRBPzJ8ucZGS0S8alx40exvSu0kPzRgkZFaguA&s=10" },
    { id:"bengali", label:"Bengali", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcex41XtxgxixGsz-teUnDQv_czdGyN5kbm6mXTGWZVw&s=10" },
    { id:"tamil", label:"Tamil", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNbqPoSw4r5zHnls0hxbhdPv_tam8X8a6NI_S20SZUBQ&s=10" },
    { id:"telugu", label:"Telugu", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9lZEsks-SckMbrivDMEJtCzhUhTs1mnKFNn9nE0_Mzw&s=10" },
    { id:"rajasthani", label:"Rajasthani", type:"Language", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDVfSM692qqgcowkF7_UVY3AL44AuXKfVmig6nb7IQaQ&s=10" },
    { id:"bollywood", label:"Bollywood", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy4_Sws3rscWdNa0SsNSdu-PHkQcyNWrv-ITDKqhsJiA&s=10" },
    { id:"hollywood", label:"Hollywood", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRU8wcZf-xj-kMSrYVN4FWj9lzTzaEbL4-8lwwQ5ZMPGQ&s=10" },
    { id:"lofi", label:"Lo-Fi", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSd7_Cyw-p-dp3vAIoZOs2tl9v0AdwqztgNal2gM3lGJQ&s=10" },
    { id:"hiphop", label:"Hip-Hop", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRABrYmHSKCXvBS5H-e8RoqDCi59d-Sg4uH_OR19acJKg&s=10" },
    { id:"indie", label:"Indie", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHTSRJlLyB2qAPN-7-1CWuxNWrzLWqHWt8ygkYKGGIcQ&s=10" },
    { id:"devotional", label:"Devotional", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3ZqPi1SzQ0KX6Aav2zvTLqU7NKSkhdE7guXpmNdkqIQ&s=10" },
    { id:"kpop", label:"K-Pop", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLpW4qjksK6BJwgkoxJAk5be5P3GX0aC-LZiHJaJ6D6A&s=10" },
    { id:"jazz", label:"Jazz & Blues", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrEXpNxhcIVRkogEJcyjEmrDNUxOLSoLkOoW3ghltRwQ&s=10" },
    { id:"classical", label:"Classical", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT61DrqlJLFmyAqeW-yrSvpAHcZn4KcHU9tLGIqC8fyYg&s=10" },
    { id:"sufi", label:"Sufi", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPMGHA2Vlqwgx94ije-LcHBiIT4727T-aDkxdhxIYWxg&s=10" },
    { id:"dance", label:"Dance/Electronic", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrcgEcLqaw-1QEqLSXoKXcG1p5yRGTnNEEHJqhb6BUFw&s=10" },
    { id:"romantic", label:"Romantic", type:"Genre", image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKjgVZJlk1grzIc8cGdEvDWEr6gLhbusiO4RifZdkzsA&s=10" },
];

const ARTISTS = [
    { id: "arijit_singh", label: "Arijit Singh", image: "https://ui-avatars.com/api/?name=Arijit+Singh&background=random&color=fff&size=200&bold=true" },
    { id: "shreya_ghoshal", label: "Shreya Ghoshal", image: "https://ui-avatars.com/api/?name=Shreya+Ghoshal&background=random&color=fff&size=200&bold=true" },
    { id: "diljit_dosanjh", label: "Diljit Dosanjh", image: "https://ui-avatars.com/api/?name=Diljit+Dosanjh&background=random&color=fff&size=200&bold=true" },
    { id: "ar_rahman", label: "A.R. Rahman", image: "https://ui-avatars.com/api/?name=A+R+Rahman&background=random&color=fff&size=200&bold=true" },
    { id: "atif_aslam", label: "Atif Aslam", image: "https://ui-avatars.com/api/?name=Atif+Aslam&background=random&color=fff&size=200&bold=true" },
    { id: "taylor_swift", label: "Taylor Swift", image: "https://ui-avatars.com/api/?name=Taylor+Swift&background=random&color=fff&size=200&bold=true" },
    { id: "the_weeknd", label: "The Weeknd", image: "https://ui-avatars.com/api/?name=The+Weeknd&background=random&color=fff&size=200&bold=true" },
    { id: "kishore_kumar", label: "Kishore Kumar", image: "https://ui-avatars.com/api/?name=Kishore+Kumar&background=random&color=fff&size=200&bold=true" },
    { id: "lata_mangeshkar", label: "Lata Mangeshkar", image: "https://ui-avatars.com/api/?name=Lata+Mangeshkar&background=random&color=fff&size=200&bold=true" },
    { id: "neha_kakkar", label: "Neha Kakkar", image: "https://ui-avatars.com/api/?name=Neha+Kakkar&background=random&color=fff&size=200&bold=true" },
    { id: "badshah", label: "Badshah", image: "https://ui-avatars.com/api/?name=Badshah&background=random&color=fff&size=200&bold=true" },
    { id: "sid_sriram", label: "Sid Sriram", image: "https://ui-avatars.com/api/?name=Sid+Sriram&background=random&color=fff&size=200&bold=true" },
    { id: "sonu_nigam", label: "Sonu Nigam", image: "https://ui-avatars.com/api/?name=Sonu+Nigam&background=random&color=fff&size=200&bold=true" },
    { id: "justin_bieber", label: "Justin Bieber", image: "https://ui-avatars.com/api/?name=Justin+Bieber&background=random&color=fff&size=200&bold=true" },
    { id: "bts", label: "BTS", image: "https://ui-avatars.com/api/?name=BTS&background=random&color=fff&size=200&bold=true" },
];

const Preferences = () => {
    const { user, updatePreferences } = useAuth();
    const navigate = useNavigate();
    const [selected, setSelected] = useState(user?.preferences || []);
    const [saving, setSaving] = useState(false);
    const [step, setStep] = useState(1); // 1 = Genres, 2 = Artists

    const togglePreference = (id) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(item => item !== id));
        } else {
            setSelected([...selected, id]);
        }
    };

    const handleNext = () => {
        setStep(2);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updatePreferences(selected);
            navigate("/");
        } catch (error) {
            console.error("Failed to save preferences", error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="preferences-container fade-in">
            <div className="preferences-header">
                {step === 1 ? (
                    <>
                        <h1 className="preferences-title">What do you <span className="text-orange">like?</span></h1>
                        <p className="preferences-subtitle">Pick your favorite languages and genres to get better music recommendations.</p>
                    </>
                ) : (
                    <>
                        <h1 className="preferences-title">Choose your <span className="text-orange">Artists</span></h1>
                        <p className="preferences-subtitle">Select artists you love to fine-tune your personalized feed.</p>
                    </>
                )}
            </div>

            {step === 1 ? (
                <div className="preferences-grid">
                    {PREFERENCES.map(pref => {
                        const isSelected = selected.includes(pref.id);
                        return (
                            <div 
                                key={pref.id}
                                className={\`pref-card \${isSelected ? 'selected' : ''}\`}
                                onClick={() => togglePreference(pref.id)}
                                style={{ backgroundImage: \`url(\${pref.image})\` }}
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
            ) : (
                <div className="preferences-grid artists-grid">
                    {ARTISTS.map(artist => {
                        const isSelected = selected.includes(artist.id);
                        return (
                            <div 
                                key={artist.id}
                                className={\`pref-artist-card \${isSelected ? 'selected' : ''}\`}
                                onClick={() => togglePreference(artist.id)}
                            >
                                <div className="artist-image-container">
                                    <img src={artist.image} alt={artist.label} className="artist-image" />
                                    {isSelected && (
                                        <div className="pref-check artist-check">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <span className="pref-artist-label">{artist.label}</span>
                            </div>
                        );
                    })}
                </div>
            )}

            <div className="preferences-footer">
                {step === 2 && (
                    <button 
                        className="pref-back-btn" 
                        onClick={() => setStep(1)}
                    >
                        Back
                    </button>
                )}
                <div className="pref-count">
                    {selected.length === 0 ? "Select at least one" : \`\${selected.length} selected\`}
                </div>
                {step === 1 ? (
                    <button 
                        className="pref-save-btn" 
                        onClick={handleNext}
                        disabled={selected.length === 0}
                    >
                        Next: Artists
                    </button>
                ) : (
                    <button 
                        className="pref-save-btn" 
                        onClick={handleSave}
                        disabled={selected.length === 0 || saving}
                    >
                        {saving ? "Saving..." : "Finish & Play"}
                    </button>
                )}
            </div>
        </div>
    );
};

export default Preferences;
