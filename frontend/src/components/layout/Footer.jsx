const FOOTER_LINKS = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Support', to: '/support' },
  { label: 'About Us', to: '/about' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-[#EBE7E4]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <p className="text-lg font-extrabold text-gold-dark">RoomEase</p>
          <p className="mt-1 text-sm text-text-soft">© 2024 RoomEase Phnom Penh. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <a key={link.to} href={link.to} className="text-sm text-text-soft hover:text-text">
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
