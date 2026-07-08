function StarPath() {
  return 'M10 1l2.5 7.5H20l-6 4.5 2.5 7.5L10 15l-6.5 5L6 13l-6-4.5h7.5z';
}

function StarSvg({ fill, half, className }) {
  return (
    <svg className={className} viewBox="0 0 20 20">
      {half ? (
        <>
          <path d={StarPath()} fill="#e5e7eb" />
          <path d={StarPath()} fill="#facc15" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </>
      ) : (
        <path d={StarPath()} fill={fill} />
      )}
    </svg>
  );
}

const SIZE_MAP = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

export default function StarRating({ rating, size = 'sm' }) {
  const full = Math.floor(rating);
  const fraction = rating - full;
  const visualFull = fraction >= 0.7 ? full + 1 : full;
  const visualHalf = fraction >= 0.3 && fraction < 0.7 ? 1 : 0;
  const visualEmpty = 5 - visualFull - visualHalf;
  const cls = SIZE_MAP[size] || SIZE_MAP.sm;

  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: visualFull }).map((_, i) => (
        <StarSvg key={`f${i}`} fill="#facc15" className={cls} />
      ))}
      {visualHalf > 0 && <StarSvg half className={cls} />}
      {Array.from({ length: visualEmpty }).map((_, i) => (
        <StarSvg key={`e${i}`} fill="#e5e7eb" className={cls} />
      ))}
    </span>
  );
}
