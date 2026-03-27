import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const SOCIALS = [
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/brotherscup_ftv/",
    label: "Instagram",
  },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@brotherscup_ftv",
    label: "TikTok",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/+5521959096545",
    label: "WhatsApp",
  },
  {
    icon: MdOutlineEmail,
    href: "mailto:comercial@brotherscup.com.br",
    label: "Email",
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-brand-800/30 bg-black/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Social Links */}
        <div className="flex justify-center gap-6 mb-6">
          {SOCIALS.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-brand-300 hover:text-brand-400 transition-colors text-2xl"
            >
              <Icon />
            </a>
          ))}
        </div>

        <div className="text-center text-brand-300/40 text-sm">
          <p>&copy; Brothers Cup {new Date().getFullYear()}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
