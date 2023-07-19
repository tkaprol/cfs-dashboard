import React from 'react';

const CustomImage = ({ alt, src,width }) => (
  <img src={src} alt={alt} style={{ maxWidth: '1402px',margin:'auto',display:'flex' }} />
);

export default CustomImage;
