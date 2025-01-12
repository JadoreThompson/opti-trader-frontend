import { useEffect, useState } from "react";

export const useBodyStyles = (): CSSStyleDeclaration => {
  const [bodyStyles, setBodyStyles] = useState<CSSStyleDeclaration>(
    window.getComputedStyle(document.body)
  );

  useEffect(() => {
    const updateStyles = () => {
      setBodyStyles(window.getComputedStyle(document.body));
    }
    const observer = new MutationObserver(() => updateStyles());
    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return bodyStyles;
};
