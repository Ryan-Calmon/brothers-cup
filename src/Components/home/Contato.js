import { FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";

const SOCIALS = [
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/brotherscup_ftv/",
    label: "Instagram",
    color: "hover:text-pink-400",
  },
  {
    icon: FaTiktok,
    href: "https://www.tiktok.com/@brotherscup_ftv",
    label: "TikTok",
    color: "hover:text-cyan-400",
  },
  {
    icon: FaWhatsapp,
    href: "https://wa.me/+5521959096545",
    label: "WhatsApp",
    color: "hover:text-green-400",
  },
  {
    icon: MdOutlineEmail,
    href: "mailto:comercial@brotherscup.com.br",
    label: "Email",
    color: "hover:text-yellow-400",
  },
];

export default function Contato() {
  return (
    <section className="py-12 px-4 text-center">
      <h2 className="text-2xl font-bold text-white mb-8">Contato</h2>
      <div className="flex justify-center gap-8">
        {SOCIALS.map(({ icon: Icon, href, label, color }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className={`text-brand-300 ${color} transition-all duration-300 text-4xl hover:scale-110`}
          >
            <Icon />
          </a>
        ))}
      </div>
    </section>
  );
}
