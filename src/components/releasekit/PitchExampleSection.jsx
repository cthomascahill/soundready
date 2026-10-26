// A filled-in example of the free playlist pitch template, so artists can
// see what "specific" looks like. Names and numbers are illustrative.
const EXAMPLE_PITCH = `Subject: Playlist pitch: "Midnight Drive" by J. Sinclair

Hi Spotify editorial team,

I'm J. Sinclair, a hip-hop artist based in Denver, CO. My new single "Midnight Drive" is out on November 14, and I'd love for you to consider it for Beast Mode.

The song is an upbeat, high-energy hip-hop record built on a driving 808 and a synth hook that feels like a 2 AM highway. It opens cold and hits hard in the first five seconds, with no long intro to skip. It sits in the same lane as J. Cole, Jack Harlow and Cordae.

I think it would sit perfectly on Beast Mode and similar workout playlists because the tempo and energy match the pacing people want mid-set.

A little context: I've grown from 8,000 to 41,000 monthly listeners in six months, opened for Big Ghost at the Bluebird Theater in September, and "Midnight Drive" leads my February EP.

You can hear the track here: [private streaming link].

Thank you for your consideration. I really appreciate you taking the time to listen.

J. Sinclair`;

export default function PitchExampleSection() {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-3">
      <h2 className="font-heading font-bold text-lg">A filled-in example</h2>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Same template, made specific. This level of detail is what gets read.
      </p>
      <pre className="rounded-xl bg-secondary/50 border border-border p-4 text-xs sm:text-sm text-foreground whitespace-pre-wrap leading-relaxed font-body">
        {EXAMPLE_PITCH}
      </pre>
    </section>
  );
}