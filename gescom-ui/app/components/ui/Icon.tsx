export type IconName =
  | "home" | "incidents" | "user" | "users" | "logout" | "building" | "plus" | "search" | "filter"
  | "download" | "camera" | "check" | "close" | "mail" | "lock" | "edit" | "copy" | "arrowLeft"
  | "arrowRight" | "clock" | "image" | "menu";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>,
  incidents: <><path d="M12 3L2 21h20L12 3z" /><path d="M12 10v5" /><path d="M12 18h.01" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" /><circle cx="17" cy="9" r="2.5" /><path d="M17 14c3 0 5 2 5 5" /></>,
  logout: <><path d="M9 4H4v16h5" /><path d="M16 8l4 4-4 4" /><path d="M20 12H9" /></>,
  building: <><rect x="5" y="3" width="14" height="18" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5z" />,
  download: <><path d="M12 3v12" /><path d="M7 11l5 5 5-5" /><path d="M4 20h16" /></>,
  camera: <><path d="M3 8h4l2-3h6l2 3h4v12H3V8z" /><circle cx="12" cy="13" r="4" /></>,
  check: <path d="M5 12l5 5 9-10" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>,
  edit: <path d="M4 20l1-5L16 4l4 4L9 19l-5 1z" />,
  copy: <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3" /></>,
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></>,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
};

type IconProps = { name: IconName; className?: string };

export default function Icon({ name, className = "h-5 w-5" }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
