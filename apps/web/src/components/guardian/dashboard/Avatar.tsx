interface AvatarProps {
  initials: string;
  src?: string;
  size?: number;
}

export default function Avatar({ initials, src, size = 44 }: AvatarProps) {
  return (
    <div
      className="rounded-full bg-teal text-white flex items-center justify-center shrink-0 font-semibold tracking-[0.04em] shadow-[0_2px_8px_rgba(58,90,90,.28)]"
      style={{ width: size, height: size, fontSize: size * 0.33 }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${initials} avatar`}
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </div>
  );
}
