"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";
import styles from "./page.module.css";

function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 10);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className={cn(
                styles.header,
                scrolled ? styles.headerScrolled : styles.headerTransparent,
            )}
        >
            <nav className={styles.navContainer} aria-label="Main navigation">
                <Link href="/" className={styles.logoLink}>
                    <Brain className={styles.logoIcon} />
                    <span className={styles.logoText}>Neural Network Nook</span>
                </Link>

                <div className={styles.navLinks}>
                    <Link href="/examples" className={styles.navLink}>
                        Examples
                    </Link>
                    <a
                        href="https://github.com/s4nj1th/nnn"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.navLink}
                    >
                        GitHub
                    </a>
                </div>

                <div className={styles.navActions}>
                    <ThemeToggle />
                    <Link href="/dashboard">
                        <Button variant="default" size="sm">
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
}

export default function LandingPage() {
    return (
        <div className={styles.pageContainer}>
            <Navbar />

            <section className={styles.heroSection}>
                <div className={styles.heroContainer}>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className={styles.heroTitle}
                    >
                        Neural Network Architecture Builder
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={styles.heroSubtitle}
                    >
                        A visual editor for designing and analyzing neural
                        networks on an infinite canvas.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className={styles.heroActions}
                    >
                        <Link href="/dashboard">
                            <Button
                                variant="default"
                                size="lg"
                                className={styles.primaryButton}
                            >
                                Get Started
                            </Button>
                        </Link>
                        <Link href="/examples">
                            <Button
                                variant="outline"
                                size="lg"
                                className={styles.secondaryButton}
                            >
                                View Examples
                                <ArrowRight className={styles.buttonIcon} />
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className={styles.screenshotPlaceholder}
                    >
                        <img
                            src="/screenshot-light.png"
                            alt="App screenshot"
                            className={`${styles.screenshotImage} block dark:hidden`}
                        />
                        <img
                            src="/screenshot-dark.png"
                            alt="App screenshot"
                            className={`${styles.screenshotImage} hidden dark:block`}
                        />
                    </motion.div>
                </div>
            </section>

            <section className={styles.featuresSection}>
                <div className={styles.featuresContainer}>
                    <div className={styles.featuresHeader}>
                        <h2 className={styles.featuresTitle}>
                            Professional Tools for Machine Learning
                        </h2>
                        <p className={styles.featuresSubtitle}>
                            Everything you need to design and understand
                            architectures, stripped of distractions.
                        </p>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div>
                            <h3 className={styles.featureItemTitle}>
                                Interactive Canvas
                            </h3>
                            <p className={styles.featureItemDesc}>
                                Infinite pan and zoom workspace with precise
                                node drag, multi-select, and snap-to-grid
                                capabilities.
                            </p>
                        </div>
                        <div>
                            <h3 className={styles.featureItemTitle}>
                                Real-time Propagation
                            </h3>
                            <p className={styles.featureItemDesc}>
                                Execute step-by-step forward passes and monitor
                                activations flowing through your custom network
                                topology.
                            </p>
                        </div>
                        <div>
                            <h3 className={styles.featureItemTitle}>
                                Architecture Export
                            </h3>
                            <p className={styles.featureItemDesc}>
                                Export your network designs as standard JSON
                                schemas, or generate high-quality SVG diagrams
                                for publications.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <footer className={styles.footer}>
                <div className={styles.footerContainer}>
                    <div className={styles.footerLogo}>
                        <Brain className={styles.footerLogoIcon} />
                        <span className={styles.footerLogoText}>
                            Neural Network Nook
                        </span>
                    </div>

                    <div className={styles.footerLinks}>
                        <Link href="/docs" className={styles.footerLink}>
                            Documentation
                        </Link>
                        <Link href="/privacy" className={styles.footerLink}>
                            Privacy
                        </Link>
                        <Link href="/terms" className={styles.footerLink}>
                            Terms
                        </Link>
                        <a
                            href="https://github.com/s4nj1th/nnn"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.footerLink}
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
