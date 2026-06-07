import type { Metadata } from 'next';
import { StaticPageLayout } from '@/components/layout/static-page-layout';

export const metadata: Metadata = {
  title: 'Terms of Service – NNN',
  description: 'Terms and conditions for using Neural Network Nook.',
};

export default function TermsPage() {
  return (
    <StaticPageLayout title="Terms of Service" updated="June 7, 2025">
      <p>
        By accessing or using Neural Network Nook (&quot;NNN&quot;), you agree to these
        Terms of Service. If you do not agree, please do not use the service.
      </p>

      <h2>Service Description</h2>
      <p>
        NNN is a visual neural network editor that lets you design, simulate, and
        export network architectures on an interactive canvas. Features may change
        or be discontinued at any time.
      </p>

      <h2>Accounts</h2>
      <ul>
        <li>You must provide accurate registration information</li>
        <li>You are responsible for maintaining the security of your account</li>
        <li>You must be at least 13 years old to create an account</li>
        <li>One person may not maintain more than one free account</li>
      </ul>

      <h2>Your Content</h2>
      <p>
        You retain ownership of the neural network projects and data you create.
        By using NNN, you grant us a limited license to store, process, and display
        your content solely to provide the service.
      </p>

      <h2>Acceptable Use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use NNN for any unlawful purpose</li>
        <li>Attempt to gain unauthorized access to our systems or other accounts</li>
        <li>Upload malicious code or interfere with service operation</li>
        <li>Scrape or automate access beyond normal API usage</li>
        <li>Resell or sublicense the service without permission</li>
      </ul>

      <h2>Intellectual Property</h2>
      <p>
        The NNN platform, including its design, code, branding, and documentation,
        is owned by Neural Network Nook. Open-source components are used under
        their respective licenses.
      </p>

      <h2>Disclaimer</h2>
      <p>
        NNN is provided &quot;as is&quot; without warranties of any kind. We do not
        guarantee uninterrupted access, accuracy of simulations, or fitness for
        a particular purpose. Educational simulations are not production ML systems.
      </p>

      <h2>Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, NNN shall not be liable for any
        indirect, incidental, or consequential damages arising from your use of
        the service.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate your account for violations of these terms.
        You may delete your account at any time. Upon termination, your right to
        use the service ceases immediately.
      </p>

      <h2>Governing Law</h2>
      <p>
        These terms are governed by applicable law in your jurisdiction. Disputes
        will be resolved through good-faith negotiation before formal proceedings.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Contact us at{' '}
        <a href="mailto:legal@nnn.dev">legal@nnn.dev</a>.
      </p>
    </StaticPageLayout>
  );
}
