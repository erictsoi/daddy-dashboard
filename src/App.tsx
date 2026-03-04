import React, { useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate, useSearchParams } from 'react-router-dom';

// Hooks
import { AppProvider, useAppContext } from './context/AppContext';

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
const CurriculumBuilder = lazy(() => import('./components/CurriculumBuilder').then(m => ({ default: m.CurriculumBuilder })));
const CurriculumLibrary = lazy(() => import('./components/CurriculumLibrary').then(m => ({ default: m.CurriculumLibrary })));
const CurriculumValidator = lazy(() => import('./components/CurriculumValidator').then(m => ({ default: m.CurriculumValidator })));
const CurriculumSearch = lazy(() => import('./components/CurriculumSearch').then(m => ({ default: m.CurriculumSearch })));

// Reusable loading fallback
const LoadingFallback = () => <div>Loading...</div>;

const AppInner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
    handleBulkImport,
    handleTemplateImport,
    setAdminAvatar
  } = useAppContext();

  // Modal State
  const [showChildManagement, setShowChildManagement] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [showEditAdmin, setShowEditAdmin] = useState(false);

  // Extract URL params once for LessonView using React Router
  const lessonChildId = searchParams.get('child') || data[0]?.id || '';
  const lessonId = searchParams.get('lesson') || '';
  const lessonSubjectId = searchParams.get('subject') || undefined;
  const lessonTopicId = searchParams.get('topic') || undefined;

  return (
    <>
      <Routes>
        <Route path="/landingview" element={<LandingView />} />
        <Route path="/" element={<LandingView />} />
        <Route path="/returningview" element={<Suspense fallback={<LoadingFallback />}>
          <ReturningView />
        </Suspense>} />

        <Route path="/admindash" element={<Suspense fallback={<LoadingFallback />}><AdminDash /></Suspense>} />
        <Route path="/kiddash" element={<Suspense fallback={<LoadingFallback />}>
          <KidDash />
        </Suspense>} />
        <Route path="/lessonview" element={<Suspense fallback={<LoadingFallback />}>
          <LessonView
            childId={lessonChildId}
            lessonId={lessonId}
            subjectId={lessonSubjectId}
            topicId={lessonTopicId}
            data={data}
          />
        </Suspense>} />

        <Route path="/marketplace" element={<Suspense fallback={<LoadingFallback />}><Marketplace /></Suspense>} />
        <Route path="/curriculumbuilder" element={<Suspense fallback={<LoadingFallback />}>
          <CurriculumBuilder
            onBack={() => navigate('/admindash')}
            onImport={handleBulkImport}
            onImportComplete={() => navigate('/admindash')}
            onTemplateImport={handleTemplateImport}
          />
        </Suspense>} />
        <Route path="/curriculumlibrary" element={<Suspense fallback={<LoadingFallback />}>
          <CurriculumLibrary
            onBack={() => navigate('/admindash')}
          />
        </Suspense>} />
        <Route path="/curriculumvalidator" element={<Suspense fallback={<LoadingFallback />}>
          <CurriculumValidator
            onBack={() => navigate('/admindash')}
          />
        </Suspense>} />
        <Route path="/curriculumsearch" element={<Suspense fallback={<LoadingFallback />}>
          <CurriculumSearch
            onBack={() => navigate('/admindash')}
          />
        </Suspense>} />

        {/* Redirects */}
        <Route path="/admin" element={<Navigate to="/admindash" replace />} />
        <Route path="/curriculum" element={<Navigate to="/curriculumbuilder" replace />} />
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
