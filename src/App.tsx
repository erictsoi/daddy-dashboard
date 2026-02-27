import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

// Hooks
import { useAuth } from './lib/AuthContext';
import { AppProvider, useAppContext } from './context/AppContext';
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

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const {
    children: data,
    childProfile,
    settings: { adminAvatar },
    handleAddChild,
    handleUpdateChild,
    handleDeleteChild,
    handleAddYearGroup,
    handleRemoveYearGroup,
    handleUpdateChildProfile,
    setAdminAvatar
  } = useAppContext();

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
        <Route path="/landingview" element={<LandingView />} />
        <Route path="/" element={<LandingView />} />
        <Route path="/returningview" element={<Suspense fallback={<div>Loading...</div>}>
          <ReturningView />
        </Suspense>} />

        <Route path="/admindash" element={<Suspense fallback={<div>Loading...</div>}><AdminDash /></Suspense>} />
        <Route path="/kiddash" element={<Suspense fallback={<div>Loading...</div>}>
          <KidDash />
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

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
};

export default App;
