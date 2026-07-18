// WebDownloadService.js
// Stores downloaded songs as Blobs in IndexedDB for in-app offline playback

const DB_NAME = 'MelodifyOffline';
const DB_VERSION = 1;
const STORE_META = 'tracks_meta';
const STORE_AUDIO = 'tracks_audio';

function openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_META)) {
                db.createObjectStore(STORE_META, { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains(STORE_AUDIO)) {
                db.createObjectStore(STORE_AUDIO, { keyPath: 'id' });
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function downloadTrackForOffline(track, apiBaseUrl, onProgress) {
    try {
        onProgress?.('downloading');

        const response = await fetch(
            `${apiBaseUrl}/api/download?id=${track.id}&name=${encodeURIComponent(track.name)}`
        );
        if (!response.ok) throw new Error('Failed to fetch audio');

        // Read total size for progress
        const contentLength = response.headers.get('Content-Length');
        const total = contentLength ? parseInt(contentLength) : 0;
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            chunks.push(value);
            loaded += value.length;
            if (total > 0) {
                onProgress?.('downloading', Math.round((loaded / total) * 100));
            }
        }

        const blob = new Blob(chunks, { type: 'audio/mpeg' });
        const db = await openDB();

        // Save audio blob
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_AUDIO, 'readwrite');
            tx.objectStore(STORE_AUDIO).put({ id: track.id, blob });
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });

        // Save metadata
        const meta = {
            id: track.id,
            name: track.name,
            artist: track.artist,
            image: track.image,
            preview_url: track.preview_url, // keep original for fallback
            downloadedAt: Date.now(),
        };
        await new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_META, 'readwrite');
            tx.objectStore(STORE_META).put(meta);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });

        onProgress?.('done');
        return true;
    } catch (err) {
        console.error('Download failed:', err);
        onProgress?.('error');
        return false;
    }
}

export async function getDownloadedTracks() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const req = tx.objectStore(STORE_META).getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

export async function isTrackDownloaded(trackId) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_META, 'readonly');
        const req = tx.objectStore(STORE_META).get(trackId);
        req.onsuccess = () => resolve(!!req.result);
        req.onerror = () => resolve(false);
    });
}

export async function getTrackBlobUrl(trackId) {
    const db = await openDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_AUDIO, 'readonly');
        const req = tx.objectStore(STORE_AUDIO).get(trackId);
        req.onsuccess = () => {
            if (req.result?.blob) {
                resolve(URL.createObjectURL(req.result.blob));
            } else {
                resolve(null);
            }
        };
        req.onerror = () => resolve(null);
    });
}

export async function deleteDownloadedTrack(trackId) {
    const db = await openDB();
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_META, 'readwrite');
        tx.objectStore(STORE_META).delete(trackId);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    await new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_AUDIO, 'readwrite');
        tx.objectStore(STORE_AUDIO).delete(trackId);
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error);
    });
    return true;
}
