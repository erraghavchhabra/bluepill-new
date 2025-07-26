import React from "react";

function Footer() {
  return (
    <footer className="bg-white py-4 px-4 shadow-inner fixed bottom-0 left-0 w-full">
      <div className="container mx-auto text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Bluepill Inc.
      </div>
    </footer>
  );
}

export default Footer;
