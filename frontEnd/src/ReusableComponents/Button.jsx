import React from "react";

function Button(
  {
    children,
    type = "button",
    textColor = "text-white",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div className="w-full">
      <button
        type={type}
        className={`bg-linear-to-r from-blue-600 to-purple-600 px-8 py-3 text-white font-bold hover:from-blue-700 hover:to-purple-700 ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

export default Button;
