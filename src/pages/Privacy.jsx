import PublicNav from "@/components/public/PublicNav";
import PublicFooter from "@/components/public/PublicFooter";
import SEO from "@/components/SEO";

const Section = ({ title, children }) => (
  <section className="space-y-2">
    <h2 className="font-heading text-lg font-bold text-foreground">{title}</h2>
    <div className="text-sm text-muted-foreground leading-relaxed space-y-3">{children}</div>
  </section>
);

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="SoundReady Privacy Policy"
        description="How SoundReady collects, uses and protects your account, your music and your connected platform data."
      />
      <PublicNav />
      <article className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <header className="space-y-3">
          <p className="text-xs text-primary uppercase tracking-widest font-bold">Legal</p>
          <h1 className="font-heading text-4xl font-bold">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: October 7, 2026</p>
        </header>

        <Section title="Overview">
          <p>
            This Privacy Policy explains how SoundReady ("we", "us") collects, uses and protects your
            information when you use the SoundReady platform, including its AI manager features. By using
            SoundReady, you agree to the practices described here.
          </p>
        </Section>

        <Section title="Information We Collect">
          <p><strong>Account information.</strong> Your name, email address, password (stored only in hashed form), artist profile details and subscription status.</p>
          <p><strong>Content you upload.</strong> Songs, audio files, artwork, lyrics, contracts, royalty statements and other documents you add to your Vault or Storage.</p>
          <p><strong>Connected platform data.</strong> When you connect Spotify, YouTube, Instagram or other platforms, we retrieve and store the statistics you choose to sync, such as listeners, streams and followers.</p>
          <p><strong>Usage information.</strong> How you interact with the service, such as pages visited, features used and diagnostic and log data.</p>
        </Section>

        <Section title="How We Use Your Information">
          <p>We use your information to operate and improve SoundReady, including:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Providing your Vault, Tracker, analytics and collaboration tools</li>
            <li>Generating AI drafts, analyses and recommendations tailored to your real numbers</li>
            <li>Sending service emails such as verification, password reset, subscription notices and the digests you enable</li>
            <li>Processing payments and managing your subscription</li>
            <li>Understanding how the platform is used so we can make it better</li>
          </ul>
        </Section>

        <Section title="AI Features">
          <p>
            SoundReady's AI features (including Sam) process your profile, stats and uploaded content to
            generate drafts, plans and analyses. This content is processed by third-party AI model providers
            solely to produce your results. Your uploaded music is never made public and is never shared with
            other users.
          </p>
        </Section>

        <Section title="How We Share Information">
          <p>
            We do not sell your personal information. We share data only with service providers that help us
            run the platform: payment processing (Stripe), email delivery, cloud hosting, AI model providers
            and analytics tools, each under confidentiality obligations. We may also disclose information when
            required by law or to protect our rights, or in connection with a merger or acquisition.
          </p>
        </Section>

        <Section title="Payments">
          <p>
            Subscriptions and one-time purchases are processed by Stripe. We do not collect or store your
            full card numbers.
          </p>
        </Section>

        <Section title="Data Storage and Security">
          <p>
            Your data is stored on secured cloud infrastructure. Files you upload privately are access
            controlled and served through expiring links. We use reasonable technical and organizational
            measures to protect your information, though no method of transmission or storage is 100% secure.
          </p>
        </Section>

        <Section title="Data Retention">
          <p>
            We keep your account and content while your account is active. If you close your account, we
            delete or de-identify your personal data within a reasonable period, except where retention is
            required for legal, tax or security purposes.
          </p>
        </Section>

        <Section title="Your Choices">
          <p>You can:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Update or correct your profile and artist details at any time</li>
            <li>Connect or disconnect third-party platforms whenever you choose</li>
            <li>Delete songs, documents and other content you have uploaded</li>
            <li>Cancel your subscription at any time from your plan page</li>
            <li>Request deletion of your account by contacting us through the app</li>
          </ul>
        </Section>

        <Section title="Children's Privacy">
          <p>SoundReady is not directed to children under 13, and we do not knowingly collect their personal information.</p>
        </Section>

        <Section title="Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            through the service. Your continued use of SoundReady after an update means you accept the
            revised policy.
          </p>
        </Section>

        <Section title="Contact Us">
          <p>If you have questions about this policy or your data, contact us through the app and we will respond.</p>
        </Section>
      </article>
      <PublicFooter />
    </div>
  );
}