import React from "react";

function Button(
  {
    children,
    type = "button",
    textColor = "text-white",
    bgColor = "bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    className = "",
    ...props
  },
  ref,
) {
  return (
    <div className="w-full">
      <button
        type={type}
        className={`${bgColor} px-8 py-3 ${textColor} font-bold ${className}`}
        {...props}
      >
        {children}
      </button>
    </div>
  );
}

export default Button;
