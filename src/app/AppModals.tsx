import React from 'react';
import { ChildManagement } from '../components/ChildManagement';
import { EditProfile } from '../components/EditProfile';
import { AdminAvatarEditModal } from './AdminAvatarEditModal';
import { ChildProfile } from '../types';

interface AppModalsProps {
    showChildManagement: boolean;
    setShowChildManagement: (show: boolean) => void;
    showEditProfile: boolean;
    setShowEditProfile: (show: boolean) => void;
    editingChildId: string | null;
    setEditingChildId: (id: string | null) => void;
    showEditAdmin: boolean;
    setShowEditAdmin: (show: boolean) => void;
    data: ChildProfile[];
    childProfile: ChildProfile | null;
    adminAvatar: string;
    onAddChild: (child: any) => void;
    onUpdateChild: (id: string, updates: any) => void;
    onDeleteChild: (id: string) => void;
    onAddYearGroup: (childId: string, name: string) => void;
    onRemoveYearGroup: (childId: string, yearGroupId: string) => void;
    onSaveProfile: (updates: any) => void;
    onSaveAdminAvatar: (avatar: string) => void;
}

export const AppModals: React.FC<AppModalsProps> = ({
    showChildManagement,
    setShowChildManagement,
    showEditProfile,
    setShowEditProfile,
    editingChildId,
    setEditingChildId,
    showEditAdmin,
    setShowEditAdmin,
    data,
    childProfile,
    adminAvatar,
    onAddChild,
    onUpdateChild,
    onDeleteChild,
    onAddYearGroup,
    onRemoveYearGroup,
    onSaveProfile,
    onSaveAdminAvatar
}) => {
    return (
        <>
            {showChildManagement && (
                <ChildManagement
                    children={data}
                    onAddChild={onAddChild}
                    onUpdateChild={onUpdateChild}
                    onDeleteChild={onDeleteChild}
                    onAddYearGroup={onAddYearGroup}
                    onRemoveYearGroup={onRemoveYearGroup}
                    onClose={() => setShowChildManagement(false)}
                />
            )}

            {showEditProfile && editingChildId && (
                <EditProfile
                    child={data.find(c => c.id === editingChildId) || childProfile!}
                    onSave={onSaveProfile}
                    onClose={() => { setShowEditProfile(false); setEditingChildId(null); }}
                />
            )}

            {showEditAdmin && (
                <AdminAvatarEditModal
                    currentAvatar={adminAvatar}
                    onSave={onSaveAdminAvatar}
                    onClose={() => setShowEditAdmin(false)}
                />
            )}
        </>
    );
};
