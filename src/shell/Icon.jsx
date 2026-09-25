const paths = {
  arrow: 'M4 12h16m-6-6 6 6-6 6',
  back: 'M20 12H4m6-6-6 6 6 6',
  plus: 'M12 5v14M5 12h14',
  search: 'M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  copy: 'M9 5V3h12v14h-3M3 7h12v14H3z',
  check: 'M5 12l4 4L19 6',
  play: 'M7 4l13 8-13 8z',
  refresh: 'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 3M18 18A8 8 0 0 1 5 15',
  expand: 'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',
  collapse: 'M3 8h5V3m8 0v5h5M8 21v-5H3m13 5v-5h5',
  book: 'M12 5v16M12 5C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1',
  monitor: 'M3 3h18v13H3zM12 16v5M8 21h8',
  close: 'm6 6 12 12M6 18 18 6',
  file: 'M14 2H4v20h16V8zm0 0v6h6M8 13h8M8 17h6',
  download: 'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
};

export default function Icon({ name, size = 18, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
