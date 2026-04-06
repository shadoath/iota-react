import Link from "next/link"
import styles from "../../src/components/LegalPage.module.css"

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to game
        </Link>
        <div className={styles.content}>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last updated: April 5, 2026</p>

          <h2>Overview</h2>
          <p>
            NodusNexus (&quot;we&quot;, &quot;our&quot;, &quot;the game&quot;) is committed to
            protecting your privacy. This policy explains what data we collect, how we use it, and
            your rights.
          </p>

          <h2>Data We Collect</h2>

          <h2>Local Storage Data</h2>
          <p>
            The game stores the following data locally on your device using browser localStorage.
            This data never leaves your device unless you explicitly choose to create an account:
          </p>
          <ul>
            <li>Game settings (theme preferences, sound settings, helper toggles)</li>
            <li>Game statistics (scores, win/loss records, achievements)</li>
            <li>Daily challenge history and streaks</li>
            <li>Tutorial completion status</li>
          </ul>

          <h2>Analytics Data (Optional)</h2>
          <p>
            We use PostHog for anonymous analytics to understand how the game is used and improve
            the experience. Analytics data includes:
          </p>
          <ul>
            <li>Game events (start, end, mode selected) — no personal information</li>
            <li>Device type and browser (aggregated, not individually identifying)</li>
            <li>Error reports for debugging</li>
          </ul>
          <p>
            Analytics are anonymous by default. We do not use cookies for tracking. No personal
            information is collected unless you create an account.
          </p>

          <h2>Multiplayer Data</h2>
          <p>
            When using multiplayer features, the following data is temporarily processed on our
            servers during the game session:
          </p>
          <ul>
            <li>Display name you choose when creating or joining a room</li>
            <li>Game moves and scores during the active session</li>
            <li>Connection status for reconnection handling</li>
          </ul>
          <p>
            Multiplayer session data is held in memory only and is not persisted to disk. It is
            automatically deleted when the room closes or after 30 minutes of inactivity.
          </p>

          <h2>Data We Do NOT Collect</h2>
          <ul>
            <li>Email addresses (unless you create an account)</li>
            <li>Real names</li>
            <li>Location data</li>
            <li>Advertising identifiers</li>
            <li>Data from other apps or websites</li>
          </ul>

          <h2>Third-Party Services</h2>
          <ul>
            <li>
              <strong>PostHog</strong> — Anonymous analytics.{" "}
              <a href="https://posthog.com/privacy" target="_blank" rel="noopener noreferrer">
                PostHog Privacy Policy
              </a>
            </li>
            <li>
              <strong>Vercel</strong> — Hosting.{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Vercel Privacy Policy
              </a>
            </li>
          </ul>

          <h2>Children&apos;s Privacy</h2>
          <p>
            NodusNexus does not knowingly collect personal information from children under 13. The
            game can be played without providing any personal information.
          </p>

          <h2>Your Rights</h2>
          <p>You can at any time:</p>
          <ul>
            <li>Clear all local data by clearing your browser&apos;s localStorage for this site</li>
            <li>Disable analytics by using a browser ad-blocker or privacy extension</li>
            <li>Request deletion of any account data by contacting us</li>
          </ul>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Changes will be posted on this page with an
            updated date.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related questions, please reach out via the contact information on{" "}
            <a href="https://nodusnexus.com" target="_blank" rel="noopener noreferrer">
              nodusnexus.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
