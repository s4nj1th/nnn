import type { Metadata } from "next";
import { StaticPageLayout } from "@/components/layout/static-page-layout";

export const metadata: Metadata = {
    title: "Privacy Policy | NNN",
    description:
        "How Neural Network Nook collects, uses, and protects your data.",
};

export default function PrivacyPage() {
    return (
        <StaticPageLayout title="Privacy Policy" updated="June 7, 2026">
            <p>
                Neural Network Nook respects your privacy. This policy explains
                what information we collect when you use our service and how we
                handle it.
            </p>

            <h2>Information We Collect</h2>
            <p>When you create an account or use NNN, we may collect:</p>
            <ul>
                <li>Account details such as your email address and username</li>
                <li>
                    Neural network projects, canvas data, and settings you save
                </li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
                <li>Authenticate your account and secure your projects</li>
            </ul>

            <h2>Data Storage & Security</h2>
            <p>
                Your data is stored using industry-standard infrastructure
                (Supabase). We apply reasonable technical and organizational
                measures to protect your information, though no online service
                can guarantee absolute security.
            </p>

            <h2>Third-Party Services</h2>
            <p>
                NNN uses third-party providers for authentication, database
                hosting, and analytics. These providers process data on our
                behalf under their own privacy policies.
            </p>

            <h2>Your Rights</h2>
            <p>You may:</p>
            <ul>
                <li>Access and update your profile information in Settings</li>
                <li>
                    Delete your account and associated projects by contacting us
                </li>
                <li>Request a copy of your personal data</li>
            </ul>

            <h2>Cookies</h2>
            <p>
                We use essential cookies and local storage to maintain your
                session and preferences (such as theme settings). We do not use
                third-party advertising cookies.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
                NNN is not directed at children under 13. We do not knowingly
                collect personal information from children.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
                We may update this policy from time to time. Continued use of
                NNN after changes constitutes acceptance of the updated policy.
            </p>

            <h2>Contact</h2>
            <p>
                Questions about this policy? Reach us at{" "}
                <a href="mailto:sanjith.develops@gmail.com">
                    sanjith.develops@gmail.com
                </a>
                .
            </p>
        </StaticPageLayout>
    );
}
