import { useState, useEffect } from "react";

export const useSplashScreen = (options = {}) => {
  const {
    duration = 3000,
    showProgress = true,
    steps = [
      "Khởi tạo hệ thống...",
      "Kết nối cơ sở dữ liệu...",
      "Tải dữ liệu người dùng...",
      "Hoàn tất khởi động...",
    ],
    onComplete,
  } = options;

  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!showProgress) {
      // Simple splash screen without progress
      const timer = setTimeout(() => {
        setIsComplete(true);
        setTimeout(() => {
          setIsVisible(false);
          onComplete?.();
        }, 500);
      }, duration);

      return () => clearTimeout(timer);
    }

    // Progress-based splash screen
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(progressInterval);
          setTimeout(() => {
            setIsVisible(false);
            onComplete?.();
          }, 500);
          return 100;
        }
        return prev + 100 / (duration / 50); // Adjust speed based on duration
      });
    }, 50);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, duration / steps.length);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [duration, showProgress, steps, onComplete]);

  return {
    progress,
    currentStep,
    isComplete,
    isVisible,
    currentStepText: steps[currentStep],
  };
};
