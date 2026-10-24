import React, { useState, useEffect } from 'react';
import { UserCheck, XCircle, CheckCircle2, Shield, User, Building } from 'lucide-react';
import { User as UserType } from '../../types';
import { fetchUsers, updateUserVerification } from '../../services/api';

export const OfficialApprovals: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionUserId, setActionUserId] = useState<number | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await fetchUsers(undefined, 'PENDING_VERIFICATION');
      setUsers(data);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleAction = async (userId: number, status: 'APPROVED' | 'REJECTED') => {
    setActionUserId(userId);
    try {
      await updateUserVerification(userId, status, `Official status reviewed and set to ${status}.`);
      await loadPending();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-dark rounded-3xl p-5 md:p-6 border border-emerald/20 shadow-sentinel-sm">
      <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-mint/15 mb-4">
        <div>
          <h3 className="text-sm font-extrabold text-forest dark:text-pale-green tracking-tight flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald" />
            Official Account Verification Workflow (Anti-Fake Control)
          </h3>
          <p className="text-xs text-forest/60 dark:text-pale-green/60 mt-0.5">
            Approve or reject ASHA workers, health officials, and NGO field coordinators
          </p>
        </div>
        <span className="text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/30">
          {users.length} Pending
        </span>
      </div>

      {loading ? (
        <p className="text-xs text-forest/60 py-6 text-center">Loading pending applications...</p>
      ) : users.length === 0 ? (
        <div className="py-8 text-center text-forest/60 dark:text-pale-green/60">
          <CheckCircle2 className="w-8 h-8 text-emerald mx-auto mb-2 opacity-60" />
          <p className="text-xs font-bold">All official accounts verified.</p>
          <p className="text-[11px] mt-0.5">No pending applications awaiting administrative review.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 bg-pale-green/20 dark:bg-forest-light/20 rounded-2xl border border-forest/10 dark:border-mint/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-extrabold text-forest dark:text-pale-green">{u.full_name}</span>
                  <span className="text-[10px] bg-emerald/15 text-emerald font-bold px-2 py-0.5 rounded-full">
                    {u.role}
                  </span>
                  <span className="text-[10px] text-forest/60 dark:text-pale-green/60">
                    ID: {u.official_id_number || 'N/A'}
                  </span>
                </div>
                <p className="text-xs text-forest/70 dark:text-pale-green/70 mt-1">
                  {u.designation} • {u.department} ({u.district}, {u.state})
                </p>
                <p className="text-[10px] text-forest/50 dark:text-pale-green/50 mt-0.5">
                  Phone: {u.phone_number} • Applied: {new Date(u.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  disabled={actionUserId === u.id}
                  onClick={() => handleAction(u.id, 'APPROVED')}
                  className="px-3.5 py-1.5 bg-emerald text-white text-xs font-bold rounded-xl hover:bg-emerald-hover transition-colors shadow-sentinel-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
                <button
                  disabled={actionUserId === u.id}
                  onClick={() => handleAction(u.id, 'REJECTED')}
                  className="px-3.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
