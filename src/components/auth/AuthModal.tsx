import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Lock,
  User,
  Chrome,
  Phone,
  Truck,
  ShoppingBag,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useStore } from "../../store/useStore";
import useAuth from "../../hooks/useAuth";
import IDVerification from "./IDVerification";
import { signInWithEmail, signUpWithEmail } from "../../utils/auth";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "signin" | "signup" | "verify";
}

interface FieldError {
  email: string;
  password: string;
  name: string;
  phone: string;
  confirmPassword: string;
}

const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialView = "signin",
}) => {
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [userType, setUserType] = useState<"isDriver" | "isCustomer">(
    "isCustomer"
  );
  const [fieldErrors, setFieldErrors] = useState<FieldError>({
    email: "",
    password: "",
    name: "",
    phone: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationImages, setVerificationImages] = useState<{
    front?: string;
    back?: string;
    selfie?: string;
  }>({});
  const { setUser } = useStore();
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      resetFormState();
    }
  }, [isOpen, initialView]);

  const resetFormState = () => {
    setEmail("");
    setPassword("");
    setName("");
    setPhone("");
    setConfirmPassword("");
    setFieldErrors({
      email: "",
      password: "",
      name: "",
      phone: "",
      confirmPassword: "",
    });
  };

  const isFormComplete = () => {
    if (view === "signup") {
      return (
        email.trim() !== "" &&
        password.trim() !== "" &&
        name.trim() !== "" &&
        phone.trim() !== "" &&
        confirmPassword.trim() !== "" &&
        password === confirmPassword
      );
    }
    return true;
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, "");

    // Format as (XXX) XXX-XXXX
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(
        3,
        6
      )}-${phoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhone(formattedNumber);

    // Clear phone error when user starts typing
    setFieldErrors((prev) => ({
      ...prev,
      phone: "",
    }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    const newFieldErrors: FieldError = {
      email: "",
      password: "",
      name: "",
      phone: "",
      confirmPassword: "",
    };

    // Email validation
    if (!email) {
      newFieldErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newFieldErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newFieldErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    if (view === "signup") {
      // Name validation
      if (!name) {
        newFieldErrors.name = "Name is required";
        isValid = false;
      }

      // Phone validation
      const phoneDigits = phone.replace(/\D/g, "");
      if (!phone) {
        newFieldErrors.phone = "Phone number is required";
        isValid = false;
      } else if (phoneDigits.length !== 10) {
        newFieldErrors.phone = "Please enter a valid 10-digit phone number";
        isValid = false;
      }

      // Confirm password validation
      if (!confirmPassword) {
        newFieldErrors.confirmPassword = "Please confirm your password";
        isValid = false;
      } else if (confirmPassword !== password) {
        newFieldErrors.confirmPassword = "Passwords do not match";
        isValid = false;
      }
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (view === "signin") {
        try {
          const user = await signInWithEmail(email, password);
          setUser({
            id: user.userData.id,
            email: user.userData.email,
            name: user.userData.name,
            isVerified: user.userData.isVerified,
            membershipLevel: user.userData.membershipLevel,
            isAdmin: user.userData.isAdmin || false,
            isDriver: user.userData.isDriver || false,
            isCustomer: user.userData.isCustomer || false,
            points: user.userData.points || 0,
            skyBucks: user.userData.skyBucks || 0,
            deliveryAddresses: user.userData.deliveryAddresses || [],
            paymentMethods: user.userData.paymentMethods || [],
            events: user.userData.events || ["e1"],
            referralCode: user.userData.referralCode || "",
            purchaseCount: user.userData.purchaseCount || 0,
            orders: [],
            availableDiscounts: user.userData.availableDiscounts || {
              firstPurchase: 20,
              secondPurchase: 10,
              thirdPurchase: 5,
            },
          });
          onClose();
        } catch (err) {
          // Map backend errors to specific fields
          const errorMsg =
            err instanceof Error ? err.message : "An unknown error occurred";

          if (
            errorMsg.toLowerCase().includes("email") ||
            errorMsg.toLowerCase().includes("user")
          ) {
            setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
          } else if (errorMsg.toLowerCase().includes("password")) {
            setFieldErrors((prev) => ({ ...prev, password: errorMsg }));
          } else if (
            errorMsg.toLowerCase().includes("invalid credentials") ||
            errorMsg.toLowerCase().includes("not found")
          ) {
            setFieldErrors((prev) => ({
              ...prev,
              email: "Invalid email or password",
              password: "Invalid email or password",
            }));
          } else {
            // If we can't map to a specific field, show error on password field as a fallback
            setFieldErrors((prev) => ({ ...prev, password: errorMsg }));
          }
          throw err;
        }
      } else if (view === "signup") {
        try {
          const result = await signUpWithEmail(
            email,
            password,
            name,
            userType,
            phone
          );
          if (result.success) {
            setView("verify");
          } else {
            throw new Error(result.error || "Sign up failed");
          }
        } catch (err) {
          const errorMsg =
            err instanceof Error ? err.message : "An unknown error occurred";

          if (
            errorMsg.toLowerCase().includes("email") ||
            errorMsg.toLowerCase().includes("already exists")
          ) {
            setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
          } else if (errorMsg.toLowerCase().includes("password")) {
            setFieldErrors((prev) => ({ ...prev, password: errorMsg }));
          } else if (errorMsg.toLowerCase().includes("name")) {
            setFieldErrors((prev) => ({ ...prev, name: errorMsg }));
          } else if (errorMsg.toLowerCase().includes("phone")) {
            setFieldErrors((prev) => ({ ...prev, phone: errorMsg }));
          } else {
            // If we can't map to a specific field, show error on email field as a fallback
            setFieldErrors((prev) => ({ ...prev, email: errorMsg }));
          }
          throw err;
        }
      }
    } catch (err) {
      // Error handling is done in the try-catch blocks above
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerificationComplete = (images: {
    front?: string;
    back?: string;
    selfie?: string;
  }) => {
    setVerificationImages(images);
    onClose();
  };

  const getInputClassName = (fieldName: keyof FieldError) => {
    return `w-full pl-10 pr-${
      fieldName.includes("password") ? "12" : "4"
    } py-2 rounded-lg bg-white/10 border transition-colors ${
      fieldErrors[fieldName]
        ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
        : "border-white/20 focus:border-purple-500"
    }`;
  };

  const ErrorMessage: React.FC<{ message: string }> = ({ message }) => {
    if (!message) return null;

    return (
      <div className="flex items-start mt-1 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
        <span>{message}</span>
      </div>
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof FieldError
  ) => {
    const { value } = e.target;

    // Update state based on field
    if (field === "email") setEmail(value);
    else if (field === "password") setPassword(value);
    else if (field === "name") setName(value);
    else if (field === "confirmPassword") setConfirmPassword(value);

    // Clear field error
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));

    // Additional validation for password fields
    if (field === "password" && confirmPassword) {
      if (value !== confirmPassword) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }

    if (field === "confirmPassword" && password) {
      if (value !== password) {
        setFieldErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const changeView = (newView: "signin" | "signup") => {
    setView(newView);
    resetFormState();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          onClick={(e) =>
            e.target === e.currentTarget && !isLoading && onClose()
          }
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="glass p-6 rounded-2xl max-w-md w-full relative"
          >
            {!isLoading && view !== "verify" && (
              <button
                onClick={() => onClose()}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {view === "signin" ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => handleInputChange(e, "email")}
                        className={getInputClassName("email")}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorMessage message={fieldErrors.email} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleInputChange(e, "password")}
                        className={getInputClassName("password")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage message={fieldErrors.password} />
                  </div>
                  <button
                    type="submit"
                    className="w-full button-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Signing in...
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => changeView("signup")}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isLoading}
                  >
                    Sign Up
                  </button>
                </p>

                {/* Demo Account Info */}
                <div className="mt-6 p-4 bg-white/5 rounded-lg">
                  <p className="text-sm font-medium mb-2">Demo Accounts:</p>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Admin: admin@skyclub.com / admin123</p>
                    <p>Customer: customer@skyclub.com / customer123</p>
                    <p>Driver: driver@skyclub.com / driver123</p>
                  </div>
                </div>
              </div>
            ) : view === "signup" ? (
              <div>
                <h2 className="text-2xl font-bold mb-6">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => handleInputChange(e, "name")}
                        className={getInputClassName("name")}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorMessage message={fieldErrors.name} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => handleInputChange(e, "email")}
                        className={getInputClassName("email")}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorMessage message={fieldErrors.email} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone Number (US)
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(123) 456-7890"
                        className={getInputClassName("phone")}
                        disabled={isLoading}
                      />
                    </div>
                    <ErrorMessage message={fieldErrors.phone} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => handleInputChange(e, "password")}
                        className={getInputClassName("password")}
                        minLength={6}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage message={fieldErrors.password} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) =>
                          handleInputChange(e, "confirmPassword")
                        }
                        className={getInputClassName("confirmPassword")}
                        minLength={6}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage message={fieldErrors.confirmPassword} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Account Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setUserType("isCustomer")}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                          userType === "isCustomer"
                            ? "bg-purple-600 border-purple-500"
                            : "border border-white/20 hover:bg-white/5"
                        }`}
                        disabled={isLoading}
                      >
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        <span>Customer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setUserType("isDriver")}
                        className={`px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                          userType === "isDriver"
                            ? "bg-purple-600 border-purple-500"
                            : "border border-white/20 hover:bg-white/5"
                        }`}
                        disabled={isLoading}
                      >
                        <Truck className="w-5 h-5 mr-2" />
                        <span>Driver</span>
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full button-primary ${
                      !isFormComplete() ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading || !isFormComplete()}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
                        Processing...
                      </div>
                    ) : (
                      "Continue to Verification"
                    )}
                  </button>
                </form>
                <p className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => changeView("signin")}
                    className="text-purple-400 hover:text-purple-300"
                    disabled={isLoading}
                  >
                    Sign In
                  </button>
                </p>
              </div>
            ) : (
              <IDVerification
                onVerified={handleVerificationComplete}
                onClose={onClose}
                userType={userType}
              />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;