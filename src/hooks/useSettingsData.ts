import { useState, useEffect, useCallback } from 'react';
import { fetchUserSettings, saveUserSettings as saveToDb } from '../lib/dataService';
import { logger } from '../lib/logger';
import { UserSettings, DEFAULT_SETTINGS } from '../types';

export const useSettingsData = (user: any, authLoading: boolean) => {
    const [adminAvatar, setAdminAvatar] = useState(DEFAULT_SETTINGS.adminAvatar);
    const [adminColor, setAdminColor] = useState(DEFAULT_SETTINGS.adminColor);
    const [adminName, setAdminName] = useState(DEFAULT_SETTINGS.adminName);
    const [adminDob, setAdminDob] = useState(DEFAULT_SETTINGS.adminDob);
    const [parentEmailInput, setParentEmailInput] = useState(DEFAULT_SETTINGS.parentEmail);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading || !user) {
            setLoading(false);
            return;
        }

        const loadSettings = async () => {
            setLoading(true);
            try {
                const settings = await fetchUserSettings(user.uid);
                setAdminName(settings.adminName || '');
                setAdminAvatar(settings.adminAvatar || '👨‍🏫');
                setAdminColor(settings.adminColor || 'blue');
                setAdminDob(settings.adminDob || '');
                setParentEmailInput(settings.parentEmail || '');
            } catch (e) {
                logger.log('No settings found, using defaults');
            }
            setLoading(false);
        };

        loadSettings();
    }, [user, authLoading]);

    const saveSettings = useCallback(async (updates: Partial<UserSettings>) => {
        if (!user) return;

        const newSettings = {
            adminName: updates.adminName ?? adminName,
            adminAvatar: updates.adminAvatar ?? adminAvatar,
            adminColor: updates.adminColor ?? adminColor,
            adminDob: updates.adminDob ?? adminDob,
            parentEmail: updates.parentEmail ?? parentEmailInput
        };

        // UI update first
        if (updates.adminName !== undefined) setAdminName(updates.adminName);
        if (updates.adminAvatar !== undefined) setAdminAvatar(updates.adminAvatar);
        if (updates.adminColor !== undefined) setAdminColor(updates.adminColor);
        if (updates.adminDob !== undefined) setAdminDob(updates.adminDob);
        if (updates.parentEmail !== undefined) setParentEmailInput(updates.parentEmail);

        try {
            await saveToDb(user.uid, newSettings);
        } catch (err) {
            logger.error('Failed to save settings:', err);
        }
    }, [user, adminName, adminAvatar, adminColor, adminDob, parentEmailInput]);

    return {
        adminAvatar,
        adminColor,
        adminName,
        adminDob,
        parentEmailInput,
        loadingSettings: loading,
        setAdminAvatar: (a: string) => saveSettings({ adminAvatar: a }),
        setAdminName: (n: string) => saveSettings({ adminName: n }),
        setAdminDob: (d: string) => saveSettings({ adminDob: d }),
        setAdminColor: (c: string) => saveSettings({ adminColor: c }),
        setParentEmailInput: (e: string) => saveSettings({ parentEmail: e }),
        saveSettings
    };
};
