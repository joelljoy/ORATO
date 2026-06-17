import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from './config';
import { UserProfile } from '@/types/user';
import { Interview, VideoResponse } from '@/types/interview';
import { Resume } from '@/types/resume';
import { Report } from '@/types/report';

// ── User Profiles ──────────────────────────────────────────────

export const createUserProfile = async (user: User) => {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const profile: Partial<UserProfile> = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      targetRole: '',
      experienceLevel: 'mid',
      preferredInterviewType: 'technical',
      skillPreferences: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(ref, profile);
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
};

export const updateUserProfile = async (uid: string, data: Partial<UserProfile>) => {
  await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: new Date().toISOString() });
};

// ── Resumes ───────────────────────────────────────────────────

export const saveResume = async (uid: string, resume: Omit<Resume, 'id'>) => {
  const ref = await addDoc(collection(db, 'resumes'), {
    ...resume,
    userId: uid,
    uploadedAt: new Date().toISOString(),
  });
  return ref.id;
};

export const getUserResumes = async (uid: string): Promise<Resume[]> => {
  try {
    const q = query(
      collection(db, 'resumes'),
      where('userId', '==', uid),
      orderBy('uploadedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Resume));
  } catch (error: any) {
    console.warn('[Firestore] Falling back for getUserResumes due to missing index:', error);
    const fallbackQuery = query(
      collection(db, 'resumes'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(fallbackQuery);
    const resumes = snap.docs.map(d => ({ id: d.id, ...d.data() } as Resume));
    return resumes.sort((a, b) => {
      const dateA = a.uploadedAt || '';
      const dateB = b.uploadedAt || '';
      return dateB.localeCompare(dateA);
    });
  }
};

export const getResume = async (id: string): Promise<Resume | null> => {
  const snap = await getDoc(doc(db, 'resumes', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Resume) : null;
};

export const deleteResume = async (id: string) => {
  await deleteDoc(doc(db, 'resumes', id));
};

// ── Interviews ────────────────────────────────────────────────

export const createInterview = async (uid: string, data: Omit<Interview, 'id' | 'createdAt'>) => {
  const ref = await addDoc(collection(db, 'interviews'), {
    ...data,
    userId: uid,
    createdAt: new Date().toISOString(),
  });
  return ref.id;
};

export const getInterview = async (id: string): Promise<Interview | null> => {
  const snap = await getDoc(doc(db, 'interviews', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Interview) : null;
};

export const updateInterview = async (id: string, data: Partial<Interview>) => {
  await updateDoc(doc(db, 'interviews', id), data);
};

export const getUserInterviews = async (uid: string, limitCount = 20): Promise<Interview[]> => {
  try {
    const q = query(
      collection(db, 'interviews'),
      where('userId', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Interview));
  } catch (error: any) {
    console.warn('[Firestore] Falling back for getUserInterviews due to missing index:', error);
    const fallbackQuery = query(
      collection(db, 'interviews'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(fallbackQuery);
    const interviews = snap.docs.map(d => ({ id: d.id, ...d.data() } as Interview));
    return interviews
      .sort((a, b) => {
        const dateA = a.createdAt || '';
        const dateB = b.createdAt || '';
        return dateB.localeCompare(dateA);
      })
      .slice(0, limitCount);
  }
};

export const getRecentInterviews = async (uid: string): Promise<Interview[]> => {
  return getUserInterviews(uid, 5);
};

// ── Reports ───────────────────────────────────────────────────

export const saveReport = async (uid: string, report: Omit<Report, 'id'>) => {
  const ref = await addDoc(collection(db, 'reports'), {
    ...report,
    userId: uid,
    generatedAt: new Date().toISOString(),
  });
  return ref.id;
};

export const getReport = async (id: string): Promise<Report | null> => {
  const snap = await getDoc(doc(db, 'reports', id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Report) : null;
};

export const getReportByInterview = async (interviewId: string): Promise<Report | null> => {
  const q = query(
    collection(db, 'reports'),
    where('interviewId', '==', interviewId),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Report;
};

export const getUserReports = async (uid: string): Promise<Report[]> => {
  try {
    const q = query(
      collection(db, 'reports'),
      where('userId', '==', uid),
      orderBy('generatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
  } catch (error: any) {
    console.warn('[Firestore] Falling back for getUserReports due to missing index:', error);
    const fallbackQuery = query(
      collection(db, 'reports'),
      where('userId', '==', uid)
    );
    const snap = await getDocs(fallbackQuery);
    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() } as Report));
    return reports.sort((a, b) => {
      const dateA = a.generatedAt || '';
      const dateB = b.generatedAt || '';
      return dateB.localeCompare(dateA);
    });
  }
};

// ── Settings ──────────────────────────────────────────────────

export const getUserSettings = async (uid: string) => {
  const snap = await getDoc(doc(db, 'settings', uid));
  return snap.exists() ? snap.data() : { theme: 'light', emailNotifications: true };
};

export const updateUserSettings = async (uid: string, data: Record<string, unknown>) => {
  await setDoc(doc(db, 'settings', uid), data, { merge: true });
};

// ── Video Responses ───────────────────────────────────────────

export const saveVideoResponse = async (videoResponse: Omit<VideoResponse, 'id'>) => {
  const ref = await addDoc(collection(db, 'videoResponses'), {
    ...videoResponse,
    timestamp: new Date().toISOString(),
  });
  return ref.id;
};

export const getVideoResponsesByInterview = async (interviewId: string): Promise<VideoResponse[]> => {
  const q = query(
    collection(db, 'videoResponses'),
    where('interviewId', '==', interviewId),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as VideoResponse));
};

