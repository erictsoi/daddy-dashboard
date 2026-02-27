import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Hooks
import { useAuth } from './lib/AuthContext';
import { useAppData } from './hooks/useAppData';
import { useSchedule } from './hooks/useSchedule';

// Static Views
import { LandingView } from './views/LandingView';

// Sub-components
import { AppModals } from './app/AppModals';

// Lazy Views
const AdminDash = lazy(() => import('./views/AdminDash').then(m => ({ default: m.AdminDash })));
const KidDash = lazy(() => import('./views/KidDash').then(m => ({ default: m.KidDash })));
const LessonView = lazy(() => import('./views/LessonView').then(m => ({ default: m.LessonView })));
const ReturningView = lazy(() => import('./views/ReturningView').then(m => ({ default: m.ReturningView })));
const Marketplace = lazy(() => import('./views/Marketplace').then(m => ({ default: m.Marketplace })));
// const TempGridView = lazy(() => import('./views/TempGridView').then(m => ({ default: m.TempGridView })));

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth() || {};

  // Custom Hook: Curriculum & User Data
  const {
    data, loading, childProfile, allChildren,
    adminAvatar, adminName, adminDob, adminColor,
    setAdminAvatar, setAdminName, setAdminDob, setAdminColor,
    handleUpdateChild, handleUpdateChildProfile, handleAddChild,
    handleDeleteChild, handleAddYearGroup, handleRemoveYearGroup,
    handleCompleteLesson, handleBulkImport, handleDeleteSubject,
    handleAddLesson, handleRestoreLesson, handleHardDeleteLesson,
    handleSoftDeleteLesson, handleUpdateTopicFrequency
  } = useAppData(user, authLoading);

  // Custom Hook: Schedule Management
  const { schedule, isDayActive, generateSchedule } = useSchedule(data);

  // Modal State
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [showEditAdmin, setShowEditAdmin] = useState(false);

  return (
    <>
      <Routes>
        <Route path="/landingview" element={<LandingView data={data} onNavigate={(nav) => {
          if (nav.type === 'KIDSDASH') navigate(`/kiddash?child=${nav.childId}`);
          else if (nav.type === 'HOME' || nav.type === 'ADMIN') navigate('/admindash');
          else if (nav.type === 'LANDING') navigate('/');
        }} />} />
        <Route path="/" element={<LandingView data={data} onNavigate={(nav) => {
          if (nav.type === 'KIDSDASH') navigate(`/kiddash?child=${nav.childId}`);
          else if (nav.type === 'HOME' || nav.type === 'ADMIN') navigate('/admindash');
          else if (nav.type === 'LANDING') navigate('/');
        }} />} />
        <Route path="/returningview" element={<Suspense fallback={<div>Loading...</div>}>
          <ReturningView childProfile={childProfile} data={data} onNavigate={(nav) => {
            if (nav.type === 'KIDSDASH') navigate(`/kiddash?child=${nav.childId}`);
            else if (nav.type === 'HOME' || nav.type === 'ADMIN') navigate('/admindash');
            else if (nav.type === 'LANDING') navigate('/');
          }} />
        </Suspense>} />

        <Route path="/admindash" element={<Suspense fallback={<div>Loading...</div>}><AdminDash data={data} onNavigate={(nav) => {
          if (nav.type === 'KIDSDASH') navigate(`/kiddash?child=${nav.childId}`);
          else if (nav.type === 'ADMIN' || nav.type === 'HOME') navigate('/admindash');
          else if (nav.type === 'LANDING') navigate('/');
          else if (nav.type === 'MARKETPLACE') navigate('/marketplace');
          else if (nav.type === 'CURRICULUM') navigate('/admindash'); // Redirect to admin for now
          else if (nav.type === 'PROFILES') navigate('/returningview');
        }} /></Suspense>} />
        <Route path="/kiddash" element={<Suspense fallback={<div>Loading...</div>}>
          <KidDash childId={new URLSearchParams(window.location.search).get('child') || (data[0]?.id || '')} data={data} />
        </Suspense>} />
        <Route path="/lessonview" element={<Suspense fallback={<div>Loading...</div>}>
          <LessonView
            childId={new URLSearchParams(window.location.search).get('child') || (data[0]?.id || '')}
            lessonId={new URLSearchParams(window.location.search).get('lesson') || ''}
            data={data}
          />
        </Suspense>} />

        <Route path="/marketplace" element={<Suspense fallback={<div>Loading...</div>}><Marketplace /></Suspense>} />
        {/* <Route path="/temp-grid" element={<Suspense fallback={<div>Loading...</div>}><TempGridView /></Suspense>} /> */}

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admindash" replace />} />
        <Route path="/curriculum" element={<Navigate to="/admindash" replace />} />
        <Route path="/manage" element={<Navigate to="/admindash" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <AppModals
        showChildManagement={showChildManagement}
        setShowChildManagement={setShowChildManagement}
        showEditProfile={showEditProfile}
        setShowEditProfile={setShowEditProfile}
        editingChildId={editingChildId}
        setEditingChildId={setEditingChildId}
        showEditAdmin={showEditAdmin}
        setShowEditAdmin={setShowEditAdmin}
        data={data}
        childProfile={childProfile}
        adminAvatar={adminAvatar}
        onAddChild={handleAddChild}
        onUpdateChild={handleUpdateChild}
        onDeleteChild={handleDeleteChild}
        onAddYearGroup={handleAddYearGroup}
        onRemoveYearGroup={handleRemoveYearGroup}
        onSaveProfile={(updates) => {
          if (editingChildId === 'childProfile' && childProfile) {
            handleUpdateChildProfile(updates);
          } else if (editingChildId) {
            handleUpdateChild(editingChildId, updates);
          }
          setShowEditProfile(false);
          setEditingChildId(null);
        }}
        onSaveAdminAvatar={(avatar) => {
          setAdminAvatar(avatar);
          setShowEditAdmin(false);
        }}
      />
    </>
  );
};

export default App;
