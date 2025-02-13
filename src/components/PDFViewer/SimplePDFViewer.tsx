import React from "react";

interface SimplePDFViewerProps {
  url: string;
}

export const SimplePDFViewer: React.FC<SimplePDFViewerProps> = ({ url }) => {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <embed src={url} type="application/pdf" width="100%" height="100%" />
    </div>
  );
};
