import SiteChrome from "@/components/SiteChrome";
import { Container, Pill, Title } from "@/components/ui";

export default function NotFound() {
  return (
    <SiteChrome>
      <Container className="pb-24 pt-14 sm:pt-20">
        <Title plain="Page not" accent="found" />
        <p className="mt-6 max-w-xl text-base text-ink-2 sm:text-lg">We couldn’t find that page. It may have moved when the site was rebuilt.</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Pill href="/">Home</Pill>
          <Pill href="/flags" variant="gray">Flag Registry</Pill>
        </div>
      </Container>
    </SiteChrome>
  );
}
