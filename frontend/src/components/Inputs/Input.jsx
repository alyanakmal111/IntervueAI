import React, { useState } from "react";
import {
  FaRegEye,
  FaRegEyeSlash,
  FaUser,
  FaEnvelope,
  FaLock,
} from "react-icons/fa";

const Input = ({
  value,
  onChange,
  label,
  placeholder,
  type,
  icon: Icon,
  required = false,
  textArea = false,
  rows = 3,
  disabled = false,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <div
          className={`absolute left-0 pl-3 flex ${
            textArea ? "items-start pt-4" : "inset-y-0 items-center"
          } pointer-events-none`}
        >
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
        </div>

        {textArea ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`block w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
          />
        ) : (
          <input
            type={
              type === "password" ? (showPassword ? "text" : "password") : type
            }
            disabled={disabled}
            placeholder={placeholder}
            className={`block w-full ${
              Icon ? "pl-10" : "pl-4"
            } pr-12 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition duration-200`}
            value={value}
            onChange={(e) => onChange(e)}
          />
        )}

        {type === "password" && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {showPassword ? (
              <FaRegEye
                size={20}
                className="cursor-pointer text-emerald-500"
                onClick={togglePasswordVisibility}
              />
            ) : (
              <FaRegEyeSlash
                size={20}
                className="cursor-pointer text-slate-400"
                onClick={togglePasswordVisibility}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Input;
