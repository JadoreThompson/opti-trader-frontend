import React, { useEffect } from "react";

const SiteThemeSwitch: React.FC = () => {
  function changeTheme(e: React.ChangeEvent<HTMLInputElement>): void {
    if (document.body.getAttribute("data-theme") === "dark") {
      document.body.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    } else {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    }
  }

  useEffect(() => {
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme) {
      document.body.setAttribute("data-theme", currentTheme);
    } else {
      localStorage.setItem("theme", "light");
    }
  }, []);

  return (
    <label className="switch">
      <input type="checkbox" onChange={changeTheme} />
      <span className="slider">Change Theme</span>
    </label>
  );
};

export default SiteThemeSwitch;
