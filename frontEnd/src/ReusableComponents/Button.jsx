function Button(
  {
    children,
    type = "button",
    textColor = "text-white",
    bgColor = "bg-linear-to-r from-gray-400 to-gray-600 hover:from-gray-700 hover:to-gray-700",
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
