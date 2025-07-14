import React from "react";
import Header from "./Header";

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
      {/* <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Bluepill Simulation Experience
        </div>
      </footer> */}
    </div>
  );
};

export default Layout;
