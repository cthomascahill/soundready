import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady Terms of Service"
        description="The terms that govern your use of the SoundReady platform and its AI manager features."
      />
      <PublicNav />
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">Legal</p>
          <h1 className="font-heading text-4xl font-bold">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 7, 2026</p>
        </header>

        <Section title="Agreement to Terms">
          <p>
            These Terms of Service govern your access to and use of SoundReady, including its AI manager
            features. By creating an account or using the service, you agree to be bound by these terms. If
            you do not agree, do not use SoundReady.
          </p>
        </Section>

        <Section title="The Service">
          <p>
            SoundReady provides tools for independent artists to organize their music, track releases,
            manage touring and finances, collaborate with their team, and generate AI-assisted drafts and
            recommendations. Features evolve over time, and we may add, change or retire parts of the
            service.
          </p>
        </Section>

        <Section title="Your Account">
          <p>
            You are responsible for your account, keeping your password secure, and for all activity under
            your account. You must provide accurate information and be at least 13 years old. You may not
            share your account credentials with others.
          </p>
        </Section>

        <Section title="Subscriptions, Trials and Billing">
          <p>
            Paid plans are billed through our payment processor on a monthly or yearly basis, as shown at
            checkout. Free trials end automatically and your card is charged at the trial's end unless you
            cancel first. You can cancel anytime; you keep access until the end of the period you already
            paid for. Prices for new subscribers may change, but a price you locked in at signup stays yours
            while your subscription remains active.
          </p>
        </Section>

        <Section title="Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Use SoundReady for any unlawful purpose or to infringe anyone's rights</li>
            <li>Upload content you do not have the rights to</li>
            <li>Attempt to access other users' data, disrupt the service, or circumvent usage limits or access controls</li>
            <li>Reproduce, resell or exploit the service without permission</li>
            <li>Use the AI features to generate abusive, deceptive or infringing content</li>
          </ul>
        </Section>

        <Section title="Your Content">
          <p>
            You keep ownership of everything you upload, including your music, artwork, lyrics and documents.
            You grant SoundReady a limited license to host, store and process that content solely to provide
            the service to you, including running its AI features on your behalf. Your privately uploaded
            files are not shared with other users.
          </p>
        </Section>

        <Section title="AI-Generated Output">
          <p>
            Drafts, analyses, plans and recommendations produced by SoundReady's AI features, including Sam,
            are informational. They may contain inaccuracies and should not be treated as legal, financial or
            professional advice. You are responsible for reviewing every draft before it is sent or acted on.
          </p>
        </Section>

        <Section title="Third-Party Platforms">
          <p>
            SoundReady can connect to third-party platforms such as Spotify and YouTube. Those connections
            depend on those platforms being available and permitting access. Their terms also govern your
            use of their services, and we are not responsible for their actions or changes to their APIs or
            policies.
          </p>
        </Section>

        <Section title="Intellectual Property">
          <p>
            The SoundReady platform, including its software, design and brand, is owned by us and protected
            by intellectual property laws. Nothing in these terms transfers ownership of the platform to you.
          </p>
        </Section>

        <Section title="Disclaimers">
          <p>
            The service is provided "as is" and "as available" without warranties of any kind, whether
            express or implied, including warranties of merchantability, fitness for a particular purpose and
            non-infringement. We do not guarantee any specific results, such as streams, placements, bookings
            or deals.
          </p>
        </Section>

        <Section title="Limitation of Liability">
          <p>
            To the fullest extent permitted by law, SoundReady is not liable for indirect, incidental,
            special or consequential damages, or for lost profits, revenue or data, arising from your use of
            the service. Our total liability for claims related to the service is limited to the amount you
            paid us in the twelve months before the claim.
          </p>
        </Section>

        <Section title="Indemnification">
          <p>
            You agree to indemnify and hold SoundReady harmless from claims, damages and expenses arising
            from your content or your violation of these terms.
          </p>
        </Section>

        <Section title="Termination">
          <p>
            You may stop using SoundReady and delete your account at any time. We may suspend or terminate
            accounts that violate these terms or that create risk or legal exposure for us or other users.
          </p>
        </Section>

        <Section title="Changes to These Terms">
          <p>
            We may update these terms from time to time and will notify you of material changes through the
            service. Your continued use of SoundReady after an update means you accept the revised terms.
          </p>
        </Section>

        <Section title="Governing Law and Contact">
          <p>
            These terms are governed by the laws of the United States, without regard to conflict-of-law
            rules. If you have questions about these terms, contact us through the app.
          </p>
        </Section>
      </article>
      <PublicFooter />
    </div>
  );
}