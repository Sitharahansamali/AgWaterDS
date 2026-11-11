export default function Logo({ size = 32, className = '' }) {
  return (
    <div
      className={`brand-logo-badge ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <svg
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Stylized water droplet & plant leaf */}
        <path
          d="M12 2.5C12 2.5 5 11 5 15.5C5 19.09 7.91 22 11.5 22C12.36 22 13.18 21.83 13.93 21.53C13.2 20.31 12.75 18.89 12.75 17.38C12.75 13.56 15.34 10.34 18.86 9.42C17.26 5.86 12 2.5 12 2.5Z"
          fill="#FFFFFF"
        />
        <path
          d="M17.5 11.5C15.01 11.5 13 13.51 13 16C13 18.49 15.01 20.5 17.5 20.5C19.99 20.5 22 18.49 22 16C22 13.51 19.99 11.5 17.5 11.5ZM17.5 19C15.84 19 14.5 17.66 14.5 16C14.5 14.34 15.84 13 17.5 13C19.16 13 20.5 14.34 20.5 16C20.5 17.66 19.16 19 17.5 19Z"
          fill="#E9F3F0"
        />
      </svg>
    </div>
  )
}
