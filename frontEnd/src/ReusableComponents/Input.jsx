import React, { useId, forwardRef } from "react";

const Input = forwardRef(function Input(
  { label, type = "text", className = "", ...props },
  forwardedRef,
) {
  const id = useId();

  // react-hook-form's `register` provides a `ref` (function or ref object) via props.ref.
  // We need to call both the register ref and the forwarded ref when the input mounts.
  const registerRef = props.ref;
  // remove ref from props so it doesn't get passed as regular prop
  const { ref: _r, ...rest } = props;

  const setRefs = (el) => {
    if (typeof registerRef === "function") registerRef(el);
    else if (registerRef && typeof registerRef === "object")
      registerRef.current = el;

    if (typeof forwardedRef === "function") forwardedRef(el);
    else if (forwardedRef && typeof forwardedRef === "object")
      forwardedRef.current = el;
  };

  return (
    <div className="w-full">
      {label && (
        <label className="inline-block mb-1 pl-1" htmlFor={id} title={id}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={`px-3 bg-transparent py-2  rounded-lg text-white outline-none focus:bg-gray-700 transition-all duration-300 ${className}`}
        id={id}
        {...rest}
        title={id}
        ref={setRefs}
      />
    </div>
  );
});

export default Input;
