
import React from 'react';

const LogoImageMini: React.FC<{
  className?: string;
}> = ({ className }) => {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/mobiledevtests-e9c70.appspot.com/o/download-PhotoRoom.png-PhotoRoom.png?alt=media&token=505d5a64-69ce-40e3-b13e-c5a52783e4f7'; // Replace with your actual image URL

  return (
    <img
      className={`${className ?? 'w-[95px] sm:w-[105px]'}`}
      src={logoUrl}
      alt="Logo"
    />
  );
};

export default LogoImageMini;