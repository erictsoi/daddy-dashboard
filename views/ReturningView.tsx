import React from 'react';
import { ChildProfile, ViewOrigin } from '../types';
import { useAuth } from '../src/lib/AuthContext';
import { DS, Card, Button } from '../components/design-system';

interface ReturningViewProps {
  childProfile: ChildProfile | null;
  onNavigate: (view: { type: 'LANDING' } | { type: 'KIDSDASH'; childId: string }) => void;
}

export const ReturningView: React.FC<ReturningViewProps> = ({ childProfile, onNavigate }) => {
  const { user, signOut } = useAuth() || {};
  
  if (childProfile) {
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ padding: 48, textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>{childProfile.avatar}</div>
          <h1 className="b" style={{ fontSize: 32, color: DS.ink, marginBottom: 8 }}>Welcome back!</h1>
          <p className="n" style={{ color: DS.inkSoft, marginBottom: 32 }}>Ready to continue learning?</p>
          <Button onClick={() => onNavigate({ type: 'KIDSDASH', childId: childProfile.id })}>
            Continue Learning →
          </Button>
          <div style={{ marginTop: 24 }}>
            <button 
              onClick={() => { signOut?.(); onNavigate({ type: 'LANDING' }); }}
              className="n"
              style={{ color: DS.inkSoft, background: "none", border: "none", cursor: "pointer", fontSize: 14 }}
            >
              Sign out
            </button>
          </div>
        </Card>
      </div>
    );
  }
  
  if (user) {
    return (
      <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <Card style={{ padding: 48, textAlign: "center", maxWidth: 500 }}>
          <div style={{ fontSize: 64, marginBottom: 24 }}>👋</div>
          <h1 className="b" style={{ fontSize: 32, color: DS.ink, marginBottom: 8 }}>Welcome back!</h1>
          <p className="n" style={{ color: DS.inkSoft, marginBottom: 32 }}>Select a profile to continue</p>
          <Button onClick={() => onNavigate({ type: 'ADMIN' })}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }
  
  return (
    <div style={{ minHeight: "100vh", background: DS.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Card style={{ padding: 48, textAlign: "center", maxWidth: 500 }}>
        <h1 className="b" style={{ fontSize: 32, color: DS.ink, marginBottom: 16 }}>Session Expired</h1>
        <p className="n" style={{ color: DS.inkSoft, marginBottom: 32 }}>Please sign in again</p>
        <Button onClick={() => onNavigate({ type: 'LANDING' })}>
          Back to Sign In
        </Button>
      </Card>
    </div>
  );
};
