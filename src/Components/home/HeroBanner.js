import ImagemBanner from "../../images/terceiraetapaflyer.png";

export default function HeroBanner() {
  return (
    <section className="flex justify-center px-4 pt-4">
      <div className="w-full max-w-lg md:max-w-xl lg:max-w-2xl overflow-hidden rounded-2xl shadow-2xl shadow-brand-400/10 mx-auto">
        <img
          className="w-full h-auto object-contain max-h-[70vh]"
          src={ImagemBanner}
          alt="Brothers Cup - Quarta Etapa Futevôlei"
        />
      </div>
    </section>
  );
}
