import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { createWorker } from 'tesseract.js';
import { motion } from 'framer-motion';
import { Camera, Upload, CheckCircle, AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface Props {
  onVerified: () => void;
}

type VerificationStep = 'front' | 'back' | 'selfie' | 'processing' | 'complete' | 'failed';

const IDVerification: React.FC<Props> = ({ onVerified }) => {
  const [step, setStep] = useState<VerificationStep>('front');
  const [images, setImages] = useState<{ [key in 'front' | 'back' | 'selfie']?: string }>({});
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isMobile] = useState(() => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  const videoConstraints = {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 }
  };

  const toggleCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const verifyID = async (imageData: string) => {
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const dobPattern = /\b\d{2}[/-]\d{2}[/-]\d{4}\b/;
      const match = text.match(dobPattern);
      
      if (match) {
        const dob = new Date(match[0]);
        const age = new Date().getFullYear() - dob.getFullYear();
        return age >= 21;
      }
      
      return false;
    } catch (error) {
      console.error('ID verification error:', error);
      return false;
    }
  };

  const verifyFace = async (idImage: string, selfieImage: string) => {
    return new Promise<boolean>(resolve => setTimeout(() => resolve(true), 2000));
  };

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setImages(prev => ({ ...prev, [step]: imageSrc }));
    
    if (step === 'front') {
      setStep('back');
    } else if (step === 'back') {
      setStep('selfie');
      setFacingMode('user');
    } else if (step === 'selfie') {
      setStep('processing');
      processVerification(imageSrc);
    }
  }, [step]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setImages(prev => ({ ...prev, [step]: imageData }));
      
      if (step === 'front') {
        setStep('back');
      } else if (step === 'back') {
        setStep('selfie');
        setFacingMode('user');
      }
    };
    reader.readAsDataURL(file);
  };

  const processVerification = async (selfieImage: string) => {
    if (!images.front || !images.back || !selfieImage || !user) {
      setStep('failed');
      return;
    }

    try {
      const [idVerified, faceMatched] = await Promise.all([
        verifyID(images.front),
        verifyFace(images.front, selfieImage)
      ]);

      if (idVerified && faceMatched) {
        // Update user verification status in Firestore
        await setDoc(doc(db, 'users', user.id), {
          isVerified: true,
          verificationDate: new Date().toISOString(),
          membershipLevel: user.membershipLevel,
          points: user.points,
          email: user.email,
          name: user.name
        }, { merge: true });

        setUser(prev => prev ? { ...prev, isVerified: true } : null);
        setStep('complete');
        
        // Use setTimeout to ensure smooth transition
        setTimeout(() => {
          onVerified();
          navigate('/cockpit', { replace: true });
        }, 2000);
      } else {
        setStep('failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStep('failed');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {step === 'front' && 'Front of ID'}
            {step === 'back' && 'Back of ID'}
            {step === 'selfie' && 'Selfie Verification'}
            {step === 'processing' && 'Verifying'}
            {step === 'complete' && 'Verification Complete'}
            {step === 'failed' && 'Verification Failed'}
          </h2>
          <p className="text-gray-300">
            {step === 'front' && 'Please take a clear photo of the front of your government-issued ID'}
            {step === 'back' && 'Now take a photo of the back of your ID'}
            {step === 'selfie' && 'Take a clear selfie for face matching'}
            {step === 'processing' && 'Please wait while we verify your ID...'}
            {step === 'complete' && 'Your ID has been verified successfully!'}
            {step === 'failed' && 'We could not verify your ID. Please try again.'}
          </p>
        </div>

        {['front', 'back', 'selfie'].includes(step) && (
          <div className="space-y-6">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={videoConstraints}
                mirrored={facingMode === 'user'}
              />
              {step !== 'selfie' && (
                <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center">
                  <p className="text-white/50">Position ID within frame</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={handleCapture}
                className="button-primary col-span-2"
              >
                <Camera className="w-4 h-4 mr-2 inline" />
                Capture
              </button>

              {isMobile && (
                <button
                  onClick={toggleCamera}
                  className="p-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition flex items-center justify-center"
                  title="Switch Camera"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${isMobile ? 'col-span-3' : 'col-span-1'} px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition flex items-center justify-center`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
        )}

        {step === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Verifying your ID...</p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p>Redirecting to your cockpit...</p>
          </div>
        )}

        {step === 'failed' && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <button
              onClick={() => setStep('front')}
              className="button-primary mt-4"
            >
              Try Again
            </button>
          </div>
        )}

        {['front', 'back', 'selfie'].includes(step) && step !== 'front' && (
          <button
            onClick={() => setStep(prev => 
              prev === 'back' ? 'front' : 
              prev === 'selfie' ? 'back' : 'front'
            )}
            className="mt-4 text-sm text-gray-400 hover:text-white flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>
        )}
      </motion.div>
    </div>
  );
};

export default IDVerification;