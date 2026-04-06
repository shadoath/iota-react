import Link from "next/link"
import styles from "../../src/components/LegalPage.module.css"

export default function TermsOfService() {
  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <Link href="/" className={styles.backLink}>
          &larr; Back to game
        </Link>
        <div className={styles.content}>
          <h1>Terms of Service</h1>
          <p className={styles.lastUpdated}>Last updated: April 5, 2026</p>

          <h2>Agreement</h2>
          <p>
            By accessing or playing NodusNexus (&quot;the game&quot;, &quot;the service&quot;), you
            agree to these Terms of Service. If you do not agree, please do not use the service.
          </p>

          <h2>Description of Service</h2>
          <p>
            NodusNexus is a free-to-play digital card game available via web browser. The game
            includes single-player modes against AI opponents, multiplayer modes for playing with
            other users, and various practice and training features.
          </p>

          <h2>User Conduct</h2>
          <p>When using NodusNexus, you agree to:</p>
          <ul>
            <li>Use the service for its intended purpose (playing the game)</li>
            <li>Not attempt to exploit, hack, or interfere with the service</li>
            <li>Not use automated tools or bots to play on your behalf</li>
            <li>Be respectful to other players in multiplayer sessions</li>
            <li>Not use the service for any illegal purpose</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            The NodusNexus name, logo, game design, and all associated content are the property of
            the NodusNexus team. The game&apos;s source code is available under the MIT License.
          </p>

          <h2>Accounts</h2>
          <p>
            NodusNexus can be played without an account. If you choose to create an account, you are
            responsible for maintaining the security of your credentials. We are not liable for any
            loss resulting from unauthorized use of your account.
          </p>

          <h2>Availability</h2>
          <p>
            We strive to keep NodusNexus available at all times but do not guarantee uninterrupted
            access. The service may be temporarily unavailable due to maintenance, updates, or
            circumstances beyond our control.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            NodusNexus is provided &quot;as is&quot; without warranties of any kind. We are not
            liable for any damages arising from your use of the service, including but not limited
            to loss of data, loss of game progress, or interruption of service.
          </p>

          <h2>Modifications</h2>
          <p>
            We reserve the right to modify the game, its features, or these terms at any time.
            Continued use of the service after changes constitutes acceptance of the new terms.
          </p>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate access to the service for users who violate these terms. You
            may stop using the service at any time.
          </p>

          <h2>Governing Law</h2>
          <p>
            These terms are governed by applicable law. Any disputes will be resolved in the
            appropriate jurisdiction.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these terms, please reach out via the contact information on{" "}
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
