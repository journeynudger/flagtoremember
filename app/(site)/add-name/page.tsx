import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Form from "@/components/forms/Form";
import { Container, Pill } from "@/components/ui";
import { addName, site } from "@/lib/content";
import { addNameDef } from "@/lib/forms/schema";

export const metadata: Metadata = {
  title: "Add a Name",
  description: addName.lede,
};

export default function AddNamePage() {
  const tapes = addName.nameTapes;
  const pageContent = {
    2: (
      <div className="mb-8">
        <p className="text-base font-medium sm:text-lg">{tapes.intro}</p>
        <Image src={tapes.image.src} alt={tapes.image.alt} width={tapes.image.width} height={tapes.image.height} sizes="(min-width: 1024px) 860px, 100vw" className="mt-4 h-auto w-full" />
        <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">{tapes.guidance}</p>
        <p className="mt-2 text-base text-ink-2 sm:text-lg">
          Example: {tapes.examples.join(", ")}.
        </p>
      </div>
    ),
    3: <p className="mb-8 text-base font-medium leading-relaxed sm:text-lg">{addName.donation.text} You can give on our <Link href="/donate" className="text-teal-edge underline underline-offset-2">donation page</Link> after you register.</p>,
  };

  return (
    <Container className="max-w-[920px] pb-24 pt-14 sm:pt-20">
      <h1 className="text-center text-[2.625rem] font-medium leading-tight">{addName.process.title}</h1>
      <ol className="mx-auto mt-6 max-w-3xl space-y-3 text-center text-base font-semibold leading-relaxed sm:text-lg">
        {addName.process.steps.map((s, i) => (
          <li key={s}>
            {i + 1}. {s}
            {i === 2 && (
              <>
                {" "}
                {addName.process.social.replace(" Instagram and Facebook page.", "")}{" "}
                <a href={site.social[1].url} target="_blank" rel="noopener noreferrer" className="text-teal-edge underline underline-offset-2">Instagram</a> and{" "}
                <a href={site.social[0].url} target="_blank" rel="noopener noreferrer" className="text-teal-edge underline underline-offset-2">Facebook</a> page.
              </>
            )}
          </li>
        ))}
        <li>{addName.process.profile} (See example below.)</li>
      </ol>

      <h2 className="mt-10 text-center text-2xl font-medium">{addName.notes.title}</h2>
      <p className="mx-auto mt-2 max-w-3xl text-center text-base font-semibold leading-relaxed sm:text-lg">
        {addName.notes.text.replace(/email us with your request\.$/, "email")}{" "}
        <a href={`mailto:${site.email}`} className="break-all text-teal-edge underline underline-offset-2">{site.email}</a> with your request.{" "}
        <span className="text-red">*{addName.notes.warning}*</span>
      </p>

      <Image src={addName.process.profileImage.src} alt={addName.process.profileImage.alt} width={addName.process.profileImage.width} height={addName.process.profileImage.height} sizes="20rem" className="mx-auto mt-8 h-auto w-full max-w-[20rem]" />

      <h2 className="mt-10 text-center text-[1.75rem] font-medium">{addName.hosts.title}:</h2>
      <p className="mx-auto mt-2 max-w-3xl text-center text-base font-semibold leading-relaxed sm:text-lg">{addName.hosts.text}</p>

      <div className="mt-14 rounded-[25px] bg-soft p-5 sm:p-10">
        <Form
          def={addNameDef}
          look="plain"
          pageContent={pageContent}
          afterSuccess={
            <div className="space-y-5">
              <p className="text-base text-ink-2 sm:text-lg">{addName.donation.text}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Pill href="/donate">Donate</Pill>
                <Pill href="/name-registry" variant="gray">Name Registry</Pill>
              </div>
            </div>
          }
        />
      </div>
    </Container>
  );
}
