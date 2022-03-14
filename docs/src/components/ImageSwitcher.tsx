import React from "react";
import { useColorMode } from "@docusaurus/theme-common";

const ImageSwitcher = ({
  lightImageSrc,
  darkImageSrc,
  alt,
  width,
}: {
  lightImageSrc: string;
  darkImageSrc: string;
  alt: string;
  width: string;
}) => {
  const { isDarkTheme } = useColorMode();

  return (
    <img
      src={isDarkTheme ? darkImageSrc : lightImageSrc}
      alt={alt}
      style={{ width }}
    />
  );
};

export default ImageSwitcher;
