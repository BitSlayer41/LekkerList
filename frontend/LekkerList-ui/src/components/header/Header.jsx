import React, { useState, useEffect } from "react";
import "./Header.css";
import logo from "../../images/companyLogo.jpeg";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div id="header" className={`header${scrolled ? "headerScrolled" : ""}`}>
      {/*Left: Logo and brand name*/}
      <div className="headerLeft">
        <div className="headerLogoWrapper">
          <img src={logo} alt="LekkerList Logo" className="headerLogo" />
        </div>

        <div className="headerBrandGroup">
          <span className="headerBrand">LekkerList</span>
          <span className="headerTagline">Mzansi's Marketplace</span>
        </div>
      </div>
      {/*Center: welcome - fades out on scroll*/}
      <div className="headerCenter">
        <p className="headerTitle">Welcome to LekkerList Marketplace</p>
        <p className="headerSubtitle">
          Discover and share your favourite products with our community
        </p>
      </div>
    </div>
  );
}
