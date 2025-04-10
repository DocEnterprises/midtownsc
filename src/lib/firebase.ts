import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  getMetadata, 
  listAll,
  StorageReference,
  UploadTask,
  FirebaseStorage
} from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAmiukiPfbv2b_fY3f5-aVLwZZCs3mnZ_o",
  authDomain: "skyclub-661ba.firebaseapp.com",
  projectId: "skyclub-661ba",
  storageBucket: "skyclub-661ba.appspot.com",
  messagingSenderId: "659270052156",
  appId: "1:659270052156:web:3d0d5d1e41e7ca1a255639"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Upload Task Manager Class
class UploadTaskManager {
  private static instance: UploadTaskManager;
  private tasks: Map<string, {
    uploadTask: UploadTask;
    ref: StorageReference;
    onProgress?: (progress: number) => void;
    onComplete?: (url: string) => void;
    onError?: (error: Error) => void;
  }> = new Map();

  private constructor() {}

  static getInstance(): UploadTaskManager {
    if (!UploadTaskManager.instance) {
      UploadTaskManager.instance = new UploadTaskManager();
    }
    return UploadTaskManager.instance;
  }

  async addTask(
    id: string,
    file: File,
    callbacks?: {
      onProgress?: (progress: number) => void;
      onComplete?: (url: string) => void;
      onError?: (error: Error) => void;
    }
  ) {
    const fileName = `${id}-${file.name}`;
    const fileRef = ref(storage, `uploads/${fileName}`);

    try {
      const uploadTask = uploadBytesResumable(fileRef, file);
      
      this.tasks.set(id, {
        uploadTask,
        ref: fileRef,
        ...callbacks
      });

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          callbacks?.onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          callbacks?.onError?.(error);
          this.tasks.delete(id);
        },
        async () => {
          try {
            const url = await getDownloadURL(fileRef);
            callbacks?.onComplete?.(url);
            this.tasks.delete(id);
          } catch (error) {
            callbacks?.onError?.(error as Error);
            this.tasks.delete(id);
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      callbacks?.onError?.(error as Error);
    }
  }

  cancelTask(id: string) {
    const task = this.tasks.get(id);
    if (task) {
      task.uploadTask.cancel();
      this.tasks.delete(id);
    }
  }

  cancelAllTasks() {
    this.tasks.forEach((task) => {
      task.uploadTask.cancel();
    });
    this.tasks.clear();
  }

  getActiveTasks() {
    return Array.from(this.tasks.keys());
  }
}

// Create singleton instance of UploadTaskManager
export const uploadManager = UploadTaskManager.getInstance();

// Storage helper functions
export const downloadFile = async (fileRef: StorageReference): Promise<string> => {
  try {
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

export const listFiles = async (storageRef: StorageReference) => {
  try {
    return await listAll(storageRef);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

// Export all initialized services and functions
export { 
  app, 
  db, 
  auth, 
  storage,
  googleProvider,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  getMetadata,
  listAll
};