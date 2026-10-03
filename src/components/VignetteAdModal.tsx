import React, { useEffect } from 'react';

interface VignetteAdModalProps {
  isOpen: boolean;
  rewardType: 'unlock_test' | 'reattempt' | 'pdf_download';
  details?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VignetteAdModal({
  isOpen,
  onSuccess,
}: VignetteAdModalProps) {
  useEffect(() => {
    if (isOpen && onSuccess) {
      onSuccess();
    }
  }, [isOpen, onSuccess]);

  return null;
}
