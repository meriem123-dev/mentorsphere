import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 px-4 bg-background" id="cta">
      <div className="max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-clair p-12 md:p-20 text-center">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-rose rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary">
              Prêt à lancer votre startup ?
            </h2>
            <p className="text-lg text-base max-w-2xl mx-auto">
              Rejoignez des centaines d'entrepreneurs qui ont transformé leur vision en réalité avec notre plateforme.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Button
                size="lg"
                className="bg-gradient-hero text-white hover:bg-white/90 font-semibold"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}