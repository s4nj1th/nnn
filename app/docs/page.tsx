import type { Metadata } from 'next';
import Link from 'next/link';
import { StaticPageLayout } from '@/components/layout/static-page-layout';

export const metadata: Metadata = {
  title: 'Documentation – NNN',
  description: 'Learn how to use Neural Network Nook.',
};

const DOC_SECTIONS = [
  {
    title: 'Getting Started',
    description:
      'Create an account, start a new project, and open the canvas editor from your dashboard.',
  },
  {
    title: 'Building Networks',
    description:
      'Add input, hidden, and output neurons. Connect them by dragging from handles. Double-click nodes or edges to edit properties.',
  },
  {
    title: 'Running Simulations',
    description:
      'Press the play button in the toolbar to run forward-pass simulations. Adjust input values on input neurons in the properties panel.',
  },
  {
    title: 'Keyboard Shortcuts',
    description:
      'Press ? in the editor to view all shortcuts. Cmd/Ctrl+S saves your project. Delete removes selected nodes or edges.',
  },
  {
    title: 'Export & Share',
    description:
      'Use the export button to download your network as JSON or SVG. Share links let collaborators view public projects.',
  },
  {
    title: 'Example Templates',
    description:
      'Browse pre-built networks on the Examples page. Open any template to load it into a new project.',
  },
];

export default function DocsPage() {
  return (
    <StaticPageLayout title="Documentation" wide>
      <p>
        Neural Network Nook is a visual editor for designing and exploring neural
        networks. This guide covers the core workflows.
      </p>

      <div className="nnn-docs-grid">
        {DOC_SECTIONS.map((section) => (
          <div key={section.title} className="nnn-docs-card">
            <h3 className="nnn-docs-card-title">{section.title}</h3>
            <p className="nnn-docs-card-desc">{section.description}</p>
          </div>
        ))}
      </div>

      <h2>Quick Links</h2>
      <ul>
        <li>
          <Link href="/examples">Browse example templates</Link>
        </li>
        <li>
          <Link href="/signup">Create a free account</Link>
        </li>
        <li>
          <Link href="/dashboard">Open your dashboard</Link>
        </li>
        <li>
          <a
            href="https://github.com/s4nj1th/nnn"
            target="_blank"
            rel="noopener noreferrer"
          >
            View source on GitHub
          </a>
        </li>
      </ul>

      <h2>Need Help?</h2>
      <p>
        Open an issue on{' '}
        <a
          href="https://github.com/s4nj1th/nnn/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>{' '}
        or email <a href="mailto:support@nnn.dev">support@nnn.dev</a>.
      </p>
    </StaticPageLayout>
  );
}
