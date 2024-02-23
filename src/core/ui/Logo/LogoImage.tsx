
import React from 'react';

const LogoImage: React.FC<{
  className?: string;
}> = ({ className }) => {
  const logoUrl = 'https://firebasestorage.googleapis.com/v0/b/tubcadmintest.appspot.com/o/Tri-State%20Benefits%20Logo-PhotoRoom.png-PhotoRoom.png?alt=media&token=e1fbc40f-167c-4afe-9f33-971a1331e599'; // Replace with your actual image URL

  return (
    <img
      className={`${className ?? 'w-[95px] sm:w-[105px]'}`}
      src={logoUrl}
      alt="Logo"
    />
  );
};

export default LogoImage;