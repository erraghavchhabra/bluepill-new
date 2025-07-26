import React from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  noContainer?: boolean; // Add a prop to hide the container div in the layout component (default is false)
}

const Layout: React.FC<LayoutProps> = ({
  children,
  className = "",
  noContainer,
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className={`flex-1  ${className}`}>
        <div className={noContainer ? "" : "container"}>{children}</div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
