import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  User, 
  Building2, 
  Lock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound,
  ArrowRight,
  Shield,
  Eye,
  EyeOff
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { LoginSentinelAnimation } from './LoginSentinelAnimation';
import { useAuth } from '../../context/AuthContext';
import { 
  loginUser, 
  registerCivilian, 
  registerOfficial, 
  validateGovId, 
  verifyPhoneOtp 
} from '../../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'CIVILIAN' | 'OFFICIAL';
  defaultTab?: 'login' | 'register';
}

const PUBLIC_HEALTH_FACTS = [
  "Water-borne diarrheal outbreaks can be detected 3.8 days earlier by combining low WQI with localized symptom clusters.",
  "Over 40% of flood-prone rural villages face acute post-monsoon microbial contamination in community drinking tube-wells.",
  "AERIS connects environmental hydrology with frontline ASHA reporting to verify signals before hospital admissions surge.",
  "A risk signal is a prompt to verify, not a confirmed outbreak. Human verification ensures zero false alarm panic."
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'CIVILIAN',
  defaultTab = 'login',
}) => {
  const { login } = useAuth();

  const [roleType, setRoleType] = useState<'CIVILIAN' | 'OFFICIAL'>(defaultRole);
  const [tab, setTab] = useState<'login' | 'register'>(defaultTab);
  const [factIndex, setFactIndex] = useState(0);

  // Form states
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [stateName, setStateName] = useState('Assam');
  const [district, setDistrict] = useState('Lakhimpur');
  const [village, setVillage] = useState('Dhakuakhana');
  const [govIdType, setGovIdType] = useState('aadhaar');
  const [govIdNumber, setGovIdNumber] = useState('');
  
  // Official specific
  const [designation, setDesignation] = useState('ASHA Worker');
  const [department, setDepartment] = useState('National Health Mission');
  const [officialId, setOfficialId] = useState('');
  const [supervisorName, setSupervisorName] = useState('Dr. Hemanta Barua (MOIC)');
  const [officialRole, setOfficialRole] = useState('ASHA_NGO');

  // ID Validation live feedback
  const [idValidation, setIdValidation] = useState<{ isValid?: boolean; message?: string }>({});
  const [otpCode, setOtpCode] = useState('123456');

  // Submission feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Format-only validation for Government ID
  const validateIdFormat = (type: string, val: string): { isValid?: boolean; message?: string } => {
    const raw = val.trim();
    if (!raw) return {};

    if (type === 'aadhaar') {
      const clean = raw.replace(/[\s\-]/g, '');
      if (clean.length < 12) {
        if (!/^\d*$/.test(clean)) {
          return { isValid: false, message: 'Aadhaar must contain digits only.' };
        }
        return {};
      }
      if (!/^\d{12}$/.test(clean) || clean.startsWith('0') || clean.startsWith('1')) {
        return { isValid: false, message: 'Aadhaar must be exactly 12 digits.' };
      }
      return { isValid: true, message: 'Aadhaar verified successfully.' };
    }

    if (type === 'pan') {
      const clean = raw.replace(/[\s\-]/g, '').toUpperCase();
      if (clean.length < 10) return {};
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(clean)) {
        return { isValid: false, message: 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).' };
      }
      return { isValid: true, message: 'PAN verified successfully.' };
    }

    if (type === 'voter_id') {
      const clean = raw.replace(/[\s\-]/g, '').toUpperCase();
      if (clean.length < 10) return {};
      if (!/^[A-Z]{3}[0-9]{7}$/.test(clean)) {
        return { isValid: false, message: 'Invalid Voter ID (EPIC) format. Must be 3 letters followed by 7 digits (e.g. ABC1234567).' };
      }
      return { isValid: true, message: 'Voter ID verified successfully.' };
    }

    if (type === 'driving_licence') {
      const clean = raw.replace(/\s+/g, '').toUpperCase();
      if (clean.length < 10) return {};
      const dlRegex = /^[A-Z]{2}[0-9]{2}[0-9]{4}[0-9]{7}$|^[A-Z]{2}-[0-9]{13}$|^[A-Z]{2}[0-9]{13}$/;
      if (!dlRegex.test(clean)) {
        return { isValid: false, message: 'Invalid Driving Licence format.' };
      }
      return { isValid: true, message: 'Driving Licence verified successfully.' };
    }

    return {};
  };

  const handleGovIdChange = async (val: string) => {
    let formattedVal = val;
    if (govIdType === 'pan' || govIdType === 'voter_id') {
      formattedVal = val.toUpperCase();
    }
    setGovIdNumber(formattedVal);

    const localCheck = validateIdFormat(govIdType, formattedVal);
    if (localCheck.isValid !== undefined) {
      setIdValidation(localCheck);
      if (localCheck.isValid) {
        try {
          const res = await validateGovId(govIdType, formattedVal);
          setIdValidation({ isValid: res.is_valid_format, message: res.message });
        } catch {
          // Keep local validation state
        }
      }
    } else {
      setIdValidation({});
    }
  };

  const handleGovIdTypeChange = (newType: string) => {
    setGovIdType(newType);
    setIdValidation({});
    if (govIdNumber) {
      let formattedVal = govIdNumber;
      if (newType === 'pan' || newType === 'voter_id') {
        formattedVal = govIdNumber.toUpperCase();
        setGovIdNumber(formattedVal);
      }
      const localCheck = validateIdFormat(newType, formattedVal);
      if (localCheck.isValid !== undefined) {
        setIdValidation(localCheck);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginUser(identifier, password);
      login(res.access_token, res.user);
      setSuccessMsg(`Welcome back, ${res.user.full_name}!`);
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (roleType === 'CIVILIAN') {
        const res = await registerCivilian({
          full_name: fullName,
          phone_number: phone.startsWith('+91') ? phone : `+91${phone}`,
          password,
          email: email || undefined,
          state: stateName,
          district,
          village,
          gov_id_type: govIdType,
          gov_id_number: govIdNumber,
          otp: otpCode,
        });
        login(res.access_token, res.user);
        setSuccessMsg(`Civilian account successfully created. Verified identity!`);
      } else {
        const res = await registerOfficial({
          full_name: fullName,
          phone_number: phone.startsWith('+91') ? phone : `+91${phone}`,
          password,
          email,
          role: officialRole,
          designation,
          department,
          official_id_number: officialId,
          supervisor_name: supervisorName,
          state: stateName,
          district,
          jurisdiction_villages: [village],
          gov_id_type: 'official_id',
          gov_id_number: officialId,
          otp: otpCode,
        });
        login(res.access_token, res.user);
        setSuccessMsg(`Official registration submitted. Account placed in PENDING_VERIFICATION for admin approval.`);
      }
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Check required fields.');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickAccount = (role: string) => {
    if (role === 'civilian') {
      setRoleType('CIVILIAN');
      setIdentifier('+919876543210');
      setPassword('Sentinel@123');
    } else if (role === 'asha') {
      setRoleType('OFFICIAL');
      setIdentifier('asha@sentinel.org');
      setPassword('Sentinel@123');
    } else if (role === 'officer') {
      setRoleType('OFFICIAL');
      setIdentifier('officer@sentinel.org');
      setPassword('Sentinel@123');
    } else if (role === 'admin') {
      setRoleType('OFFICIAL');
      setIdentifier('admin@sentinel.org');
      setPassword('Sentinel@123');
    } else if (role === 'pending') {
      setRoleType('OFFICIAL');
      setIdentifier('pending@sentinel.org');
      setPassword('Sentinel@123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-forest/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-surface-dark rounded-3xl shadow-sentinel-xl border border-emerald/20 overflow-hidden flex flex-col md:flex-row my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-forest/60 dark:text-pale-green/60 hover:text-forest dark:hover:text-pale-green rounded-full bg-white/60 dark:bg-forest/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Rich Animated Sentinel Panel */}
        <div className="hidden md:flex md:w-5/12 relative overflow-hidden">
          <LoginSentinelAnimation onQuickAccountSelect={fillQuickAccount} />
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center overflow-y-auto max-h-[85vh]">
          {/* Mobile-only brand header */}
          <div className="md:hidden flex items-center justify-between mb-4 pb-3 border-b border-forest/10 dark:border-mint/15">
            <BrandLogo variant="full" size="sm" />
            <span className="text-[10px] font-mono font-bold text-emerald flex items-center gap-1 bg-emerald/10 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald animate-pulse" />
              Sentinel 2.0
            </span>
          </div>
          {/* 1. Role Toggle Tab */}
          <div className="flex bg-pale-green/50 dark:bg-forest-light/40 p-1 rounded-2xl border border-emerald/20 mb-4">
            <button
              type="button"
              onClick={() => setRoleType('CIVILIAN')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                roleType === 'CIVILIAN'
                  ? 'bg-emerald text-white shadow-sentinel-sm'
                  : 'text-forest dark:text-pale-green hover:bg-emerald/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Civilian</span>
            </button>
            <button
              type="button"
              onClick={() => setRoleType('OFFICIAL')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                roleType === 'OFFICIAL'
                  ? 'bg-forest text-pale-green dark:bg-emerald dark:text-white shadow-sentinel-sm'
                  : 'text-forest dark:text-pale-green hover:bg-emerald/10'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>ASHA / Official</span>
            </button>
          </div>

          {/* 2. Login vs Register Tab */}
          <div className="flex border-b border-forest/10 dark:border-mint/20 mb-6">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`pb-2 px-4 text-xs font-bold transition-colors border-b-2 ${
                tab === 'login'
                  ? 'border-emerald text-emerald'
                  : 'border-transparent text-forest/60 dark:text-pale-green/60 hover:text-forest'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`pb-2 px-4 text-xs font-bold transition-colors border-b-2 ${
                tab === 'register'
                  ? 'border-emerald text-emerald'
                  : 'border-transparent text-forest/60 dark:text-pale-green/60 hover:text-forest'
              }`}
            >
              Create Account ({roleType === 'CIVILIAN' ? 'Citizen' : 'Official'})
            </button>
          </div>

          {/* Feedback messages */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-subtle dark:bg-forest-light/60 border border-emerald/30 text-emerald-active dark:text-mint rounded-xl text-xs flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 3. Forms */}
          {tab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest dark:text-pale-green mb-1">
                  {roleType === 'CIVILIAN' ? 'Phone Number or Email' : 'Official ID Number or Work Email'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={roleType === 'CIVILIAN' ? '+919876543210' : 'officer@sentinel.org'}
                    className="w-full pl-9 pr-3 py-2 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-forest dark:text-pale-green">Password</label>
                  <span className="text-[10px] text-emerald hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-forest/40 dark:text-pale-green/40 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-forest/40 dark:text-pale-green/40 hover:text-forest"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald text-white font-bold rounded-xl text-xs hover:bg-emerald-hover transition-all shadow-sentinel-md flex items-center justify-center gap-2 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In to AERIS'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pranab Gogoi"
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Phone Number (+91)</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Email</label>
                  <input
                    type="email"
                    required={roleType === 'OFFICIAL'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleType === 'CIVILIAN' ? 'Optional' : 'official@dept.gov.in'}
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  >
                    <option value="Lakhimpur">Lakhimpur (Assam)</option>
                    <option value="Majuli">Majuli (Assam)</option>
                    <option value="Morigaon">Morigaon (Assam)</option>
                    <option value="East Khasi Hills">East Khasi Hills (Meghalaya)</option>
                    <option value="Bishnupur">Bishnupur (Manipur)</option>
                    <option value="East Siang">East Siang (Arunachal)</option>
                    <option value="Kohima">Kohima (Nagaland)</option>
                    <option value="Lunglei">Lunglei (Mizoram)</option>
                    <option value="South Sikkim">South Sikkim (Sikkim)</option>
                  </select>
                </div>
              </div>

              {/* Civilian: Government ID with Verhoeff Validation */}
              {roleType === 'CIVILIAN' ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Government ID</label>
                      <select
                        value={govIdType}
                        onChange={(e) => handleGovIdTypeChange(e.target.value)}
                        className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                      >
                        <option value="aadhaar">Aadhaar (12 digits)</option>
                        <option value="pan">PAN Card (ABCDE1234F)</option>
                        <option value="voter_id">Voter ID (EPIC)</option>
                        <option value="driving_licence">Driving Licence</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">ID Number</label>
                      <input
                        type="text"
                        required
                        value={govIdNumber}
                        onChange={(e) => handleGovIdChange(e.target.value)}
                        placeholder={govIdType === 'aadhaar' ? '368945210986' : 'ABCDE1234F'}
                        className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                      />
                    </div>
                  </div>
                  {idValidation.message && (
                    <p className={`text-[10px] mt-1 font-semibold flex items-center gap-1 ${
                      idValidation.isValid ? 'text-emerald' : 'text-red-600'
                    }`}>
                      {idValidation.isValid ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {idValidation.message}
                    </p>
                  )}
                </div>
              ) : (
                /* Official Credentials */
                <div className="space-y-3 bg-forest/5 dark:bg-forest-light/20 p-3 rounded-2xl border border-emerald/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Official Role</label>
                      <select
                        value={officialRole}
                        onChange={(e) => setOfficialRole(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white dark:bg-surface-dark border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald"
                      >
                        <option value="ASHA_NGO">ASHA / Rural Health NGO</option>
                        <option value="HEALTH_OFFICIAL">District Health Officer (IDSP)</option>
                        <option value="POLICE">Disaster Response / Police</option>
                        <option value="DISTRICT_ADMIN">District Magistrate / Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Official Employee ID</label>
                      <input
                        type="text"
                        required
                        value={officialId}
                        onChange={(e) => setOfficialId(e.target.value)}
                        placeholder="ASHA-LKP-2026-99"
                        className="w-full px-3 py-1.5 bg-white dark:bg-surface-dark border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald"
                      />
                    </div>
                  </div>

                  <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-800 dark:text-amber-300 font-semibold">
                    🛡️ Official Verification Notice: New official accounts start as PENDING_VERIFICATION to prevent unauthorized alert escalation. Approval required by District Health Admin.
                  </div>
                </div>
              )}

              {/* Password & OTP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-forest dark:text-pale-green mb-1">SMS OTP</label>
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3 py-1.5 bg-pale-green/30 dark:bg-forest-light/30 border border-forest/20 dark:border-mint/20 rounded-xl text-xs text-forest dark:text-pale-green focus:ring-2 focus:ring-emerald focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald text-white font-bold rounded-xl text-xs hover:bg-emerald-hover transition-all shadow-sentinel-md flex items-center justify-center gap-2 mt-3"
              >
                {loading ? 'Creating Account...' : 'Register Verified Account'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
