import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config';

/**
 * Uploads a video response blob to Firebase Storage and returns the download URL.
 * File path: video_responses/{userId}/{interviewId}/{questionId}.webm
 */
export const uploadVideoResponse = async (
  userId: string,
  interviewId: string,
  questionId: string,
  videoBlob: Blob
): Promise<string> => {
  const path = `video_responses/${userId}/${interviewId}/${questionId}.webm`;
  const storageRef = ref(storage, path);
  
  // Upload the blob
  await uploadBytes(storageRef, videoBlob);
  
  // Get download URL
  const downloadUrl = await getDownloadURL(storageRef);
  return downloadUrl;
};
