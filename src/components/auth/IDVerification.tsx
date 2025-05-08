import React, { useState, useRef, useCallback } from 'react';
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import {
  Camera,
  Upload,
  CheckCircle,
  ArrowLeft,
  RotateCw,
  X,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import toast from "react-hot-toast";

interface Props {
  onVerified: (images: {
    front?: string;
    back?: string;
    selfie?: string;
  }) => void;
  onClose: () => void;
  userType: "isDriver" | "isCustomer";
}

type VerificationStep = "front" | "back" | "selfie" | "processing" | "complete";

const IDVerification: React.FC<Props> = ({ onVerified, onClose, userType }) => {
  const [step, setStep] = useState<VerificationStep>("front");
  const [images, setImages] = useState<{
    [key in "front" | "back" | "selfie"]?: string;
  }>({});
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment"
  );
  const [isMobile] = useState(() =>
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  );
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, setUser } = useStore();
  const navigate = useNavigate();

  const videoConstraints = {
    facingMode,
    width: { ideal: 1280 },
    height: { ideal: 720 },
  };

  const toggleCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    setImages((prev) => ({ ...prev, [step]: imageSrc }));

    if (step === "front") {
      setStep("back");
    } else if (step === "back") {
      setStep("selfie");
      setFacingMode("user");
    } else if (step === "selfie") {
      setStep("processing");
      processVerification(imageSrc);
    }
  }, [step]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setImages((prev) => ({ ...prev, [step]: imageData }));

      if (step === "front") {
        setStep("back");
      } else if (step === "back") {
        setStep("selfie");
        setFacingMode("user");
      } else if (step === "selfie") {
        setStep("processing");
        processVerification(imageData);
      }
    };
    reader.readAsDataURL(file);
  };

  const processVerification = async (selfieImage: string) => {
    if (!images.front || !images.back || !selfieImage) {
      setStep("front");
      return;
    }

    try {
      setStep("processing");
      await new Promise((resolve) => setTimeout(resolve, 3500)); 

      // For now, we'll just mark the user as verified without actual verification
      if (user) {
        await setDoc(
          doc(db, "users", user.id),
          {
            isVerified: true,
            verificationDate: new Date().toISOString(),
            // Also set the userType explicitly
            [userType]: true,
          },
          { merge: true }
        );

        if (user) {
          setUser({ ...user, isVerified: true, [userType]: true });
        }
      }

      setStep("complete");

      // Use setTimeout to ensure smooth transition
      setTimeout(() => {
        onVerified({
          front: images.front,
          back: images.back,
          selfie: selfieImage,
        });
        onClose();
        toast.success("Account created successfully!");
      }, 3500);
    } catch (error) {
      console.error("Verification error:", error);
      setStep("front");
    }
  };

  return (
    <div className="max-w-md mx-auto relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full z-10"
      >
        <X className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-6 rounded-2xl"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">
            {step === "front" && "Front of ID"}
            {step === "back" && "Back of ID"}
            {step === "selfie" && "Selfie Verification"}
            {step === "processing" && "Processing"}
            {step === "complete" && "Verification Complete"}
          </h2>
          <p className="text-gray-300">
            {step === "front" &&
              "Please take a clear photo of the front of your government-issued ID"}
            {step === "back" && "Now take a photo of the back of your ID"}
            {step === "selfie" && "Take a clear selfie for face matching"}
            {step === "processing" && "Please wait while we verify your ID..."}
            {step === "complete" && "Your ID has been verified successfully!"}
          </p>
        </div>

        {["front", "back", "selfie"].includes(step) && (
          <div className="space-y-6">
            <div className="relative">
              <Webcam
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full rounded-lg"
                videoConstraints={videoConstraints}
                mirrored={facingMode === "user"}
              />
              {step !== "selfie" && (
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
                className={`${
                  isMobile ? "col-span-3" : "col-span-1"
                } px-6 py-3 rounded-full border border-white/20 text-white hover:bg-white/10 transition flex items-center justify-center`}
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

        {step === "processing" && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Verifying your ID...</p>
          </div>
        )}

        {step === "complete" && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <p>Verification Completed...</p>
          </div>
        )}

        {["front", "back", "selfie"].includes(step) && step !== "front" && (
          <button
            onClick={() =>
              setStep((prev) =>
                prev === "back" ? "front" : prev === "selfie" ? "back" : "front"
              )
            }
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