import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ size = 24 }) => {
  return <Loader2 className="animate-spin " size={size} />;
};

export default Loader;
