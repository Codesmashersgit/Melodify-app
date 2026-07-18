import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resolveAudioUrl } from '../context/PlaybackContext';

const DOWNLOADS_KEY = '@downloads';

export const downloadTrack = async (track, onProgress) => {
    try {
        const audioUrl = await resolveAudioUrl(track.id, track.name, track.artist);
        if (!audioUrl) {
            throw new Error('Could not resolve audio URL for download');
        }

        const fileUri = `${FileSystem.documentDirectory}${track.id}.mp3`;
        
        const downloadResumable = FileSystem.createDownloadResumable(
            audioUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                if (onProgress) onProgress(progress);
            }
        );

        const { uri } = await downloadResumable.downloadAsync();

        const currentDownloads = await getDownloadedTracks();
        // Remove old if exists
        const filtered = currentDownloads.filter(t => t.id !== track.id);
        const newDownloads = [{ ...track, localUri: uri }, ...filtered];
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(newDownloads));

        return uri;
    } catch (error) {
        console.error('Download error:', error);
        throw error;
    }
};

export const getDownloadedTracks = async () => {
    try {
        const downloads = await AsyncStorage.getItem(DOWNLOADS_KEY);
        return downloads ? JSON.parse(downloads) : [];
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return [];
    }
};

export const deleteDownloadedTrack = async (trackId) => {
    try {
        const currentDownloads = await getDownloadedTracks();
        const trackToDelete = currentDownloads.find(t => t.id === trackId);
        
        if (trackToDelete && trackToDelete.localUri) {
            const fileInfo = await FileSystem.getInfoAsync(trackToDelete.localUri);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(trackToDelete.localUri, { idempotent: true });
            }
        }

        const newDownloads = currentDownloads.filter(t => t.id !== trackId);
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(newDownloads));
    } catch (error) {
        console.error('Error deleting download:', error);
        throw error;
    }
};

export const isTrackDownloaded = async (trackId) => {
    try {
        const currentDownloads = await getDownloadedTracks();
        return currentDownloads.some(t => t.id === trackId);
    } catch (error) {
        console.error('Error checking if downloaded:', error);
        return false;
    }
};
