import SiteChrome from "@/components/SiteChrome";
import { Button, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="py-24 sm:py-32">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red">Page not found</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">We couldn’t find that page.</h1>
        <p className="mt-4 max-w-xl text-lg text-muted">It may have moved when the site was rebuilt.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/">Home</Button>
          <Button href="/flags" variant="secondary">Flag Registry</Button>
        </div>
      </Container>
    </SiteChrome>
  );
}
